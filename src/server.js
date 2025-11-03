import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectMongoDB from "./config/mongoDB.config.js";

// Rutas
import userRoutes from "./routes/userRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
connectMongoDB();

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());

// Rutas base
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/group", groupRoutes);

// Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚩 Servidor corriendo en puerto ${PORT}`)); 






