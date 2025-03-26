import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import sendVerificationEmail from "../utils/nodeMailer.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !password || !email) {
    return res
      .status(400)
      .json(new apiError(400, "Please enter all fields"));
  }

  const existingUser = await User.findOne({
    $or: [{ email: email }, { username: username }],
  }).select("--refreshToken --password");


  if (existingUser) {
    const otp = await sendVerificationEmail(existingUser?.email);
    const newOpt = otp.toString();
    const hashedOtp = await bcrypt.hash(newOpt, 12)
    existingUser.otp = hashedOtp;
    existingUser.save();

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          existingUser,
          "User already exists. Verify your email"
        )
      );
  }

  const otp = await sendVerificationEmail(email);
  const newOpt = otp.toString();
  const hashedOtp = await bcrypt.hash(newOpt, 12)
  const newUser = await User.create({
    name,
    email,
    password,
    username,
    otp: hashedOtp
  });
  

  if (!newUser) {
    return res
      .status(400)
      .json(new apiError(400, "User registration failed"));
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        newUser,
        "User registered successfully. Verify your email"
      )
    );

});

const loginUser = asyncHandler(async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password)
    res.status(400).json(new apiError(400, "Email and Password is required"));

  const user = await User.findOne({
    $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
  }).select("+password");

  if (!user) res.status(400).json(new apiError(400, "User not found"));

  if (!user.isVerified)
    res.status(400).json(new apiError(400, "Please verify your email"));

  const isMatch = await user.isCorrectPassword(password);

  if (!isMatch)
    res.status(400).json(new apiError(400, "Invalid credentials"));

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();



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
      new apiResponse(200, {user }, "Login successful")
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
    // return res.redirect("/login");
    return res.status(400).json(new apiResponse(400, {}, "Please login first"));

  const user = await User.findById(decodedToken.id);
  if (!user)
    // return res.redirect("/login");
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
  const {emailId} = req.params;

  if (!otp)
    return res.status(400).json(new apiError(400, "Please enter otp"));

  const user = await User.findOne({ email: emailId });
  if (!user)
    return res.status(400).json(new apiError(400, "User not found"));

  const otpAge = req.cookies.maxAgel
  if (otpAge + 180000 < Date.now()) {

    return res
      .status(400)
      .json(new apiError(400, "OTP expired. Please click Resend"));
  }

  const hashedOtp = await bcrypt.hash(otp, 12)
  const verify = await bcrypt.compare(otp, hashedOtp)
  
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

  const newPassword = await bcrypt.hash(req.body.newPassword, 10);
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
  // console.log("Getting user details ", req?.user);

  const user = await User.findById(req?.user?._id).select("--refreshToken --password");

  if (!user)
    return res.status(404).json(new apiError(404, "User not found"));

  return res
    .status(200)
    .json(new apiResponse(200, user, "User details fetched successfully"));
});

const changeUserDetails = asyncHandler(async (req, res) => {
  const { name, username, email } = req.body;
  if (!name || !username || !email)
    throw new apiError(400, "All fields are required");
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
  const { email } = req.body;
  if (!email)
    return res.status(404).json(new apiError(400, "Email not found"))

  const user = await User.findOne({ email: email });
  if (!user)
    return res.status(404).json(new apiError(404, "User not found"));


  const otp = await sendVerificationEmail(email)

  const hashedOtp = await bcrypt.hash(otp.toString(), 12);
  const maxAge = Date.now();
  user.otp = hashedOtp;

  await user.save()
  res.status(200).cookie("maxAge", maxAge).json(new apiResponse(200, "Otp sent successfully"))
})




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
  sendMail
};
