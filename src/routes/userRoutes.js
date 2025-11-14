import express from "express";
import UserController from "../controllers/userControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// CRUD Usuarios (públicos/admin)
router.post("/", UserController.createUser);
router.get("/", UserController.getAllUsers);
router.get("/:userId", UserController.getUserById);
router.put("/:userId", UserController.updateUser);
router.delete("/:userId", UserController.deleteUser);

// PERFIL DEL USUARIO AUTENTICADO (requiere auth)
router.get("/profile/me", protect, UserController.getMyProfile); // ← Línea 18 probable
router.put("/profile/me", protect, UserController.updateMyProfile);
router.post("/upload-avatar", protect, UserController.uploadAvatar);
router.get("/search/email", protect, UserController.searchByEmail);

export default router;