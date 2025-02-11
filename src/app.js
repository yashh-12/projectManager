import express from "express";
import dotenv from "dotenv";
import connectDb from "../db/index.js";
import CookieParser from "cookie-parser";
import ejsmate from "ejs-mate"
import path from "path";
import authenticateUser from "../utils/auth.js"

dotenv.config({
  path: "../.env",
});

const app = express();

// middelewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join("public")))
app.use(CookieParser());
app.set("view engine","ejs")
app.set("views","./public/views")
app.engine("ejs",ejsmate)


//import routes
import userRouter from "../routes/user.routes.js";

// routes
app.use("/api/auth", userRouter);

app.get("/",(req,res) => {
  res.render("index",{error:"Something went wrong"});
})




//Connection Checking
const connection = await connectDb();
const port = process.env.PORT ?? 8000;
if (connection) {
  console.log(
    "Successfully connected to database : ",
    connection.connection.host
  );
  app.listen(port, () => {
    console.log(`listening on ${port}`);
  });
}
