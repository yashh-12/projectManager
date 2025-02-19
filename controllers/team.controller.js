import Team from "../models/team.model";
import TeamMembership from "../models/team-membership.model";
import Task from "../models/task.model";
import Project from "../models/project.model"
import asyncHandler from "../utils/asyncHandler";
import apiError from "../utils/apiError";
import apiResponse from "../utils/apiResponse";
import mongoose, { isValidObjectId } from "mongoose";

/**
 * @description Utility function which returns the pipeline stages to fetch the team data object ( { name ( type : string ), project ( type : mongoose.ObjectId ), team_members ( type : Array ( [ Object ( { _id ( type : mongoose.ObjectId ), name ( type : string ), username ( type : string ), email ( type : string ), avatar ( type : Object ) } ) ] ) ) } )
 * @returns {mongoose.PipelineStage[]}
 */
const commonTeamDataPipeline = (teamId) => (
    [
        {
            $match: {
                _id: mongoose.Types.ObjectId(teamId)
            }
        },
        {
            $lookup: {
                from: "teammemberships",
                foreignField: "teamID",
                localField: "_id",
                as: "team_members",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            foreignField: "_id",
                            localField: "member",
                            as: "userdata"
                        }
                    },
                    {
                        $addFields: {
                            userdata: {
                                $arrayElemAt: ["$userdata", 0]
                            }
                        }
                    },
                    {
                        $addFields: {
                            _id: "$userdata._id",
                            name: "$userdata.name",
                            email: "$userdata.email",
                            username: "$userdata.username",
                            // avatar:"$userdata.avatar"    //todo
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            username: 1,
                            email: 1,
                            // avatar:1     //todo
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "tasks",
                foreignField: "assign",
                localField: "_id",
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
    ]
)

const createNewTeam = asyncHandler(async (req, res) => {
    const { projectId } = req.params
    const { name } = req.body

    if (!isValidObjectId(projectId)) {
        throw new apiError(400, "Invalid project ID")
    }

    if (!name || !name.trim()) {
        throw new apiError(400, "Team name is required")
    }

    const project = await Project.findById(projectId)

    if (!project) {
        throw new apiError(404, "Project not found")
    }

    const teamWithSameName = await Team.findOne({ $and: { name: name.toLowerCase(), project: mongoose.Types.ObjectId(projectId) } })

    if (teamWithSameName) {
        throw new apiError(400, "Team with same name already exists in the project")
    }

    const team = await Team.create(
        {
            name: name.toLowerCase(),
            project: projectId
        }
    )

    if (!team) {
        throw new apiError(500, "Something went wrong while creating new team")
    }

    return res
        .status(200)
        .json(new apiResponse(
            200,
            team,
            "New team created"
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
                    assignedTo: mongoose.Types.ObjectId(teamId)
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

    await Team.deleteOne(teamId)

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

    members.forEach(async (member) => {
        const membership = await TeamMembership.create(
            {
                teamID: teamId,
                member: member
            }
        )
    })

    const team = await Team.aggregate(
        commonTeamDataPipeline(teamId)
    )

    return res
        .status(200)
        .json(new apiResponse(
            200,
            team,
            "Team members added"
        ))
})

const removeTeamMembers = asyncHandler(async (req, res) => {
    const { teamId } = req.params
    const { members } = req.body

    if (!isValidObjectId(teamId)) {
        throw new apiError(400, "Invalid team ID")
    }

    if (!members || !members.length) {
        throw new apiError(400, "Members are required")
    }

    const doesTeamExist = await Team.findById(teamId)

    if (!doesTeamExist) {
        throw new apiError(404, "Team not found")
    }

    members.forEach(async (member) => {
        await TeamMembership.deleteOne({ member: mongoose.Types.ObjectId(member) })
    })

    const team = await Team.aggregate(
        commonTeamDataPipeline(teamId)
    )

    return res
        .status(200)
        .json(new apiResponse(
            200,
            team,
            "Team members removed"
        ))
})

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

export {
    createNewTeam,
    removeATeam,
    addTeamMembers,
    removeTeamMembers,
    getTeamData
}