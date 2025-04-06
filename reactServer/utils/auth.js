import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import apiError from "./apiError.js";

const authenticateUser = async (req, res, next) => {
  const token = req.cookies?.accessToken;
  // console.log(token);
  

  if (!token)
    return res.status(401).json(new apiError(401,"No access token"))

  const decodedToken = await jwt.decode(token, process.env.ACCESS_TOKEN_SECRET);

  if (!decodedToken)
    return res.status(401).json(new apiError(401, "Invalid access token"))

  const user = await User.findById(decodedToken?.id);

  if (!user)
    return res.status(401).json(new apiError(401, "User not found"))

  if (!user.accessToken === token)
    return res.status(401).json(new apiError(401, "Invalid access token"))

  req.user = user;
  next();
};

export default authenticateUser;
