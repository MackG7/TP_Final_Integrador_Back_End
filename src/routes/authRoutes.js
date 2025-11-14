import express from "express";
import AuthService from "../services/authService.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    const result = await AuthService.register(username, email, password);
    res.json(result);
});

// LOGIN
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json(result);
});

// VERIFY EMAIL
router.get("/verify-email/:token", async (req, res) => {
    const result = await AuthService.verifyEmail(req.params.token);
    res.json(result);
});

// VERIFY TOKEN (para AuthContext)
router.get("/verify", protect, async (req, res) => {
    return res.json({ success: true, user: req.user });
});

export default router;
