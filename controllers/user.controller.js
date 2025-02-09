import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  // console.log(req.body);

  const { name, username, email, password } = req.body;
  if (!name || !username || !password || !email) {
    throw new apiError(400, "All fileld required");
  }

  const existingUser = await User.findOne({
    $or: [{ email: email }, { username: username }],
  });

  // console.log(existingUser);

  if (existingUser)
    res.status(400).json(new apiError(400, "User already exists"));
  // throw new apiError(400,"User already Exist")
  // res.render("register",{"error": "User already exist"});

  const newUser = await User.create({
    name,
    email,
    password,
    username,
  });

  if (!newUser) throw new apiError(200, "Failed to register user");
  //  res.render("register",{"error": "User registration failed"});

  // .render("login", { error: "" });
  res
    .status(201)
    .json(new apiResponse(200, newUser, "Successfully User Registered"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password)
    throw new apiError(400, "All fields are required");

  const user = await User.findOne({
    $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
  }).select("+password");
  if (!user) res.status(404).json(new apiError(400, "User not found"));

  // console.log(user);

  const isMatch = await user.isCorrectPassword(password);
  if (!isMatch) throw new apiError(400, "Incorrect password");

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV == "production" ? true : false,
  };

  res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(200, { user, accessToken }, "Successfully Logged in")
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) throw new apiError(401, "Please Provide a refresh token");

  const decodedToken = await jwt.decode(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  //   console.log(decodedToken);

  if (!decodedToken) throw new apiError(401, "Invalid refresh token");

  const user = await User.findById(decodedToken.id);

  console.log(user);

  if (!user) throw new apiError(401, "Invalid Refresh token");

  if (!user.refreshToken === refreshToken) {
    throw new apiError(401, "Invalid Refresh token");
  }

  const accessToken = await user.generateAccessToken();
  // const newRefreshToken = await user.generateRefreshToken();

  const options = {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new apiResponse(
        200,
        { accessToken, refreshToken },
        "Refreshed successfully"
      )
    );
});

const renderLoginPage = asyncHandler(async (req, res) => {
  res.render("login", { error: "" });
});

const renderSignupPage = asyncHandler(async (req, res) => {
  res.render("signup");
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
      $set:{
        password: newPassword,
      }
    },
    { new: true }
  );
  res
    .status(200)
    .json(new apiResponse(200, updatedData, "Password changed successfully"));
});

const changeUsername = asyncHandler( async (req, res) => {
  const { username } = req.body;
  if (!username) throw new apiError(400, "Username is required");

  const existingUser = await User.findOne({ username: username });
  if (existingUser) throw new apiError(400, "Username already exists");

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        username: username,
      }
    },
    { new: true }
  );
  res
   .status(200)
   .json(new apiResponse(200, user, "Username changed successfully"));
})

const deleteUser = asyncHandler( async (req, res) => {
  const {password} = req.body;
  if (!password) throw new apiError(400, "Password is required");

  const user = await User.findById(req.user._id).select("+password");
  if (!user) throw new apiError(404, "User not found");

  const isMatch = await user.isCorrectPassword(password);
  if (!isMatch) throw new apiError(400, "Incorrect password");

  const deletedUser =  await User.findByIdAndDelete(req.user._id);
  if (!deletedUser)
    throw new apiError(404, "User deleting failed");

  res.status(200).json(new apiResponse(200,deletedUser,"successfully deleted user"))
})




export {
  registerUser,
  loginUser,
  refreshAccessToken,
  renderLoginPage,
  renderSignupPage,
  changePassword,
  changeUsername,
  deleteUser,
};
