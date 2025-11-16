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

    if (!result.success) {
        return res.send(`
            <html>
                <body style="font-family: Arial; text-align:center;">
                    <h1 style="color: red;">❌ Error</h1>
                    <p>${result.message}</p>
                </body>
            </html>
        `);
    }

    return res.send(`
        <html>
            <body style="font-family: Arial; text-align:center;">
                <h1 style="color: #25D366;">✔ Email verificado</h1>
                <p>Tu correo fue verificado exitosamente.</p>
                <a href="${process.env.URL_FRONTEND}/login"
                    style="padding: 10px 20px; background:#25D366; color:white;
                    text-decoration:none; border-radius:6px;">
                    Ir al Login
                </a>
            </body>
        </html>
    `);
});


// VERIFY TOKEN (para AuthContext)
router.get("/verify", protect, async (req, res) => {
    return res.json({ success: true, user: req.user });
});

export default router;


