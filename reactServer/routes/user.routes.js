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
  getAllUsers,
  changePassword,
  changeUserDetails,
  uploadAvatar
} from "../controllers/user.controller.js";
import { upload } from "../middelware/multer.js";

const router = Router();

router.route("/sendotp").post(sendMail);
router.route("/signup").post(registerUser);
router.route("/getuserdetail").get(authenticateUser,getUserDetails);
router.route("/login").post(loginUser);
router.route("/uploadAvatar").post(authenticateUser,upload.single("avatar"),uploadAvatar);

router.route("/logout").post(logoutUser);
router.route("/verify/:emailId").post(verifyUser);
router.route("/allUser").get(authenticateUser, getAllUsers);
router.route("/changePassword").post(authenticateUser, changePassword);
router.route("/changeUserDetails").post(authenticateUser, changeUserDetails);

export default router;
