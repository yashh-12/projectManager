import mongoose, { connect } from "mongoose";
import { DATABASE_NAME } from "../utils/constant.js";
import dotenv from "dotenv";
dotenv.config();


const connectDb = async () => {
  try {
    const connection = await mongoose.connect(
      `${process.env.DATABASE_URL}/${DATABASE_NAME}`
    );
    return connection;
  } catch (error) {
    console.log("error connecting to database : ", error);
  }
};

export default connectDb;
