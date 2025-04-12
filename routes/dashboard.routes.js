import { Router } from "express";
import { getOrganizationDashboard, getUserDashboard } from "../controllers/dashboard.controller.js";

const router = Router()

router.route("/user").get(getUserDashboard)
router.route("/organization").get(getOrganizationDashboard)

export default router