import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import CookieParser from "cookie-parser";
import ejsmate from "ejs-mate";
import path from "path";
import cors from "cors";

const corsOptions = {
  origin: process.env.CORS,
  optionsSuccessStatus: 200,
};

dotenv.config({
  path: "../.env",
});

const app = express();

const expressServer = () => {
  // middelewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join("public")));
  app.use(CookieParser());
  app.use(cors(corsOptions));
  app.set("view engine", "ejs");
  app.set("views", "./public/views");
  app.engine("ejs", ejsmate);
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production" ? true : false },
    })
  );
  return app;
};

export default expressServer;
