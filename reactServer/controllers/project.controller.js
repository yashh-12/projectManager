import Project from "../models/project.model.js"
import Team from "../models/team.model.js"
import Task from "../models/task.model.js"
import User from "../models/user.model.js"
import TeamMembership from "../models/team-membership.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import mongoose, { isValidObjectId } from "mongoose"
import { deleteFromClodinary, uploadonCloudinary } from "../utils/cloudinary.js"

const createNewProject = asyncHandler(async (req, res) => {
  const { name, deadline } = req.body

  if (!name?.trim()) {
    throw new apiError(400, "Name is required")
  }

  const project = await Project.create(
    {
      name,
      deadline,
      owner: req?.user?._id,
      isCompleted: false,
    }
  )


  if (!project) {
    throw new apiError(500, "something went wrong while creating new project")
  }

  const newProject = await Project.findOne(project._id)

  // owner.projects = [newProject, ...owner.projects]

  // await owner.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        newProject,
        "New project created successfully"
      )
    )
})

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params

  if (!isValidObjectId(projectId)) {
    throw new apiError(400, "Org ID or Project ID is invalid")
  }

  const session = await Project.startSession();
  try {
    await session.withTransaction(async () => {
      const deletedProject = await Project.findByIdAndDelete(projectId, { session });
      if (!deletedProject) throw new Error("Project not found during transaction");

      const tasksToDelete = await Task.find({ project: projectId }).session(session);
      await Task.deleteMany({ project: projectId }, { session });

      for (const task of tasksToDelete) {
        const deletedTeam = await Team.findOneAndDelete({ taskId: task._id }, { session });
        if (deletedTeam) {
          await TeamMembership.deleteMany({ teamId: deletedTeam._id }, { session });
        }
      }
    });
    console.log("Transaction complete.");
  } catch (error) {
    console.error("Transaction failed:", error);
  } finally {
    session.endSession();
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        204,
        "",
        "Project deleted successfully"
      )
    )
})

const toggleflagIsCompleted = asyncHandler(async (req, res) => {
  const { projectId } = req.params

  if (!isValidObjectId(projectId)) {
    throw new apiError(400, "Invalid project ID")
  }

  const project = await Project.findById(projectId)

  if (!project) {
    throw new apiError(404, "Project not found")
  }

  project.isCompleted = !project.isCompleted

  const updatedProject = await project.save()

  // const updatedProject = await Project.findByIdAndUpdate(
  //     projectId,
  //     {
  //         $set: {
  //             isCompleted: project.isCompleted
  //         }
  //     },
  //     { new: true }
  // )

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        updatedProject,
        updatedProject.isCompleted ? "Project marked as completed" : "Project unmarked from completed list"
      )
    )
})

const updateProjectDetails = asyncHandler(async (req, res) => {
  const { projectId } = req.params
  const { newName, newDeadline } = req.body

  if (!newName && newDeadline) {
    throw new apiError(400, "No field to update")
  }

  if (!isValidObjectId(projectId)) {
    throw new apiError(400, "Invalid project ID")
  }

  const project = await Project.findById(projectId)

  if (newName && newName.trim()) {
    project.name = newName.trim()
  }

  if (newDeadline && newDeadline.trim()) {
    project.deadline = newDeadline.trim()
  }

  const updatedProject = await project.save();

  // const updatedProject = await Project.findByIdAndUpdate(
  //     projectId,
  //     {
  //         $set: {
  //             name: project.name,
  //             deadline: project.deadline
  //         }
  //     },
  //     { new: true }
  // )

  return res
    .status(200)
    .json(new apiResponse(
      200,
      updatedProject,
      "Project details updated"
    ))
})

const addAFile = asyncHandler(async (req, res) => {
  const { projectId } = req.params

  if (!isValidObjectId(projectId)) {
    throw new apiError(400, "Project id Invalid")
  }


  const files = req.files;


  files.forEach(async (element) => {
    const result = await uploadonCloudinary(element.path)

    let response = {
      url: result.url,
      public_key: result.public_id
    }
    let project = await Project.findByIdAndUpdate(projectId, {
      $push: {
        documents: response
      }
    }, { new: true })

  });

  res.status(200).json(new apiResponse(200, {}, "SuccessFull"))

})

const removeAFile = asyncHandler(async (req, res) => {
  const { projectId } = req.params

  const { fileIds } = req.body

  fileIds.forEach(async (fileId) => {
    const project = await Project.findByIdAndUpdate(projectId, {
      $pull: {
        documents: fileId
      }
    }, { new: true })
    deleteFromClodinary(fileId)

  });



  res.status(200).json(new apiResponse(200, {}, "SuccessFull deleted"))



})

const getProjectMetaData = asyncHandler(async (req, res) => {
  const { projectId } = req.params

  if (!isValidObjectId(projectId)) {
    throw new apiError(400, "Invalid project ID")
  }

  const project = await Project.findById(projectId)

  if (!project) {
    throw new apiError(404, "Project not found")
  }

  return res.status(200).json(new apiResponse(200, project, "Project SuccessFully fetched"))

})

const getAllTeams = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!isValidObjectId(projectId)) {
    throw new apiError(400, "Invalid project ID");
  }

  const currentUserId = new mongoose.Types.ObjectId(req.user._id);

  const teams = await Team.aggregate([
    // Filter teams by project
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId)
      }
    },
    // Join with projects to get project data
    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "project"
      }
    },
    { $unwind: "$project" },

    // Join with teammemberships to get membership docs
    {
      $lookup: {
        from: "teammemberships",
        localField: "_id",
        foreignField: "teamID",
        as: "memberships"
      }
    },

    // Join with users to populate team_members
    {
      $lookup: {
        from: "users",
        let: { memberIds: "$memberships.member" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$_id", "$$memberIds"] }
            }
          },
          {
            $project: { name: 1, username: 1, email: 1 }
          }
        ],
        as: "team_members"
      }
    },

    // Join with tasks to get assigned tasks
    {
      $lookup: {
        from: "tasks",
        let: { teamId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$assign", "$$teamId"] }
            }
          },
          {
            $project: {
              _id: 1,
              task: 1,
              details: 1,
              deadline: 1,
              status: 1
            }
          }
        ],
        as: "assigned_tasks"
      }
    },

    // Filter: Only show teams where user is project owner or team member
    {
      $match: {
        $or: [
          { "project.owner": currentUserId },
          { $expr: { $in: [currentUserId, "$team_members._id"] } }
        ]
      }
    },

    // Final result structure
    {
      $project: {
        _id: 1,
        name: 1,
        team_members: 1,
        assigned_tasks: 1,
        project: {
          _id: 1,
          name: 1,
          owner: 1,
          deadline: 1,
          isCompleted: 1
        }
      }
    }
  ]);


  return res
    .status(200)
    .json(new apiResponse(200, teams, "All project teams where user is owner or team member"));
});

const getAllTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!isValidObjectId(projectId)) {
    throw new apiError(400, "Invalid project ID");
  }

  const userId = new mongoose.Types.ObjectId(req.user._id);

  const tasks = await Task.aggregate([
    {
      $match: { project: new mongoose.Types.ObjectId(projectId) }
    },
    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "project"
      }
    },
    { $unwind: "$project" },
    {
      $lookup: {
        from: "teams",
        localField: "assign",
        foreignField: "_id",
        as: "team"
      }
    },
    {
      $unwind: {
        path: "$team",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "teammemberships",
        let: { teamId: "$team._id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$teamID", "$$teamId"] } } },
          { $project: { member: 1, _id: 0 } }
        ],
        as: "team_memberships"
      }
    },
    {
      $addFields: {
        teamMemberIds: {
          $ifNull: [
            {
              $map: {
                input: "$team_memberships",
                as: "tm",
                in: "$$tm.member"
              }
            },
            []
          ]
        }
      }
    },
    {
      $match: {
        $or: [
          { "project.owner": userId },
          { teamMemberIds: { $in: [userId] } }
        ]
      }
    },
    {
      $project: {
        _id: 1,
        task: 1,
        details: 1,
        status: 1,
        deadline: 1,
        project: { _id: 1, name: 1, owner: 1 },
        team: { _id: 1, name: 1 },
        teamMemberIds: 1
      }
    }
  ]);

  return res.status(200).json(
    new apiResponse(200, tasks, "Filtered tasks where user is project owner or team member")
  );
});

const getMyProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    owner: req?.user?._id
  })

  return res.status(200).json(new apiResponse(200, projects, "All my projects"))

})

const getJoinedProjects = asyncHandler(async (req, res) => {
  const projects = await TeamMembership.find({ member: req.user._id }).populate('teamId').populate("project")

  return res.status(200).json(new apiResponse(200, projects, "All joined projects"))

})

const getAllProjects = asyncHandler(async (req, res) => {
  const userId = req.user._id


  const projects = await Project.aggregate([
    { $match: { owner: userId } },
    { $addFields: { role: "Owner" } },

    {
      $unionWith: {
        coll: "teammemberships",
        pipeline: [
          { $match: { member: userId } },

          {
            $lookup: {
              from: "teams",
              localField: "teamID",
              foreignField: "_id",
              as: "team",
            },
          },
          { $unwind: "$team" },

          {
            $lookup: {
              from: "projects",
              localField: "team.project",
              foreignField: "_id",
              as: "project",
            },
          },
          { $unwind: "$project" },

          {
            $addFields: { role: "Team Member" },
          },

          {
            $project: {
              _id: "$project._id",
              name: "$project.name",
              deadline: "$project.deadline",
              isCompleted: "$project.isCompleted",
              owner: "$project.owner",
              documents: "$project.documents",
              createdAt: "$project.createdAt",
              updatedAt: "$project.updatedAt",
              role: 1,
            },
          },
        ],
      },
    },

    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        deadline: { $first: "$deadline" },
        isCompleted: { $first: "$isCompleted" },
        owner: { $first: "$owner" },
        documents: { $first: "$documents" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        role: { $first: "$role" },
      },
    },
  ]);


  return res.status(200).json(new apiResponse(200, projects, "All user projects"))
})

const getProjectOverview = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const taskOverview = await Task.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId)
      }
    },
    {
      $facet: {
        totalTasks: [{ $count: "count" }],
        completedTasks: [
          { $match: { status: true } },
          { $count: "count" }
        ]
      }
    },
    {
      $project: {
        totalTasks: { $ifNull: [{ $arrayElemAt: ["$totalTasks.count", 0] }, 0] },
        completedTasks: { $ifNull: [{ $arrayElemAt: ["$completedTasks.count", 0] }, 0] }
      }
    }
  ]);

  const teamOverview = await Team.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId)
      }
    },
    {
      $facet: {
        totalTeams: [{ $count: "count" }],
        teamIDs: [
          { $project: { _id: 1 } }
        ]
      }
    },
    {
      $unwind: "$teamIDs"
    },
    {
      $lookup: {
        from: "teammemberships",
        localField: "teamIDs._id",
        foreignField: "teamID",
        as: "members"
      }
    },
    {
      $project: {
        teamID: "$teamIDs._id",
        membersCount: { $size: "$members" }
      }
    },
    {
      $group: {
        _id: null,
        totalTeams: { $sum: 1 },
        totalMembers: { $sum: "$membersCount" }
      }
    },
    {
      $project: {
        _id: 0,
        totalTeams: 1,
        totalMembers: 1
      }
    }
  ]);

  const overview = {
    ...taskOverview[0],
    ...(teamOverview[0] || { totalTeams: 0, totalMembers: 0 })
  };

  res.status(200).json(new apiResponse(200, overview, "Project overview"));
});

const markProjectAsCompleted = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findByIdAndUpdate(
    projectId,
    { isCompleted: true },
    { new: true }
  );

  if (!project) {
    throw new apiError(404, "Project not found");
  }

  res.status(200).json(new apiResponse(200, project, "Project marked as completed"));
});

const markedProjectAsIncomplete = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findByIdAndUpdate(
    projectId,
    { isCompleted: false },
    { new: true }
  );

  if (!project) {
    throw new apiError(404, "Project not found");
  }

  res.status(200).json(new apiResponse(200, project, "Project marked as incomplete"));
});


const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const currentUserId = new mongoose.Types.ObjectId(req.user._id);

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new apiError(400, "Invalid Project ID");
  }

  const users = await Project.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(projectId) },
    },
    {
      $lookup: {
        from: "teams",
        localField: "_id",
        foreignField: "project",
        as: "teams",
      },
    },
    {
      $unwind: {
        path: "$teams",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "teammemberships",
        localField: "teams._id",
        foreignField: "teamID",
        as: "teamMembers",
      },
    },
    {
      $unwind: {
        path: "$teamMembers",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$_id",
        owner: { $first: "$owner" },
        members: { $addToSet: "$teamMembers.member" },
      },
    },
    {
      $addFields: {
        allMembers: {
          $setUnion: ["$members", ["$owner"]],
        },
      },
    },
    {
      $project: {
        userIds: {
          $filter: {
            input: "$allMembers",
            as: "uid",
            cond: { $ne: ["$$uid", currentUserId] },
          },
        },
      },
    },
    { $unwind: "$userIds" },
    {
      $lookup: {
        from: "users",
        localField: "userIds",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    { $unwind: "$userDetails" },
    {
      $lookup: {
        from: "chats",
        let: {
          senderId: "$userDetails._id",
          recipientId: currentUserId,
          projectId: new mongoose.Types.ObjectId(projectId),
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$sender", "$$senderId"] },
                  { $eq: ["$recipient", "$$recipientId"] },
                  { $eq: ["$projectId", "$$projectId"] },
                  { $eq: ["$status", "unread"] },
                ],
              },
            },
          },
        ],
        as: "unreadMessages",
      },
    },
    {
      $addFields: {
        unreadCount: { $size: "$unreadMessages" },
      },
    },
    {
      $project: {
        _id: "$userDetails._id",
        name: "$userDetails.name",
        email: "$userDetails.email",
        avatar: "$userDetails.avatar",
        username: "$userDetails.username",
        unreadCount: 1,
      },
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        email: { $first: "$email" },
        avatar: { $first: "$avatar" },
        username: { $first: "$username" },
        unreadCount: { $first: "$unreadCount" },
      },
    }, {
      $sort: { unreadCount: -1 },
    }
  ]);

  return res
    .status(200)
    .json(new apiResponse(200, users, "Unique project users with unread counts"));
});

const getMetadatForDashBoard = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);

  const projects = await Project.aggregate([
    {
      $lookup: {
        from: "tasks",
        localField: "_id",
        foreignField: "project",
        as: "tasks"
      }
    },
    {
      $lookup: {
        from: "teams",
        localField: "_id",
        foreignField: "project",
        as: "teams"
      }
    },
    {
      $unwind: {
        path: "$teams",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "teammemberships",
        let: { teamId: "$teams._id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$teamID", "$$teamId"] },
                  { $eq: ["$member", userId] }
                ]
              }
            }
          }
        ],
        as: "userMemberships"
      }
    },
    {
      $addFields: {
        isUserOwner: { $eq: ["$owner", userId] },
        isUserTeamMember: { $gt: [{ $size: "$userMemberships" }, 0] }
      }
    },
    {
      $match: {
        $or: [
          { isUserOwner: true },
          { isUserTeamMember: true }
        ]
      }
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        tasks: { $first: "$tasks" },
      }
    },
    {
      $addFields: {
        totalTasks: { $size: "$tasks" },
        completedTasks: {
          $size: {
            $filter: {
              input: "$tasks",
              as: "task",
              cond: { $eq: ["$$task.status", true] }
            }
          }
        }
      }
    },
    {
      $addFields: {
        completionPercentage: {
          $cond: [
            { $eq: ["$totalTasks", 0] },
            0,
            {
              $round: [
                {
                  $multiply: [
                    { $divide: ["$completedTasks", "$totalTasks"] },
                    100
                  ]
                },
                0
              ]
            }
          ]
        }
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        totalTasks: 1,
        completedTasks: 1,
        completionPercentage: 1
      }
    }
  ]);

  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.completionPercentage === 100).length;

  return res.status(200).json(
    new apiResponse(200, {
      stats: {
        totalProjects,
        completedProjects
      },
      chartData: projects.map(p => ({
        name: p.name,
        completion: p.completionPercentage ?? 0
      })),
      rawProjects: projects
    }, "Successfully fetched Dashboard Metadata")
  );
});

export {
  createNewProject,
  deleteProject,
  toggleflagIsCompleted,
  updateProjectDetails,
  addAFile,
  removeAFile,
  getProjectMetaData,
  getAllTeams,
  getAllTasks,
  getMyProjects,
  getJoinedProjects,
  getAllProjects,
  getProjectOverview,
  markProjectAsCompleted,
  markedProjectAsIncomplete,
  getProjectMembers,
  getMetadatForDashBoard
}