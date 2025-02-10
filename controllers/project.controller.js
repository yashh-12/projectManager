import Project from "../models/project.model.js"
import Organization from "../models/organization.model.js"
import Team from "../models/team.model.js"
import Task from "../models/task.model.js"
import TeamMembership from "../models/team-membership.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import mongoose, { isValidObjectId } from "mongoose"

const createNewProject = asyncHandler(async (req, res) => {
    const { orgId } = req.params
    const { name, deadline } = req.body

    if (!name.trim()) {
        throw new apiError(400, "Name is required")
    }

    if (!isValidObjectId(orgId)) {
        throw new apiError(400, "Invalid organization ID")
    }

    const owner = await Organization.findById(orgId)

    if (!owner) {
        throw new apiError(404, "Organization not found")
    }

    const project = await Project.create(
        {
            name,
            deadline,
            isCompleted: false,
        }
    )

    if (!project) {
        throw new apiError(500, "something went wrong while creating new project")
    }

    const newProject = await Project.findOne(project._id)

    owner.projects = [newProject, ...owner.projects]

    await owner.save({ validateBeforeSave: false });

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
    const { orgId, projectId } = req.params

    if (!isValidObjectId(orgId) || !isValidObjectId(projectId)) {
        throw new apiError(400, "Org ID or Project ID is invalid")
    }

    const owner = await Organization.findOne(orgId)

    const project = await Project.findOne(projectId)

    if (!project) {
        throw new apiError(404, "Project not found")
    }

    if (project.teams.length()) {
        for (let i = 0; i < project.teams.length(); i++) {
            await TeamMembership.deleteMany({ teamId: project.teams[i] })
        }
        await Team.deleteMany({ project: { $eq: projectId } })
    }

    if (project.tasks.length()) {
        await Task.deleteMany({ project: { $eq: projectId } })
    }

    if (project.decuments.length()) {
        // todo : To delete all the files from cloudinary
    }

    owner.projects = owner.projects.filter((p) => (p !== projectId))

    await owner.save({ validateBeforeSave: false })

    await Project.deleteOne(projectId)

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
    const { projectId } = req.paarams

    if (!isValidObjectId(projectId)) {
        throw new apiError(400, "Invalid project ID")
    }

    const project = await Project.findOne(projectId)

    if (!project) {
        throw new apiError(404, "Project not found")
    }

    project.isCompleted = !project.isCompleted

    const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        {
            $set: {
                isCompleted: project.isCompleted
            }
        },
        { new: true }
    )

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

})

const addATeam = asyncHandler(async(req, res)=>{

})

const removeATeam = asyncHandler(async (req, res) => {

})

const addATask = asyncHandler(async(req, res)=>{

})

const removeATask = asyncHandler(async (req, res) => {

})

const addAFile = asyncHandler(async(req, res)=>{

})

const removeAFile = asyncHandler(async (req, res) => {

})

export {
    createNewProject,
    deleteProject,
    toggleflagIsCompleted,
    updateProjectDetails,
    addATeam,
    removeATeam,
    addATask,
    removeATask,
    addAFile,
    removeAFile
}