import jwt from "jsonwebtoken";

/**
 * Genera un token JWT para un usuario.
 * @param {string} id - ID del usuario (por ejemplo, user._id de MongoDB)
 * @returns {string} - Token JWT firmado
 */
const generateToken = (id) => {
    return jwt.sign(
        { id }, // Payload (lo que se guarda dentro del token)
        process.env.JWT_SECRET, // Clave secreta guardada en tus variables de entorno
        {
            expiresIn: "30d", // Duración del token (30 días, podés ajustarlo)
        }
    );
};

export default generateToken;