import Team from "../models/team.model";
import TeamMembership from "../models/team-membership.model";
import Task from "../models/task.model";
import Project from "../models/project.model"
import asyncHandler from "../utils/asyncHandler";
import apiError from "../utils/apiError";
import apiResponse from "../utils/apiResponse";
import mongoose, { isValidObjectId } from "mongoose";

const createNewTeam = asyncHandler(async (req, res) => {
    const { projectId } = req.params
    const {name}=req.body

    if(!isValidObjectId(projectId)){
        throw new apiError(400, "Invalid project ID")
    }

    if(!name || !name.trim()){
        throw new apiError(400, "Team name is required")
    }

    const project = await Project.findById(projectId)

    if(!project){
        throw new apiError(404, "Project not found")
    }

    const team=await Team.create(
        {
            name,
            project:projectId
        }
    )

    if(!team){
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
    const {teamId} = req.params

    if(!isValidObjectId(teamId)){
        throw new apiError(400, "Invalid team ID")
    }

    const assignedTasks = await Task.aggregate(
        [
            {
                $match:{
                    assignedTo:mongoose.Types.ObjectId(teamId)
                }
            },
            {
                $project:{
                    _id:1
                }
            }
        ]
    )

    if(assignedTasks.length){
        assignedTasks.forEach(async(task)=>{
            await Task.findByIdAndUpdate(
                task._id,
                {
                    assignedTo:null
                }
            )
        })
    }

    await TeamMembership.deleteMany({teamID:{$eq:teamId}})

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

})

const removeTeamMembers = asyncHandler(async (req, res) => {

})

export {
    createNewTeam,
    removeATeam,
    addTeamMembers,
    removeTeamMembers,
}