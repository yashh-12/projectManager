import Team from "../models/team.model.js";
import TeamMembership from "../models/team-membership.model.js";
import Task from "../models/task.model.js";
import Project from "../models/project.model.js"
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";

/**
 * @description Utility function which returns the pipeline stages to fetch the team data object ( { name ( type : string ), project ( type : mongoose.ObjectId ), team_members ( type : Array ( [ Object ( { _id ( type : mongoose.ObjectId ), name ( type : string ), username ( type : string ), email ( type : string ), avatar ( type : Object ) } ) ] ) ) } )
 * @returns {mongoose.PipelineStage[]}
 */
const commonTeamDataPipeline = (teamId) => [
    {
        $match: {
            _id: new mongoose.Types.ObjectId(teamId)
        }
    },
    {
        $lookup: {
            from: "projects",
            localField: "project",
            foreignField: "_id",
            as: "project"
        }
    },
    {
        $addFields: {
            project: { $arrayElemAt: ["$project", 0] }
        }
    },
    {
        $lookup: {
            from: "teammemberships",
            localField: "_id",
            foreignField: "teamID",
            as: "team_members",
            pipeline: [
                {
                    $lookup: {
                        from: "users",
                        localField: "member",
                        foreignField: "_id",
                        as: "userdata"
                    }
                },
                {
                    $addFields: {
                        userdata: { $arrayElemAt: ["$userdata", 0] }
                    }
                },
                {
                    $project: {
                        _id: "$userdata._id",
                        name: "$userdata.name",
                        email: "$userdata.email",
                        username: "$userdata.username"
                        // avatar: "$userdata.avatar" // Uncomment when you support it
                    }
                }
            ]
        }
    },
    {
        $lookup: {
            from: "tasks",
            localField: "_id",
            foreignField: "assign",
            as: "assigned_tasks",
            pipeline: [
                {
                    $project: {
                        task: 1,
                        details: 1,
                        deadline: 1
                    }
                }
            ]
        }
    }
];



const createNewTeam = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { name } = req.body;

    if (!isValidObjectId(projectId)) {
        throw new apiError(400, "Invalid project ID");
    }

    if (!name || !name.trim()) {
        throw new apiError(400, "Team name is required");
    }

    const project = await Project.findById(projectId).lean();

    if (!project) {
        throw new apiError(404, "Project not found");
    }

    const teamWithSameName = await Team.findOne({
        name: name.toLowerCase(),
        project: projectId
    });

    if (teamWithSameName) {
        throw new apiError(400, "Team with same name already exists in the project");
    }

    const team = await Team.create({
        name: name.toLowerCase(),
        project: projectId
    });

    if (!team) {
        throw new apiError(500, "Something went wrong while creating new team");
    }

    const fullTeam = {
        _id: team._id,
        name: team.name,
        project: {
            _id: project._id,
            name: project.name,
            deadline: project.deadline || null,
            isCompleted: project.isCompleted || false,
            owner: project.owner
        },
        team_members: [],
        assigned_tasks: []
    };

    return res.status(200).json(new apiResponse(
        200,
        fullTeam,
        "New team created"
    ));
});


const getTeamMembers = asyncHandler(async (req, res) => {
    const { teamID } = req.params;

    const memberships = await TeamMembership.find({ teamID }).select("member");

    const memberIds = memberships.map((m) => m.member.toString());


    return res
        .status(200)
        .json(new apiResponse(
            200,
            memberIds,
            "all team members"
        ))

})

const removeATeam = asyncHandler(async (req, res) => {
    const { teamId } = req.params

    if (!isValidObjectId(teamId)) {
        throw new apiError(400, "Invalid team ID")
    }

    const doesTeamExist = await Team.findById(teamId)

    if (!doesTeamExist) {
        throw new apiError(404, "Team not found")
    }

    const assignedTasks = await Task.aggregate(
        [
            {
                $match: {
                    assignedTo: new mongoose.Types.ObjectId(teamId)
                }
            },
            {
                $project: {
                    _id: 1
                }
            }
        ]
    )

    if (assignedTasks.length) {
        assignedTasks.forEach(async (task) => {
            await Task.findByIdAndUpdate(
                task._id,
                {
                    assignedTo: null
                }
            )
        })
    }

    await TeamMembership.deleteMany({ teamID: { $eq: teamId } })

    await Team.findByIdAndDelete(teamId)

    return res
        .status(200)
        .json(new apiResponse(
            204,
            "",
            "Team removed successfully"
        ))
})

const addTeamMembers = asyncHandler(async (req, res) => {
    const { teamId } = req.params
    const { members } = req.body

    if (!isValidObjectId(teamId)) {
        throw new apiError(400, "Invalid team ID")
    }

    const doesTeamExist = await Team.findById(teamId)

    if (!doesTeamExist) {
        throw new apiError(404, "Team not found")
    }

    if (!members || !members.length) {
        throw new apiError(400, "Members are required")
    }

    const existingMembers = await TeamMembership.find({ teamID: teamId, member: { $in: members } })
    const existingMembersIds = existingMembers.map((member) => member.member.toString())
    const membersToAdd = members.filter((member) => !existingMembersIds.includes(member.toString()))

    if (membersToAdd.length > 0) {
        await Promise.all(

            membersToAdd.map((member) => {
                TeamMembership.create(
                    {
                        teamID: teamId,
                        member: member
                    }
                )
            }))
    }

    const users = await Promise.all(

        members.map((member) => {
            return User.findOne(
                {

                    _id: member
                }
            )
        }))



    return res
        .status(200)
        .json(new apiResponse(
            200,
            users,
            "Team members added"
        ))
})

const removeTeamMembers = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const { members } = req.body;

    if (!isValidObjectId(teamId)) {
        throw new apiError(400, "Invalid team ID");
    }

    if (!members || !members.length) {
        throw new apiError(400, "Members are required");
    }

    const doesTeamExist = await Team.findById(teamId);

    if (!doesTeamExist) {
        throw new apiError(404, "Team not found");
    }


    await Promise.all(
        members.map(member =>
            TeamMembership.deleteOne({
                teamID: teamId,
                member: new mongoose.Types.ObjectId(member)
            })
        )
    );

    return res.status(200).json(new apiResponse(
        200,
        { members },
        "Team members removed"
    ));
});


const getTeamData = asyncHandler(async (req, res) => {
    const { teamId } = req.params

    const doesTeamExist = await Team.findById(teamId)

    if (!doesTeamExist) {
        throw new apiError(404, "Team not found")
    }

    const team = await Team.aggregate(
        commonTeamDataPipeline(teamId)
    )

    return res
        .status(200)
        .json(new apiResponse(
            200,
            team,
            "Team data with its members and assigned tasks"
        ))
})

const getAllUnassignedUsers = asyncHandler(async (req, res) => {
    const { teamId } = req.params;

    if (!mongoose.isValidObjectId(teamId)) {
        throw new apiError(400, "Invalid project ID");
    }

    const teamMembers = await TeamMembership.find({ teamID: teamId });

    const teamMemberIds = teamMembers.map(t => t.member);

    const users = await User.find({ _id: { $nin: teamMemberIds },isVerified : true });

    res.status(200).json(new apiResponse(200, users, "All unassigned users"));
});

const getAssignedUsers = asyncHandler(async (req, res) => {
    const { teamId } = req.params;

    const allAssignedUsers = await TeamMembership.find({ teamID: teamId })

    const users = await Promise.all(
        allAssignedUsers.map(member => User.findById(member.member))
    );

    const allUsers = users.filter(user => user !== null);




    return res.status(200).json(new apiResponse(200, allUsers, "all Assigned Members"))

})




export {
    createNewTeam,
    removeATeam,
    addTeamMembers,
    removeTeamMembers,
    getTeamData,
    getAllUnassignedUsers,
    getAssignedUsers,
    getTeamMembers
}