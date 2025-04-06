import express from "express";
import dotenv from "dotenv";
import CookieParser from "cookie-parser";
import cors from "cors";

dotenv.config({
  path: "../.env",
});



const corsOptions = {
  origin: process.env.CORS,
  optionsSuccessStatus: 200,
  credentials: true
};


const app = express();

const expressServer = () => {

  // middelewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors(corsOptions));
  app.use(CookieParser());

  return app;
};

export default expressServer;
