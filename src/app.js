import connectDb from "../db/index.js";
import isLoggedIn from "../middelware/loggedIn.js";
import refreshAccessToken from "../middelware/refreshAceesToken.js";
import expressServer from "../utils/expressServer.js";
import authenticateUser from "../utils/auth.js";
import apiResponse from "../utils/apiResponse.js";

const app = expressServer();


//import routes
import userRouter from "../routes/user.routes.js";
import projectRouter from "../routes/project.routes.js";
import organizationRouter from "../routes/organization.routes.js";
import dashboardRouter from "../routes/dashboard.routes.js";

// routes
app.use("/api/auth", userRouter);
app.use("/api/org", authenticateUser, projectRouter);
app.use("/api/organization", authenticateUser, organizationRouter);
app.use("/api/dashboard",authenticateUser, dashboardRouter)


//Home Route
app.get("/", refreshAccessToken, isLoggedIn, (req, res) => {
  // res.render("index", { isLoggedIn: req.isLoggedIn, error: "error" });
  res.json(new apiResponse(200, { isLoggedIn: req.isLoggedIn, error: "" }, "Welcome to Home Page"));
});


//404 Route
app.use((req, res) => {
  // res.status(404).render("error", { error: "Page not found" });
  res.json(new apiResponse(404, { error: "" }, "Page not found"));

});


//Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.json(new apiResponse(500, { error: err.stack }, "Internal Server Error"));
});


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
