import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";

// routes
import remoteKeyboardRouter from "./routes/remoteKeyboard.mjs";
import { initDbConnection } from "./helper/dbHandlers.mjs";
import responseMiddleware from "./middleware/responseHandler.mjs";
import { startControlInterval, stopControlInterval } from "./helper/keyboardControlExpire.mjs";


dotenv.config();
const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: process.env.APP_URL, // e.g. http://localhost:3000
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-User-Id"],
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global state
app.locals.activeUsers = 0;
app.locals.controlInterval = null;

// Socket.IO server
const io = new Server(server, {
  cors: {
    origin: [process.env.APP_URL],
    methods: ["GET", "POST"]
  }
});

// ✅ Make io available everywhere
app.set('io', io);

app.use('/keyboard', remoteKeyboardRouter);

app.use(responseMiddleware);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", ({ user }) => {
    console.log(`User ${user} joined with socket ${socket.id}`);

    app.locals.activeUsers++;

    if (app.locals.activeUsers) {
      startControlInterval(app);
    }

    socket.join('keyboard-room'); // optional, but recommended
  });

  socket.on("disconnect", () => {
    app.locals.activeUsers = Math.max(app.locals.activeUsers - 1, 0);

    if (app.locals.activeUsers === 0) {
      stopControlInterval(app);
    }
    console.log("User disconnected:", socket.id);
  });
});

async function startServer() {
  try {
    // DB init first
    await initDbConnection();

    const port = process.env.PORT || 3000;
    // listen happens ONCE here
    server.listen(port, () => {
      console.log(`Server + Socket.IO running on port ${port}`);
    });

  } catch (error) {
    console.error('Server startup failed', error);
    process.exit(1);
  }
}

startServer();