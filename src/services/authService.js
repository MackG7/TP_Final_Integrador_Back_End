import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import transporter from "../config/mailer.config.js";
import ENVIRONMENT from "../config/environment.config.js";

class AuthService {

    static async register(username, email, password) {
        try {
            if (!username || !email || !password) {
                throw new Error("Username, email y contraseña son requeridos");
            }

            if (password.length < 6) {
                throw new Error("La contraseña debe tener al menos 6 caracteres");
            }

            const userExists = await User.findOne({ email });
            if (userExists) {
                return { success: false, message: "El email ya está en uso" };
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await User.create({
                username: username.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                verified_email: false,
            });

            const verificationToken = jwt.sign(
                { email: newUser.email, user_id: newUser._id.toString() },
                ENVIRONMENT.JWT_SECRET,
                { expiresIn: '24h' }
            );

            const authToken = jwt.sign(
                {
                    user_id: newUser._id.toString(),
                    username: newUser.username,
                    email: newUser.email
                },
                ENVIRONMENT.JWT_SECRET,
                { expiresIn: "21d" }
            );

            if (transporter && ENVIRONMENT.GMAIL_USERNAME) {
                const emailHTML = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #25D366;">¡Bienvenido ${newUser.username}! 👋</h2>
                            <p>Gracias por registrarte. Verifica tu email:</p>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${ENVIRONMENT.URL_API_BACKEND}/api/auth/verify-email/${verificationToken}" 
                                style="background-color: #25D366; color: white; padding: 12px 24px; 
                                text-decoration: none; border-radius: 8px; font-weight: bold;">
                                Verificar Mi Email
                                </a>
                            </div>
                        </div>
                    `;

                await transporter.sendMail({
                    from: ENVIRONMENT.GMAIL_USERNAME,
                    to: newUser.email,
                    subject: "Verificación de correo electrónico",
                    html: emailHTML
                });
            }

            return {
                success: true,
                message: "Usuario registrado. Revisa tu correo para verificar tu cuenta.",
                token: authToken,
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    verified_email: newUser.verified_email,
                },
            };

        } catch (error) {
            console.error("Error en register:", error);
            return { success: false, message: error.message };
        }
    }

    static async login(email, password) {
    try {

        // DEBUG LOGS obligatorios
        console.log("🟦 LOGIN SERVICE email recibido:", email);
        console.log("🟦 LOGIN SERVICE password recibido:", password);

        const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

        console.log("🟦 USER ENCONTRADO:", user);

        if (user) {
            console.log("🟦 PASSWORD HASH EN DB:", user.password);
        }

        if (!email || !password) {
            return { success: false, message: "Email y contraseña son requeridos" };
        }

        if (!user) return { success: false, message: "El email o la contraseña son incorrectos" };

        const isPasswordValid = await bcrypt.compare(password, user.password);

        console.log("🟦 RESULTADO COMPARE BCRYPT:", isPasswordValid);

        if (!isPasswordValid) return { success: false, message: "El email o la contraseña son incorrectos" };

        if (!user.verified_email) return { success: false, message: "Por favor verifica tu email antes de iniciar sesión." };

        const token = jwt.sign(
            {
                user_id: user._id.toString(),
                username: user.username,
                email: user.email
            },
            ENVIRONMENT.JWT_SECRET,
            { expiresIn: "21d" }
        );

        return {
            success: true,
            message: "Login exitoso",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verified_email: user.verified_email,
            },
        };

    } catch (error) {
        console.error("Error en login:", error);
        return { success: false, message: "Error al iniciar sesión" };
    }
}

    static async verifyEmail(token) {
        try {
            if (!token) throw new Error("Token requerido");

            const payload = jwt.verify(token, ENVIRONMENT.JWT_SECRET);
            const user = await User.findById(payload.user_id);
            if (!user) throw new Error("Usuario no encontrado");

            if (user.verified_email) {
                return { success: true, message: "Email ya estaba verificado" };
            }

            user.verified_email = true;
            await user.save();

            return { success: true, message: "Email verificado correctamente" };

        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

export default AuthService;

