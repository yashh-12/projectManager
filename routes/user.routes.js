import { Router } from "express";
import authenticateUser from "../utils/auth.js";

import {
  loginUser,
  renderVerifyPage,
  logoutUser,
  registerUser,
  renderLoginPage,
  renderSignupPage,
  verifyUser,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/signup").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/verify").get(renderVerifyPage);
router.route("/verify").post(verifyUser);
router.route("/login").get(renderLoginPage);
router.route("/signup").get(renderSignupPage);

export default router;
