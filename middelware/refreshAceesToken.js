import jwt from "jsonwebtoken"
import asyncHandler from "../utils/asyncHandler.js"
import User from "../models/user.model.js"

const refreshAccessToken = asyncHandler(async(req,res,next) => {
    const refreshToken = req.cookies?.refreshToken

    
    if(!refreshToken)
        return next()
    
    const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?.id)

   

    if(!user.refreshToken === refreshToken) {
      return next()
    }

    const options = {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    }

    const accessToken = await user.generateAccessToken()
    res.cookie("accessToken",accessToken,options)
    next()
})

export default refreshAccessToken