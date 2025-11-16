import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import connectMongoDB from "./config/mongoDB.config.js";

// Rutas
import userRoutes from "./routes/userRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import groupMessageRoutes from "./routes/groupMessageRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import DirectMessageRoutes from "./routes/DirectMessageRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";

dotenv.config();

// Conectar Base de Datos
connectMongoDB();

const app = express();

// Middlewares
app.use(
    cors({
        origin: process.env.URL_FRONTEND || "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/direct-message", DirectMessageRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/group-message", groupMessageRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/invite", inviteRoutes);

// Health Check
app.get("/api/health", (req, res) => {
    res.json({ ok: true, message: "Servidor funcionando" });
});

// HTTP + Socket
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.URL_FRONTEND || "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("🔌 Cliente conectado:", socket.id);
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Servidor con Socket.io escuchando en puerto ${PORT}`);
});
