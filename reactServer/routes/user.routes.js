import { Router } from "express";
import authenticateUser from "../utils/auth.js";
import refreshAccessToken from "../middelware/refreshAceesToken.js"
import {
  loginUser,
  logoutUser,
  registerUser,
  verifyUser,
  sendMail,
  getUserDetails,
  getAllUsers
} from "../controllers/user.controller.js";

const router = Router();

router.route("/sendotp").post(sendMail);
router.route("/signup").post(registerUser);
router.route("/getuserdetail").get(authenticateUser,getUserDetails);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/verify/:emailId").post(verifyUser);
router.route("/allUser").get(authenticateUser, getAllUsers);

export default router;
