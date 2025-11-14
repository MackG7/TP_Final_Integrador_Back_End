import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.model.js";

/** Middleware: requiere auth */
export const protect = asyncHandler(async (req, res, next) => {
    const auth = req.headers.authorization || "";
    if (!auth.startsWith("Bearer ")) {
        res.status(401);
        throw new Error("No autorizado, use Bearer token");
    }

    const token = auth.split(" ")[1];
    if (!token || token === "null" || token === "undefined") {
        res.status(401);
        throw new Error("Token no válido");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Desde ahora TODOS los JWT deben traer user_id (como definimos)
        const userId = decoded.user_id;
        if (!userId) {
            res.status(401);
            throw new Error("Token no contiene user_id");
        }

        const userDB = await User.findById(userId).select("-password");
        if (!userDB) {
            res.status(401);
            throw new Error("Usuario no encontrado");
        }

        // Shape unificado: _id (string), email, username, isAdmin
        req.user = {
            _id: userDB._id.toString(),
            email: userDB.email,
            username: userDB.username,
            isAdmin: userDB.isAdmin || false,
        };

        return next();
    } catch (err) {
        res.status(401);
        throw new Error(err.message || "Token inválido");
    }
});

/** Middleware: requiere rol admin */
export const admin = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.isAdmin) return next();
    res.status(403);
    throw new Error("Acceso denegado. Se requieren privilegios de administrador");
});

/** Middleware: auth opcional */
export const optionalAuth = asyncHandler(async (req, res, next) => {
    const auth = req.headers.authorization || "";
    if (auth.startsWith("Bearer ")) {
        try {
            const token = auth.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.user_id;
            if (userId) {
                const userDB = await User.findById(userId).select("-password");
                if (userDB) {
                    req.user = {
                        _id: userDB._id.toString(),
                        email: userDB.email,
                        username: userDB.username,
                        isAdmin: userDB.isAdmin || false,
                    };
                }
            }
        } catch (err) {
            // silencioso en auth opcional
            console.log("optionalAuth: token inválido:", err.message);
        }
    }
    next();
});