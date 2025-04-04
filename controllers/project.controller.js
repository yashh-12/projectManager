import Project from "../models/project.model.js"
import Organization from "../models/organization.model.js"
import Team from "../models/team.model.js"
import Task from "../models/task.model.js"
import TeamMembership from "../models/team-membership.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import mongoose, { isValidObjectId } from "mongoose"
import { deleteFromClodinary, uploadonCloudinary } from "../utils/cloudinary.js"

const createNewProject = asyncHandler(async (req, res) => {
    const { orgId } = req.params
    const { name, deadline } = req.body

    // console.log("Request came");


    if (!name?.trim()) {
        throw new apiError(400, "Name is required")
    }

    if (!isValidObjectId(orgId)) {
        throw new apiError(400, "Invalid organization ID")
    }

    const owner = await Organization.findById(orgId)


    if (!owner) {
        return res.render("/projects/allProjects",{hasOrganization:false})
    }

    

    const project = await Project.create(
        {
            name,
            deadline,
            isCompleted: false,
        }
    )
    // console.log("Project created");
    

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

    const teams=await Team.aggregate(
        [
            {
                $match:{
                    project:mongoose.Types.ObjectId(projectId)
                }
            },
            {
                $project:{
                    _id:1,
                    name:0,
                    project:0
                }
            }
        ]
    )

    if(teams.length){
        teams.forEach(async(team)=>{
            await TeamMembership.deleteMany({teamID:{ $eq: team._id }})
            await Team.deleteOne(team._id)
        })
    }

    await Task.deleteMany({project:{ $eq: projectId }})

    // if (project.teams.length()) {
    //     for (let i = 0; i < project.teams.length(); i++) {
    //         await TeamMembership.deleteMany({ teamId: project.teams[i] })
    //     }
    //     await Team.deleteMany({ project: { $eq: projectId } })
    // }

    // if (project.tasks.length()) {
    //     await Task.deleteMany({ project: { $eq: projectId } })
    // }

    if (project.documents.length()) {
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
    const { projectId } = req.params

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

    const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        {
            $set: {
                name: project.name,
                deadline: project.deadline
            }
        },
        { new: true }
    )

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

    if (isValidObjectId(projectId)) {
        throw new apiError(400,"Project id Invalid")
    }

  


    const response = await uploadonCloudinary(req?.file?.path)
    console.log(response);

    if(response)
        throw new apiError(400,"Upload failed")

    const document = {
        url:response.url,
        public_id:response.public_id
    }

    const project = await Project.findByIdAndUpdate(projectId,{
        $push:{
            documents:document
        }
    },{new:true})

    if(project)
        throw new apiError(400,"Upload failed")


    res.status(200).json(new apiResponse(200,project,"SuccessFull"))
    
    

    
})

const removeAFile = asyncHandler(async (req, res) => {
    const { projectId } = req.params

    const { fileId } = req.body

    const project = await Project.findByIdAndUpdate(projectId,{
        $pull:{
            documents:fileId
        }
    },{new:true})

    const deleted = deleteFromClodinary(fileId)

    if(deleted){
        throw new apiError(200,deleted,"file Deleted")
    }

    res.status(200).json(new apiResponse(200,project,"SuccessFull deleted"))

    

})

const getProjectMetaData = asyncHandler(async (req, res) => {
    const {projectId} = req.params

    if(!isValidObjectId(projectId)){
        throw new apiError(400, "Invalid project ID")
    }

    const project = await Project.findById(projectId)

    if(!project){
        throw new apiError(404, "Project not found")
    }

    
    

})

const getAllTeams = asyncHandler(async (req, res) => {
    const {projectId} = req.params

    if(!isValidObjectId(projectId)){
        throw new apiError(400, "Invalid project ID")
    }

    const teams = await Team.aggregate(
        [
            {
                $match:{
                    project:mongoose.Types.ObjectId(projectId)
                }
            },
            {
                $project:{
                    _id:1,
                    name:1
                }
            }
        ]
    )

    return res
    .status(200)
    .json(new apiResponse(
        200,
        teams,
        "All project teams"
    ))
})

const getAllTasks = asyncHandler(async (req, res) => {
    const {projectId} = req.params

    if(!isValidObjectId(projectId)){
        throw new apiError(400, "Invalid project ID")
    }

    const tasks = await Task.aggregate(
        [
            {
                $match:{
                    project:new mongoose.Types.ObjectId(projectId)
                }
            },
            {
                $lookup:{
                    from: "teams",
                    foreignField: "_id",
                    localField: "assign",
                    as: "assign",
                    pipeline:[
                        {
                            $project:{
                                name:1
                            }
                        }
                    ]
                }
            },
            {
                $addFields:{
                    assign:{
                        $arrayElemAt:["$assign",0]
                    }
                }
            },
            {
                $project:{
                    _id:1,
                    task:1,
                    details:1,
                    assign:1,
                    deadline:1
                }
            }
        ]
    )

    return res
    .status(200)
    .json(new apiResponse(
        200,
        tasks,
        "All project tasks"
    ))
})


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
}