import Task from "../models/task.model";
import asyncHandler from "../utils/asyncHandler";
import apiError from "../utils/apiError";
import apiResponse from "../utils/apiResponse";
import mongoose, { isValidObjectId } from "mongoose";

const createNewTask = asyncHandler(async (req, res) => {
    const { projectId } = req.params
    const { task, details, assign, deadline } = req.body

    if (!isValidObjectId(projectId)) {
        throw new apiError(400, "Invalid project ID")
    }

    if (!task || !task.trim()) {
        throw new apiError(400, "Task is required")
    }

    if (!details || !details.trim()) {
        throw new apiError(400, "Details are required")
    }

    const doesTaskAlreadyExist = await Task.findOne({ $and: [{ task: task.trim().toLowerCase() }, { project: mongoose.Types.ObjectId(projectId) }] })

    if (doesTaskAlreadyExist) {
        throw new apiError(400, "Task with same name already exists in the project")
    }

    const newTask = await Task.create(
        {
            task: task.trim(),
            project: projectId,
            details: details.trim(),
            assign: assign || "",
            deadline: deadline || ""
        }
    )

    if (!newTask) {
        throw new apiError(500, "Something went wrong while creating new task")
    }

    return res
        .status(200)
        .json(new apiResponse(
            200,
            newTask,
            "New task created"
        ))
})

const removeATask = asyncHandler(async (req, res) => {
    const { taskId } = req.params

    if (!isValidObjectId) {
        throw new apiError(400, "Invalid task ID")
    }

    const task = await Task.findById(taskId)

    if (!task) {
        throw new apiError(404, "Task not found")
    }

    await Task.deleteOne(taskId)

    return res
        .status(200)
        .json(new apiResponse(
            204,
            "",
            "Task removed"
        ))
})

const assignTaskToTeam = asyncHandler(async (req, res) => {
    const { taskId } = req.params
    const { teamId } = req.body

    if(!isValidObjectId(taskId)){
        throw new apiError(400, "Invalid task ID")
    }

    if(!isValidObjectId(teamId)){
        throw new apiError(400, "Invalid team ID")
    }

    const task = await Task.findByIdAndUpdate(
        taskId,
        {
            $set:{
                assign: teamId
            }
        },
        {new:true}
    )

    if(!task){
        throw new apiError(404, "Task not found")
    }

    return res
    .status(200)
    .json(new apiResponse(
        200,
        task,
        "Task assigned"
    ))
})

export {
    createNewTask,
    removeATask,
    assignTaskToTeam,
}