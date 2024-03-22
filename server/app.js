import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";

const port = 3000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const users = {};

// Handle incoming socket connections
io.on("connection", (socket) => {
  // Handle user registration
  socket.on("register", (userData) => {
    users[socket.id] = userData;

    // Emit "userJoined" event to all clients in the same room
    io.to(userData.room).emit("userJoined", userData);
  });

  // Handle incoming messages
  socket.on("message", (data) => {
    // Broadcast the message to all clients in the same room
    io.to(data.room).emit("receive", {
      message: data.message,
      id: data.id,
      sender: data.sender,
      time: data.time,
    });
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    const disconnectedUser = users[socket.id];
    delete users[socket.id];
    console.log(
      `User Disconnected: ${
        disconnectedUser ? disconnectedUser.name : "Unknown"
      } (${socket.id})`
    );
  });
});

app.get("/", (req, res) => {
  res.send("hello world");
});

server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
