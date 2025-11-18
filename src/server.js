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
        origin: ['http://localhost:5173', 'https://whatsappmessengerfinal.onrender.com'],
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ RUTA RAIZ 
app.get("/", (req, res) => {
    res.json({
        message: "🚀 WhatsApp Messenger Backend API",
        status: "running",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        endpoints: {
            health: "/api/health",
            auth: "/api/auth",
            users: "/api/users"
        }
    });
});

// ✅ HEALTH CHECK
app.get("/api/health", (req, res) => {
    res.json({ 
        ok: true, 
        message: "Servidor funcionando correctamente",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString()
    });
});

// ✅ ENDPOINT DE DEBUG
app.get("/api/debug", (req, res) => {
    res.json({
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        hasMongoDB: !!process.env.MONGODB_URI,
        frontendUrl: process.env.URL_FRONTEND,
        timestamp: new Date().toISOString()
    });
});

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

// ✅ CORREGIDO: Manejo de errores 404 (usa string "*")
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
});

// ✅ Manejo global de errores
app.use((error, req, res, next) => {
    console.error("💥 Error del servidor:", error);
    res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        ...(process.env.NODE_ENV === 'development' && { 
            error: error.message
        })
    });
});

// HTTP + Socket
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'https://whatsappmessengerfinal.onrender.com'],
        methods: ["GET", "POST"],
        credentials: true
    },
});

io.on("connection", (socket) => {
    console.log("🔌 Cliente conectado:", socket.id);
    
    socket.on("disconnect", () => {
        console.log("🔌 Cliente desconectado:", socket.id);
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Servidor con Socket.io escuchando en puerto ${PORT}`);
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});