import { Router } from "express";
import { loginUser, refreshAccessToken, registerUser, renderLoginPage, renderSignupPage } from "../controllers/user.controller.js";

const router = Router();

router.route("/signup").post(registerUser)
router.route("/login").post(loginUser)
router.route("/refresh-token").get(refreshAccessToken)
router.route("/login").get(renderLoginPage)
router.route("/signup").get(renderSignupPage)

export default router;
