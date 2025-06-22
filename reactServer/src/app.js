import connectDb from "../db/index.js";
import isLoggedIn from "../middelware/loggedIn.js";
import refreshAccessToken from "../middelware/refreshAceesToken.js";
import expressServer from "../utils/expressServer.js";
import authenticateUser from "../utils/auth.js";
import apiResponse from "../utils/apiResponse.js";
import { Server } from "socket.io";
import { createServer } from "http";

const app = expressServer();
const http = createServer();

const server = new Server(http, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});
const socketHashMap = {};

server.on("connection", (client) => {
  client.on("register", (userId) => {
    socketHashMap[userId] = client.id;
  });

  client.on("join-personalRoom", roomId => {
    client.join(roomId)
    client.to(roomId).emit("startHandshake", roomId);
  })

  client.on("joinProject", (projectId) => {
    client.join(`project_${projectId}`);
  });

  client.on("reduceChatCount", data => {
    client.emit("minusRead", data)
  })

  client.on("reduceUserCount", data => {
    client.emit("minusUserCount", data)
  })

  client.on("leaveRoom", (projectId) => {
    client.leave(`project_${projectId}`);
  });

  client.on("sendMess", (data) => {

    const recipientSocketId = socketHashMap[data.recipient];
    if (recipientSocketId) {
      server.to(recipientSocketId).emit("recMessage", data);
    }

  });

  client.on("newTask", (task) => {
    if (task.projectId) {
      server.to(`project_${task.projectId}`).emit("receiveAddedTask", task);
    } else {
      client.broadcast.emit("receiveAddedTask", task);
    }
  });

  client.on('call-user', ({ user, targetUserId, callerId, roomId }) => {
    const targetSocketId = socketHashMap[targetUserId];
    if (targetSocketId) {
      client.join(roomId);
      server.to(targetSocketId).emit('incoming-call', { user, callerId, roomId });
    }
  });

  client.on('sendOffer', ({ roomId, offer }) => {
    client.to(roomId).emit("offer", { roomId, offer })
  });

  client.on('sendAnswer', ({ roomId, answer }) => {
    client.to(roomId).emit("answer", { roomId, answer })
  });

  client.on("teamAssigned", ({ members, taskToFindMember }) => {
    members.forEach((memberId) => {
      const targetSocketId = socketHashMap[memberId];
      if (targetSocketId) {
        console.log("sent ", targetSocketId);

        client.to(targetSocketId).emit("recTask", taskToFindMember);
      }
    });
  });

  client.on("disconnect", () => {
    for (const userId in socketHashMap) {
      if (socketHashMap[userId] === client.id) {
        delete socketHashMap[userId];
        break;
      }
    }
  });
});


import userRouter from "../routes/user.routes.js";
import projectRouter from "../routes/project.routes.js";
import taskRouter from "../routes/task.routes.js";
import teamRouter from "../routes/team.routes.js";
import chatRouter from "../routes/chat.routes.js";
import notificationRouter from "../routes/notification.routes.js";

app.use("/api/auth", userRouter);
app.use("/api/projects", authenticateUser, projectRouter);
app.use("/api/tasks", authenticateUser, taskRouter);
app.use("/api/teams", authenticateUser, teamRouter);
app.use("/api/chats", authenticateUser, chatRouter);
app.use("/api/notifications", authenticateUser, notificationRouter);

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
