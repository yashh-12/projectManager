import { Router } from "express";
import { createUserOrganization, getUserOrganization, getOrganizationProjects } from "../controllers/organization.controller.js"

const router = Router()

router.route("/").post(createUserOrganization)
router.route("/").get(getUserOrganization)
router.route("/:orgId/projects").get(getOrganizationProjects)

export default router
