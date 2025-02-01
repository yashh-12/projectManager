import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  console.log(req.body);

  const { name, email, password, role } = req.body;
  const existingUser = await User.findOne({ email: email });

  if (existingUser) res.render("register",{"error": "User already exist"});

  const newUser = await User.create({
    name,
    email,
    password,
    role,
  });

  if (!newUser) res.render("register",{"error": "User registration failed"});


  res.status(201).render("login", { error: "" });
  // .json(new apiResponse(200, newUser, "Successfully User Registered"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //   console.log(email, password);
  if (!email || !password)
    res.render("login", { error: "Please enter Email amd Password" });

  const user = await User.findOne({ email: email }).select("+password");

  console.log(user);

  // if (!user) res.render('login',{"error":"Invalid email"});

  //   console.log(user);

  const validPassword = await user.isCorrectPassword(password);

  if (!validPassword) res.render("login", { error: "Invalid credentials" });

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });

  const newUser = await User.findById(user._id);
  console.log("New User", newUser);

  const options = {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .redirect("/")
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
  const newRefreshToken = await user.generateRefreshToken();

  const options = {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        { newRefreshToken, accessToken },
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

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  renderLoginPage,
  renderSignupPage,
};
