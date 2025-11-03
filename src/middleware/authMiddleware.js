import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.model.js";

// 🔒 Middleware para verificar el token JWT
const protect = asyncHandler(async (req, res, next) => {
    let token;
    console.log("📨 Headers recibidos:", req.headers);
    console.log("🔑 Authorization Header:", req.headers.authorization);

    // Verifica si el header tiene un token tipo Bearer
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            
            // Validar que el token no esté vacío
            if (!token || token === "null" || token === "undefined") {
                res.status(401);
                throw new Error("Token no válido");
            }

            console.log("✅ Token extraído:", token.substring(0, 20) + "...");

            // Decodifica el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("🔓 Token decodificado:", decoded);

            // Busca el usuario en la base de datos (sin incluir el password)
            req.user = await User.findById(decoded.id).select("-password");
            
            if (!req.user) {
                res.status(401);
                throw new Error("Usuario no encontrado");
            }

            console.log("👤 Usuario autenticado:", req.user.email);
            next();
            
        } catch (error) {
            console.error("❌ Error en autenticación:", error.message);
            
            // Manejar diferentes tipos de errores de JWT
            if (error.name === "TokenExpiredError") {
                res.status(401);
                throw new Error("Token expirado");
            } else if (error.name === "JsonWebTokenError") {
                res.status(401);
                throw new Error("Token inválido");
            } else {
                res.status(401);
                throw new Error("Error de autenticación");
            }
        }
    } else {
        console.log("❌ No se encontró token Bearer");
        res.status(401);
        throw new Error("No autorizado, formato de token incorrecto. Use: Bearer [token]");
    }
});

// 🧑‍💼 Middleware para verificar si el usuario es admin
const admin = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403); // 403 Forbidden es más apropiado para permisos insuficientes
        throw new Error("Acceso denegado. Se requieren privilegios de administrador");
    }
});

// 👥 Middleware opcional (no requiere autenticación pero la usa si existe)
const optionalAuth = asyncHandler(async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        try {
            const token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
        } catch (error) {
            // Silenciar errores para auth opcional
            console.log("⚠️ Autenticación opcional fallida:", error.message);
        }
    }
    next();
});

export { protect, admin, optionalAuth };