import connectDb from "../db/index.js";
import isLoggedIn from "../middelware/loggedIn.js";
import refreshAccessToken from "../middelware/refreshAceesToken.js";
import expressServer from "../utils/expressServer.js";
import authenticateUser from "../utils/auth.js";
import apiResponse from "../utils/apiResponse.js";
import {Server} from "socket.io"
import {createServer} from "http"

const app = expressServer();
const http = createServer();
const server = new Server(http,{
  cors: true,
  origins: ["http://localhost:5173"] 
})

server.on("connection", (client) => {
  console.log(
    `Client connected: ${client.id}`
  );
  client.on("connect",() => {
    console.log("Client connected to the server");
  })
  
})


//import routes
import userRouter from "../routes/user.routes.js";
import projectRouter from "../routes/project.routes.js";
import taskRouter from "../routes/task.routes.js";
import teamRouter from "../routes/team.routes.js";
import chatRouter from "../routes/chat.routes.js";

// routes
app.use("/api/auth", userRouter);
app.use("/api/projects", authenticateUser, projectRouter);
app.use("/api/tasks", authenticateUser, taskRouter);
app.use("/api/teams", authenticateUser, teamRouter);
app.use("/api/chats", authenticateUser, chatRouter);


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
  console.error(err);
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
  http.listen(3000, () => {
    console.log(`Socket.IO server running on port 8080`);
  });
  
}
