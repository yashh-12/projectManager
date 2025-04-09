import { Router } from "express"
import isOwner from "../middelware/isOwner.js"
import {
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
    getProjectMembers
} from "../controllers/project.controller.js"
import { upload } from "../middelware/multer.js"

const router = Router()

router.route("/create").post(createNewProject)
router.route("/:projectId/delete").delete(isOwner, deleteProject)
router.route("/:projectId/toggleIsCompleted").post( isOwner,toggleflagIsCompleted)
router.route("/:projectId/updateDetails").post( isOwner, updateProjectDetails)
router.route("/:projectId/addFile").post(upload.array("document",5) ,addAFile)
router.route("/:projectId/removeAFile").delete( isOwner, removeAFile)
router.route("/:projectId/getProjectMetaData").get(getProjectMetaData)
router.route("/:projectId/getAllTeams").get(getAllTeams)
router.route("/:projectId/getAllTasks").get(getAllTasks)
router.route("/myProjects").get(getMyProjects)
router.route("/joinedProjects").get(getJoinedProjects)
router.route("/allProjects").get(getAllProjects)
router.route("/:projectId/getProjectOverview").get(getProjectOverview)
router.route("/:projectId/markAsCompleted").post(markProjectAsCompleted)
router.route("/:projectId/markAsIncomplete").post(markProjectAsCompleted) 
router.route("/:projectId/getProjectMembers").get(getProjectMembers)



export default router
