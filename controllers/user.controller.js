import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import sendVerificationEmail from "../utils/nodeMailer.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {

  const { name, username, email, password } = req.body;
  if (!name || !username || !password || !email) {
    return res.render("signup", { error: "Please enter all fields" });
  }

  const existingUser = await User.findOne({
    $or: [{ email: email }, { username: username }],
  });

  if (existingUser)
    return res.render("signup", { error: "User already exist" });

  const newUser = await User.create({
    name,
    email,
    password,
    username,
  });

  if (!newUser)
    return res.render("signup", { error: "User registration failed" });

  req.session.regenerate(async (err) => {
    if (err) {
      console.log("Session creation failed", err);
      return res.render("login", { error: "Something went wrong. Try again." });
    }
    req.session.email = newUser.email;
    req.session.userId = newUser._id;

    return res.redirect("/api/auth/verify");
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password)
    return res.render("login", { error: "Please enter all fields" });

  const user = await User.findOne({
    $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
  }).select("+password");

  if (!user)
    return res.render("login", { error: "Please enter valid credentials" });

  const isMatch = await user.isCorrectPassword(password);

  if (!isMatch)
    return res.render("login", { error: "Please enter valid credentials" });

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  const optionsForAccessToken = {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    httpOnly: true,
    secure: process.env.NODE_ENV == "production" ? true : false,
  };

  const optionsForRefreshToken = {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    httpOnly: true,
    secure: process.env.NODE_ENV == "production" ? true : false,
  };

  return res
    .cookie("accessToken", accessToken, optionsForAccessToken)
    .cookie("refreshToken", refreshToken, optionsForRefreshToken)
    .redirect("/");
});

const logoutUser = asyncHandler(async (req, res) => {
  const accessToken = req.cookies?.accessToken;
  if(!accessToken)
    return res.redirect("/login");  

  const decodedToken = await jwt.decode(accessToken, process.env.ACCESS_TOKEN_SECRET);
  if(!decodedToken)
    return res.redirect("/login");

  const user = await User.findById(decodedToken.id);
  if(!user)
    return res.redirect("/login");

  user.refreshToken = undefined;
  await user.save();

  return res.clearCookie("refreshToken").clearCookie("accessToken").redirect("/");
});

const verifyUser = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  if (!otp) return res.render("verify", { error: "Please enter otp" });

  const user = await User.findOne({ email: req.session.email });
  if (!user) return res.redirect("/api/auth/register");

  if (otp != req.session.otp)
    return res.render("verify", { error: "Invalid otp" });

  user.isVerified = true;
  await user.save();

  req.session.destroy((err) => {
    if (err) {
      return res.render("verify", { error: "Session destroy failed" });
    }
    res.redirect("/");
  });
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

const renderLoginPage = asyncHandler(async (req, res) => {
  res.render("login", { error: "" });
});

const renderSignupPage = asyncHandler(async (req, res) => {
  res.render("signup", { error: "" });
});

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

const deleteUser = asyncHandler(async (req, res) => {
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

const renderVerifyPage = asyncHandler(async (req, res) => {
  req.session.otp = await sendVerificationEmail(req.session.email);
  return res.render("verify", { error: "" });
});

export {
  registerUser,
  loginUser,
  logoutUser,
  verifyUser,
  renderVerifyPage,
  renderLoginPage,
  renderSignupPage,
  changePassword,
  changeUsername,
  deleteUser,
};
