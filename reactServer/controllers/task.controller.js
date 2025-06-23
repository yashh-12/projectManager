import Task from "../models/task.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
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

    const doesTaskAlreadyExist = await Task.findOne({ $and: [{ task: task.trim().toLowerCase() }, { project: new mongoose.Types.ObjectId(projectId) }] })

    if (doesTaskAlreadyExist) {
        throw new apiError(400, "Task with same name already exists in the project")
    }

    const newTask = await Task.create(
        {
            task: task.trim(),
            project: projectId,
            details: details.trim(),
            assign: assign,
            deadline: deadline || Date.now()
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

    if (!isValidObjectId(taskId)) {
        throw new apiError(400, "Invalid task ID")
    }

    const task = await Task.findById(taskId)

    if (!task) {
        throw new apiError(404, "Task not found")
    }

    await Task.findByIdAndDelete(taskId)

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

    if (!isValidObjectId(taskId)) {
        throw new apiError(400, "Invalid task ID")
    }

    if (!isValidObjectId(teamId)) {
        throw new apiError(400, "Invalid team ID")
    }

    const task = await Task.findByIdAndUpdate(
        taskId,
        {
            $set: {
                assign: teamId
            }
        },
        { new: true }
    )

    if (!task) {
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

const removeTeam = asyncHandler(async (req, res) => {

    const { taskId } = req.params
    if (!isValidObjectId(taskId)) {
        throw new apiError(400, "Invalid task ID")
    }
   
    const task = await Task.findByIdAndUpdate(taskId, {
        $set: {
            assign: null
        }
    }, { new: true })
    if (!task) {
        throw new apiError(404, "Task not found")

    }

    return res.status(200).json(new apiResponse(200, task, "Task unassigned"))
})

const modifyTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params
    const { task, details, deadline } = req.body
    if (!isValidObjectId(taskId)) {
        throw new apiError(400, "Invalid task ID")
    }
    if (!task || !task.trim()) {
        throw new apiError(400, "Task is required")
    }
    if (!details || !details.trim()) {
        throw new apiError(400, "Details are required")
    }
    const doesTaskAlreadyExist = await Task.findOne({ $and: [{ task: task.trim().toLowerCase() }, { _id: { $ne: taskId } }] })
    if (doesTaskAlreadyExist) {
        throw new apiError(400, "Task with same name already exists in the project")
    }
    const updatedTask = await Task.findByIdAndUpdate(taskId, {
        $set: {
            task: task.trim(),
            details: details.trim(),
            deadline: deadline || Date.now()
        }
    },
        {
            new: true
        }
    )
    if (!updatedTask) {
        throw new apiError(404, "Task not found")
    }
    return res.status(200).json(new apiResponse(200, updatedTask, "Task updated"))
})

const getTaskData = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    if (!isValidObjectId(taskId)) {
        throw new apiError(400, "Invalid task ID");
    }

    const taskExists = await Task.findById(taskId);
    if (!taskExists) {
        throw new apiError(404, "Task not found");
    }

    const taskDetails = await Task.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(taskId) }
        },
        {
            $lookup: {
                from: "teams",
                localField: "assign",
                foreignField: "_id",
                as: "assigned_team"
            }
        },
        {
            $unwind: {
                path: "$assigned_team",
                preserveNullAndEmptyArrays: true 
            }
        },
        {
            $lookup: {
                from: "teammemberships",
                localField: "assigned_team._id",
                foreignField: "teamID",
                as: "team_memberships"
            }
        },
        {
            $lookup: {
                from: "users",
                let: { memberIds: "$team_memberships.member" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$_id", "$$memberIds"] }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            username: 1,
                            email: 1
                        }
                    }
                ],
                as: "assigned_team.team_members"
            }
        },
        {
            $project: {
                _id: 1,
                task: 1,
                details: 1,
                status: 1,
                deadline: 1,
                "assigned_team._id": 1,
                "assigned_team.name": 1,
                "assigned_team.team_members": 1
            }
        }
    ]);


    return res
        .status(200)
        .json(new apiResponse(200, taskDetails[0], "Task details with team members"));
});

const toggleTaskStatus = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    if (!isValidObjectId(taskId)) {
        throw new apiError(400, "Invalid task ID");
    }

    const doesTaskExist = await Task.findById(taskId);

    const task = await Task.findByIdAndUpdate(
        taskId,
        { status: !doesTaskExist.status },
        { new: true }
    );

    if (!task) {
        throw new apiError(404, "Task not found");
    }

    return res.status(200).json(new apiResponse(200, task, "Task status toggled"));
});

const modifyTaskDeadline = asyncHandler(async(req,res) => {
    const {taskId} = req.params
    if (!isValidObjectId(taskId)) {
        throw new apiError(500,"Taskid is invalid")

    }
    const {newDeadline} = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
        throw new apiError(500,"Task not found")
    }

    task.deadline = newDeadline;
    const newTask = await task.save()

    if(!newTask){
        throw new apiError(500,"updation Failed")
    }

    return res.status(200).json(new apiResponse(200,newTask,"successfully modified"))
})
export {
    createNewTask,
    removeATask,
    assignTaskToTeam,
    removeTeam,
    modifyTask,
    getTaskData,
    toggleTaskStatus,
    modifyTaskDeadline
}