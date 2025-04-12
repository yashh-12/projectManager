import mongoose, { isValidObjectId } from "mongoose";
import User from "../models/user.model.js";
import Organization from "../models/organization.model.js"
import asyncHandler from "../utils/asyncHandler.js";

import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import { json } from "express";

const getUserDashboard = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const userdata = await User.aggregate(
        [
            {
              $match: {
                _id: new mongoose.Types.ObjectId(userId),
              },
            },
          
            // Lookup team memberships
            {
              $lookup: {
                from: "teammemberships",
                localField: "_id",
                foreignField: "member",
                as: "memberships",
              },
            },
          
            // Extract teamIDs
            {
              $addFields: {
                teamIDs: {
                  $map: {
                    input: "$memberships",
                    as: "m",
                    in: "$$m.teamID",
                  },
                },
              },
            },
          
            // Lookup full teams
            {
              $lookup: {
                from: "teams",
                localField: "teamIDs",
                foreignField: "_id",
                as: "teams",
              },
            },
          
            // For each team, enrich with:
            // - its project
            // - assigned tasks
            // - other members
            {
              $lookup: {
                from: "projects",
                localField: "teams.project",
                foreignField: "_id",
                as: "projects",
              },
            },
            {
              $lookup: {
                from: "tasks",
                let: { teamIDs: "$teamIDs" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: ["$assign", "$$teamIDs"],
                      },
                    },
                  },
                ],
                as: "tasks",
              },
            },
            {
              $lookup: {
                from: "teammemberships",
                localField: "teamIDs",
                foreignField: "teamID",
                as: "allMemberships",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "allMemberships.member",
                foreignField: "_id",
                as: "allMembers",
              },
            },
            // Map enriched teams
            {
              $addFields: {
                enrichedTeams: {
                  $map: {
                    input: "$teams",
                    as: "team",
                    in: {
                      _id: "$$team._id",
                      name: "$$team.name",
                      project: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$projects",
                              as: "proj",
                              cond: {
                                $eq: [
                                  "$$proj._id",
                                  "$$team.project",
                                ],
                              },
                            },
                          },
                          0,
                        ],
                      },
                      assignedTasks: {
                        $filter: {
                          input: "$tasks",
                          as: "task",
                          cond: {
                            $eq: [
                              "$$task.assign",
                              "$$team._id",
                            ],
                          },
                        },
                      },
                      otherMembers: {
                        $filter: {
                          input: "$allMembers",
                          as: "member",
                          cond: {
                            $and: [
                              {
                                $ne: [
                                  "$$member._id",
                                  "$_id",
                                ],
                              },
                              {
                                $in: [
                                  "$$team._id",
                                  {
                                    $map: {
                                      input: {
                                        $filter: {
                                          input:
                                            "$allMemberships", // ✅ correct: all user-team pairs
                                          as: "mem",
                                          cond: {
                                            $eq: [
                                              "$$mem.member",
                                              "$$member._id",
                                            ],
                                          },
                                        },
                                      },
                                      as: "mem",
                                      in: "$$mem.teamID",
                                    },
                                  },
                                ],
                              },
                            ],
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          
            // Add counts
            {
              $addFields: {
                teamCount: { $size: "$enrichedTeams" },
                projectCount: {
                  $size: {
                    $setUnion: {
                      $map: {
                        input: "$enrichedTeams",
                        as: "t",
                        in: "$$t.project._id",
                      },
                    },
                  },
                },
                taskCount: {
                  $size: {
                    $reduce: {
                      input: "$enrichedTeams",
                      initialValue: [],
                      in: {
                        $concatArrays: [
                          "$$value",
                          "$$this.assignedTasks",
                        ],
                      },
                    },
                  },
                },
              },
            },
          
            // Final projection
            {
              $project: {
                _id: 1,
                name: 1,
                username: 1,
                email: 1,
                organization: 1,
                teamCount: 1,
                projectCount: 1,
                taskCount: 1,
                teams: "$enrichedTeams"
              },
            },
          ]
    )

    return res
    .status(200)
    .json(new apiResponse(
        200,
        userdata.length?userdata[0]:{},
        "User's dashboard"
    ))
})

const getOrganizationDashboard = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const orgId = req.user.organization

    if(!orgId){
      return res
      .status(400)
      .json(new apiError(400, "User doesn't have an organization"))
    }

    if(!isValidObjectId(orgId)){
        return res
        .status(400)
        .json(new apiError(400, "invalid org id"))
    }

    const organization = await Organization.aggregate(
        [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(orgId),
                },
            },
            {
                $lookup: {
                    from: "projects",
                    localField: "_id",
                    foreignField: "organization",
                    as: "projects",
                    pipeline: [
                        {
                            $project: {
                                organization: 0,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: {
                    path: "$projects",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "tasks",
                    localField: "projects._id",
                    foreignField: "project",
                    as: "projects.tasks",
                },
            },
            {
                $lookup: {
                    from: "teams",
                    localField: "projects._id",
                    foreignField: "project",
                    as: "projects.teams",
                },
            },
            {
                $unwind: {
                    path: "$projects.teams",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "teammemberships",
                    localField: "projects.teams._id",
                    foreignField: "teamID",
                    as: "projects.teams.members",
                },
            },
            {
                $unwind: {
                    path: "$projects.teams.members",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "projects.teams.members.member",
                    foreignField: "_id",
                    as: "projects.teams.members.member",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                username: 1,
                                email: 1,
                            },
                        },
                    ],
                },
            },
            {
                $addFields: {
                    "projects.teams.members.member": {
                        $arrayElemAt: [
                            "$projects.teams.members.member",
                            0,
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: {
                        orgId: "$_id",
                        projectId: "$projects._id",
                        teamId: "$projects.teams._id",
                    },
                    name: { $first: "$name" },
                    projectName: { $first: "$projects.name" },
                    tasks: { $first: "$projects.tasks" },
                    teamName: {
                        $first: "$projects.teams.name",
                    },
                    members: {
                        $push: "$projects.teams.members",
                    },
                },
            },
            {
                $group: {
                    _id: {
                        orgId: "$_id.orgId",
                        projectId: "$_id.projectId",
                    },
                    name: { $first: "$name" },
                    projectName: { $first: "$projectName" },
                    tasks: { $first: "$tasks" },
                    teams: {
                        $push: {
                            _id: "$_id.teamId",
                            name: "$teamName",
                            members: "$members",
                        },
                    },
                },
            },
            {
                $group: {
                    _id: "$_id.orgId",
                    name: { $first: "$name" },
                    projects: {
                        $push: {
                            name: "$projectName",
                            tasks: "$tasks",
                            teams: "$teams",
                        },
                    },
                },
            },
            {
                $project: {
                    name: 1,
                    projects: 1,
                    totalProjects: { $size: "$projects" },
                    allTasks: {
                        $reduce: {
                            input: "$projects",
                            initialValue: [],
                            in: {
                                $concatArrays: [
                                    "$$value",
                                    "$$this.tasks",
                                ],
                            },
                        },
                    },
                    allTeams: {
                        $reduce: {
                            input: "$projects",
                            initialValue: [],
                            in: {
                                $concatArrays: [
                                    "$$value",
                                    {
                                        $filter: {
                                            input: "$$this.teams",
                                            as: "team",
                                            cond: {
                                                $and: [
                                                    {
                                                        $ne: [
                                                            "$$team.name",
                                                            null,
                                                        ],
                                                    },
                                                    {
                                                        $ne: [
                                                            "$$team.members",
                                                            null,
                                                        ],
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    allMembers: {
                        $reduce: {
                            input: {
                                $reduce: {
                                    input: "$projects",
                                    initialValue: [],
                                    in: {
                                        $concatArrays: [
                                            "$$value",
                                            {
                                                $filter: {
                                                    input: "$$this.teams",
                                                    as: "team",
                                                    cond: {
                                                        $and: [
                                                            {
                                                                $ne: [
                                                                    "$$team.name",
                                                                    null,
                                                                ],
                                                            },
                                                            {
                                                                $ne: [
                                                                    "$$team.members",
                                                                    null,
                                                                ],
                                                            },
                                                            {
                                                                $gt: [
                                                                    {
                                                                        $size: {
                                                                            $filter: {
                                                                                input:
                                                                                    "$$team.members",
                                                                                as: "member",
                                                                                cond: {
                                                                                    $ne: [
                                                                                        "$$member",
                                                                                        {},
                                                                                    ],
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                    0,
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            },
                            initialValue: [],
                            in: {
                                $concatArrays: [
                                    "$$value",
                                    {
                                        $filter: {
                                            input: "$$this.members",
                                            as: "m",
                                            cond: { $ne: ["$$m", {}] },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    name: 1,
                    projects: 1,
                    projectCount: 1,
                    taskCount: { $size: "$allTasks" },
                    teamCount: { $size: "$allTeams" },
                    uniqueMembers: {
                        $size: {
                            $setUnion: {
                                $map: {
                                    input: {
                                        $filter: {
                                            input: "$allMembers",
                                            as: "m",
                                            cond: {
                                                $ne: ["$$m.member._id", null],
                                            },
                                        },
                                    },
                                    as: "m",
                                    in: "$$m.member._id",
                                },
                            },
                        },
                    },
                },
            },
        ]
    )

    return res
        .status(200)
        .json(new apiResponse(
            200,
            organization.length?organization[0]:{},
            "User's organization dashboard"
        ))
})

export {
    getUserDashboard,
    getOrganizationDashboard,
}