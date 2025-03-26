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
} from "../controllers/project.controller.js"
import { upload } from "../middelware/multer.js"

const router = Router()

router.route("/:orgId/").post(createNewProject)
router.route("/:orgId/:projectId").delete( deleteProject)
router.route("/:orgId/:projectId/toggleIsCompleted").post( toggleflagIsCompleted)
router.route("/:orgId/:projectId/updateDetails").post( updateProjectDetails)
router.route("/:projectId/addFile").post(upload.single("document") ,addAFile)
router.route("/:projectId/removeAFile").delete( removeAFile)
router.route("/:orgId/:projectId/getProjectMetaData").get(getProjectMetaData)
router.route("/:orgId/:projectId/getAllTeams").get(getAllTeams)
router.route("/:orgId/:projectId/getAllTasks").get(getAllTasks)


export default router
