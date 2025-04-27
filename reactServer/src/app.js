import connectDb from "../db/index.js";
import isLoggedIn from "../middelware/loggedIn.js";
import refreshAccessToken from "../middelware/refreshAceesToken.js";
import expressServer from "../utils/expressServer.js";
import authenticateUser from "../utils/auth.js";
import apiResponse from "../utils/apiResponse.js";
import { Server } from "socket.io";
import { createServer } from "http";

const app = expressServer();
const http = createServer(); // only for socket

const server = new Server(http, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

server.on("connection", (client) => {
  console.log(`Socket connected: ${client.id}`);
});

import userRouter from "../routes/user.routes.js";
import projectRouter from "../routes/project.routes.js";
import taskRouter from "../routes/task.routes.js";
import teamRouter from "../routes/team.routes.js";
import chatRouter from "../routes/chat.routes.js";
import { Socket } from "dgram";

app.use("/api/auth", userRouter);
app.use("/api/projects", authenticateUser, projectRouter);
app.use("/api/tasks", authenticateUser, taskRouter);
app.use("/api/teams", authenticateUser, teamRouter);
app.use("/api/chats", authenticateUser, chatRouter);

// Home route
app.get("/", refreshAccessToken, isLoggedIn, (req, res) => {
  res.json(new apiResponse(200, { isLoggedIn: req.isLoggedIn }, "Welcome to Home Page"));
});

// 404 & error handling
app.use((req, res) => {
  res.status(404).json(new apiResponse(404, {}, "Page not found"));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json(new apiResponse(500, { error: err.stack }, "Internal Server Error"));
});

const connection = await connectDb();
const port = process.env.PORT ?? 8000;

if (connection) {
  console.log("Connected to DB:", connection.connection.host);

  app.listen(port, () => {
    console.log(` Express server running on http://localhost:${port}`);
  });

  http.listen(3000, () => {
    console.log("Socket.IO server running on http://localhost:3000");
  });
}
