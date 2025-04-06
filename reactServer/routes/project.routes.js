import { Router } from "express"
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
} from "../controllers/project.controller.js"
import { upload } from "../middelware/multer.js"

const router = Router()

router.route("/create").post(createNewProject)
router.route("/:projectId/delete").delete( deleteProject)
router.route("/:projectId/toggleIsCompleted").post( toggleflagIsCompleted)
router.route("/:projectId/updateDetails").post( updateProjectDetails)
router.route("/:projectId/addFile").post(upload.array("document",5) ,addAFile)
router.route("/:projectId/removeAFile").delete( removeAFile)
router.route("/:projectId/getProjectMetaData").get(getProjectMetaData)
router.route("/:projectId/getAllTeams").get(getAllTeams)
router.route("/:projectId/getAllTasks").get(getAllTasks)
router.route("/myProjects").get(getMyProjects)
router.route("/joinedProjects").get(getJoinedProjects)
router.route("/allProjects").get(getAllProjects)
router.route("/:projectId/getProjectOverview").get(getProjectOverview) 



export default router
