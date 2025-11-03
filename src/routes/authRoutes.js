import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    registerUser,
    loginUser,
    getUserProfile,
    verifyEmail
} from '../controllers/authControllers.js';

const router = express.Router();

// 🔓 Rutas públicas
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify-email/:token', verifyEmail);

// 🔐 Rutas protegidas
router.get('/profile', protect, getUserProfile);
router.get('/verify-token', protect, (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar,
            isEmailVerified: req.user.isEmailVerified
        }
    });
});

export default router;