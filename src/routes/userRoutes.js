import express from "express";
import {
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
    getAllUsers,
} from "../controllers/userControllers.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 👤 Registro de nuevo usuario
router.post("/register", registerUser);

// 🔐 Login de usuario
router.post("/login", authUser);

// 🔒 Obtener perfil del usuario autenticado
router.get("/profile", protect, getUserProfile);

// ✏️ Actualizar perfil del usuario autenticado
router.put("/profile", protect, updateUserProfile);

// 🧑‍💼 Obtener todos los usuarios (solo admin)
router.get("/", protect, admin, getAllUsers);

export default router;