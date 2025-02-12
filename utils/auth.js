import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import apiError from "./apiError.js";

const authenticateUser = async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) res.redirect("api/auth/login");

  const decodedToken = await jwt.decode(token, process.env.ACCESS_TOKEN_SECRET);

  if (!decodedToken) res.redirect("api/auth/login");


  const user = await User.findById(decodedToken?.id);
  if (!user) res.redirect("api/auth/login");

  req.user = user;
  next();
};

export default authenticateUser;
