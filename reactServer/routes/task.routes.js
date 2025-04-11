import { Router } from "express";
import { createNewTask, removeATask, assignTaskToTeam, removeTeam,modifyTask,getTaskData, toggleTaskStatus, modifyTaskDeadline } from "../controllers/task.controller.js";
const router = Router();

router.route("/:projectId/create").post(createNewTask);
router.route("/:taskId/delete").delete(removeATask);
router.route("/:taskId/assign").post(assignTaskToTeam);
router.route("/:taskId/togglestatus").post(toggleTaskStatus);
router.route("/:taskId/unassign").delete(removeTeam);
router.route("/:taskId/update").patch(modifyTask);
router.route("/:taskId/data").get(getTaskData)
router.route("/:taskId/newDeadline").post(modifyTaskDeadline)

export default router;
