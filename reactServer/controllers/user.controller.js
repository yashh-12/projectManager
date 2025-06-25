import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import sendVerificationEmail from "../utils/nodeMailer.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import Notification from "../models/notification.model.js";
import Chat from "../models/chat.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !password || !email) {
    return res
      .status(400)
      .json(new apiError(400, "Please enter all fields"));
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    if (existingUser.isVerified) {
      return res
        .status(400)
        .json(new apiError(400, "Email or username already registered"));
    }
    const otp = await sendVerificationEmail(email);
    const hashedOtp = await bcrypt.hash(otp.toString(), 12);


    const hashedPassword = await bcrypt.hash(password, 12);

    existingUser.name = name;
    existingUser.username = username;
    existingUser.password = hashedPassword;
    await existingUser.save();

    const verifyToken = jwt.sign({
      email, hashedOtp
    }, process.env.OTP_SECRET, { expiresIn: "5m" }
    )

    const optionsForOtp = {
      maxAge: 1000 * 60 * 5,
      httpOnly: true,
      secure: false,
    };
    return res
      .status(200)
      .cookie("verify", verifyToken, optionsForOtp)
      .json(new apiResponse(
        200,
        existingUser,
        "User already exists. Please verify your email"
      ));
  }

  const otp = await sendVerificationEmail(email);

  console.log("opt ", otp);

  const hashedOtp = await bcrypt.hash(otp.toString(), 12);

  const newUser = await User.create({
    name,
    email,
    username,
    password: password,
  });

  const verifyToken = jwt.sign({
    email, hashedOtp
  }, process.env.OTP_SECRET)

  if (!newUser) {
    return res
      .status(400)
      .json(new apiError(400, "User registration failed"));
  }

  const optionsForOtp = {
    maxAge: 1000 * 60 * 5,
    httpOnly: true,
    secure: false,
  };

  return res
    .status(200)
    .cookie("verify", verifyToken, optionsForOtp)
    .json(new apiResponse(
      200,
      newUser,
      "User registered successfully. Verify your email"
    ));
});

const loginUser = asyncHandler(async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password)
    return res.status(400).json(new apiError(400, "Email and Password is required"));

  const user = await User.findOne({
    $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
  }).select("+password");

  if (!user) res.status(400).json(new apiError(400, "User not found"));

  if (!user.isVerified)
    return res.status(400).json(new apiError(400, "Please verify your email"));

  const isMatch = await user.isCorrectPassword(password);

  if (!isMatch)
    return res.status(400).json(new apiError(400, "Invalid credentials"));

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  const newUser = await User.findById(user._id).select("-password -refreshToken -otp")



  const optionsForAccessToken = {
    maxAge: 1000 * 60 * 60 * 24 * 1,
    httpOnly: true,
    secure: process.env.NODE_ENV == "production" ? true : false,
  };

  const optionsForRefreshToken = {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: process.env.NODE_ENV == "production" ? true : false,
  };

  return res
    .cookie("accessToken", accessToken, optionsForAccessToken)
    .cookie("refreshToken", refreshToken, optionsForRefreshToken)
    .status(200)
    .json(
      new apiResponse(200, newUser, "Login successful")
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const accessToken = req.cookies?.accessToken;
  if (!accessToken)
    // return res.redirect("/login");
    return res.status(400).json(new apiResponse(400, {}, "Please login first"));
  const decodedToken = await jwt.decode(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET
  );
  if (!decodedToken)
    return res.status(400).json(new apiResponse(400, {}, "Please login first"));

  const user = await User.findById(decodedToken.id);
  if (!user)
    return res.status(400).json(new apiResponse(400, {}, "Please login first"));

  user.refreshToken = undefined;
  await user.save();

  return res
    .clearCookie("refreshToken")
    .clearCookie("accessToken")
    .json(new apiResponse(200, {}, "Logout successful"));
});

const verifyUser = asyncHandler(async (req, res) => {

  const { otp } = req.body;
  const verifyToken = req.cookies?.verify;

  if (!verifyToken)
    return res.status(400).json(new apiError(404, "Please register first"));

  const dataToverify = jwt.decode(
    verifyToken,
    process.env.OTP_SECRET
  )

  if (!otp)
    return res.status(400).json(new apiError(400, "Please enter otp"));

  const user = await User.findOne({ email: dataToverify.email }).select("-password -refreshToken");

  if (!user)
    return res.status(400).json(new apiError(404, "User not found"));

  const hashedOtp = dataToverify.hashedOtp;

  const verify = await bcrypt.compare(otp.toString(), hashedOtp.toString())

  if (!verify)
    return res.status(400).json(new apiError(400, "Invalid otp"));

  user.isVerified = true;
  await user.save();

  return res
    .status(200)
    .json(new apiResponse(200, user, "User verified successfully"));

});

// const refreshAccessToken = asyncHandler(async (req, res) => {
//   const refreshToken = req.cookies?.refreshToken;

//   if (!refreshToken) throw new apiError(401, "Please Provide a refresh token");

//   const decodedToken = await jwt.decode(
//     refreshToken,
//     process.env.REFRESH_TOKEN_SECRET
//   );
//   //   console.log(decodedToken);

//   if (!decodedToken) throw new apiError(401, "Invalid refresh token");

//   const user = await User.findById(decodedToken.id);

//   console.log(user);

//   if (!user) throw new apiError(401, "Invalid Refresh token");

//   if (!user.refreshToken === refreshToken) {
//     throw new apiError(401, "Invalid Refresh token");
//   }

//   const accessToken = await user.generateAccessToken();
//   // const newRefreshToken = await user.generateRefreshToken();

//   const options = {
//     expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//   };

//   res
//     .status(200)
//     .cookie("accessToken", accessToken, options)
//     .json(
//       new apiResponse(
//         200,
//         { accessToken, refreshToken },
//         "Refreshed successfully"
//       )
//     );
// });

const changePassword = asyncHandler(async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password)
    throw new apiError(400, "All fields are required");

  const user = await User.findOne({
    $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
  }).select("+password");
  if (!user) throw new apiError(404, "User not found");

  const isMatch = await user.isCorrectPassword(password);
  if (!isMatch) throw new apiError(400, "Incorrect password");

  const newPassword = await bcrypt.hash(req?.body?.newPassword, 10);
  const updatedData = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        password: newPassword,
      },
    },
    { new: true }
  );
  res
    .status(200)
    .json(new apiResponse(200, updatedData, "Password changed successfully"));
});

const changeUsername = asyncHandler(async (req, res) => {
  const { username } = req.body;
  if (!username) throw new apiError(400, "Username is required");

  const existingUser = await User.findOne({ username: username });
  if (existingUser) throw new apiError(400, "Username already exists");

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        username: username,
      },
    },
    { new: true }
  );
  res
    .status(200)
    .json(new apiResponse(200, user, "Username changed successfully"));
});

const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password) throw new apiError(400, "Password is required");

  const user = await User.findById(req.user._id).select("+password");
  if (!user) throw new apiError(404, "User not found");

  const isMatch = await user.isCorrectPassword(password);
  if (!isMatch) throw new apiError(400, "Incorrect password");

  const deletedUser = await User.findByIdAndDelete(req.user._id);
  if (!deletedUser) throw new apiError(404, "User deleting failed");

  res
    .status(200)
    .json(new apiResponse(200, deletedUser, "successfully deleted user"));
});

const getUserDetails = asyncHandler(async (req, res) => {

  let oldUser = await User.findById(req?.user?._id).select("--refreshToken --password");

  if (!oldUser)
    return res.status(404).json(new apiError(404, "User not found"));

  return res
    .status(200)
    .json(new apiResponse(200, oldUser, "User details fetched successfully"));
});

const changeUserDetails = asyncHandler(async (req, res) => {
  const { name, username, email } = req.body;
  if (!name || !username || !email)
    throw new apiError(400, "All fields are required");

  const usernameTaken = await User.findOne({ username: username });

  if (usernameTaken) {
    return res.status(400).json(new apiError(400, "Username is already registered"));
  }

  const emailTaken = await User.findOne({ email: email });

  if (emailTaken) {
    return res.status(400).json(new apiError(400, "Email is already registered"));
    // throw new apiError(400, "Email is already registered");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        name: name,
        username: username,
        email: email,
      },
    },
    { new: true }
  );
  if (!user) throw new apiError(400, "User details update failed");
  return res
    .status(200)
    .json(new apiResponse(200, user, "User details updated successfully"));
});

const sendMail = asyncHandler(async (req, res) => {

  const verifyToken = req.cookies.verify;

  if (!verifyToken)
    return res.status(404).json(new apiError(404, "Please Signup again"))

  const dataToverify = jwt.decode(verifyToken, process.env.OTP_SECRET)

  if (!dataToverify.email)
    return res.status(404).json(new apiError(404, "Email not found"))


  const user = await User.findOne({ email: dataToverify.email });


  if (!user)
    return res.status(404).json(new apiError(404, "User not found"));


  const otp = await sendVerificationEmail(dataToverify.email)
  // console.log("otp ", otp);

  const hashedOtp = await bcrypt.hash(otp.toString(), 12);

  const optionsForOtp = {
    maxAge: 1000 * 60 * 5,
    httpOnly: true,
    secure: false,
  };

  const newToken = jwt.sign({
    hashedOtp, email: dataToverify.email
  }, process.env.OTP_SECRET, { expiresIn: "5m" }
  )

  // console.log("req sent");/


  res.status(200).cookie("verify", newToken, optionsForOtp).json(new apiResponse(200, {}, "Otp sent successfully"))
})

const getAllUsers = asyncHandler(async (req, res) => {

  const users = await User.find({}).select("-refreshToken -password");
  res.status(200).json(new apiResponse(200, users, "All users fetched successfully"))
})

const uploadAvatar = asyncHandler(async (req, res) => {
  const avatar = req?.file;

  const avatarCloudinary = await uploadonCloudinary(avatar?.path);

  const avatarUrl = avatarCloudinary?.url;

  if (avatarUrl) {

    const user = await User.findById(req.user.id);
    user.avatar = avatarUrl;

    await user.save();
    return res.status(200).json(new apiResponse(200, avatarUrl, "Suceesfully uploaded"))
  }

  return res.status(200).json(new apiResponse(400, "", "Something went wrong"))

})

const sendForgotPasswordOtp = asyncHandler(async (req, res) => {
  const { emailId } = req.body;

  if (!emailId)
    return res.status(400).json(new apiError(400, "Email is required"));

  const user = await User.findOne({ email: emailId });

  if (!user)
    return res.status(404).json(new apiError(404, "User not found"));

  const otp = await sendVerificationEmail(emailId);
  const hashedOtp = await bcrypt.hash(otp.toString(), 12);

  const optionsForOtp = {
    maxAge: 1000 * 60 * 5,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  const newToken = jwt.sign(
    {
      hashedOtp,
      emailId,
    },
    process.env.OTP_SECRET,
    { expiresIn: "5m" }
  );

  res
    .status(200)
    .cookie("forgotPwdVerify", newToken, optionsForOtp)
    .json(new apiResponse(200, {}, "OTP sent successfully for password reset"));
});

const resetForgotPassword = asyncHandler(async (req, res) => {
  const { otp, newPassword, confirmPassword } = req.body;

  const token = req.cookies.forgotPwdVerify;

  if (!token) {
    return res
      .status(401)
      .json(new apiError(401, "Reset session expired. Please verify OTP again."));
  }

  let decoded;
  try {
    decoded = jwt.decode(token, process.env.OTP_SECRET);
  } catch (err) {
    return res
      .status(401)
      .json(new apiError(401, "Invalid or expired reset token."));
  }

  const { emailId, hashedOtp } = decoded;

  if (!emailId || !otp || !newPassword || !confirmPassword) {
    return res
      .status(400)
      .json(new apiError(400, "All fields are required."));
  }

  const isMatch = await bcrypt.compare(otp.toString(), hashedOtp.toString());

  if (!isMatch) {
    return res.status(400).json(new apiError(400, "Incorrect OTP."));
  }

  if (newPassword !== confirmPassword) {
    return res
      .status(400)
      .json(new apiError(400, "Passwords do not match."));
  }

  const user = await User.findOne({ email: emailId });
  if (!user) {
    return res.status(404).json(new apiError(404, "User not found."));
  }

  user.password = newPassword;
  await user.save();

  res
    .clearCookie("forgotPwdVerify")
    .status(200)
    .json(new apiResponse(200, {}, "Password has been reset successfully. You can now login."));
});




export {
  registerUser,
  loginUser,
  logoutUser,
  verifyUser,
  changePassword,
  changeUsername,
  getUserDetails,
  changeUserDetails,
  deleteAccount,
  sendMail,
  getAllUsers,
  uploadAvatar,
  sendForgotPasswordOtp,
  resetForgotPassword
};
