import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const isLoggedIn = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.refreshToken;

  const decodedToken = jwt.decode(token, process.env.REFRESH_TOKEN_SECRET);

  const user = await User.findById(decodedToken?.id);

  if (user) req.isLoggedIn = true;
  else req.isLoggedIn = false;

  next();
});

export default isLoggedIn;
