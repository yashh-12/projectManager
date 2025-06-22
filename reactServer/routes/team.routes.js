import { Router } from "express";
import { createNewTeam,removeATeam,addTeamMembers,removeTeamMembers,getTeamData, getAllUnassignedUsers , getAssignedUsers, getTeamMembers} from "../controllers/team.controller.js";


const router = Router();

router.route("/:projectId/create").post(createNewTeam);
router.route("/:teamId/delete").delete(removeATeam);
router.route("/:teamId/addMembers").post(addTeamMembers);
router.route("/:teamId/removeMembers").post(removeTeamMembers);
router.route("/:teamId/data").get(getTeamData);
router.route("/:teamId/getAllUnassignedUsers").get(getAllUnassignedUsers);
router.route("/:teamId/getAllAssignedUsers").get(getAssignedUsers);
router.route("/:teamID/getTeamMembers").get(getTeamMembers);


export default router;