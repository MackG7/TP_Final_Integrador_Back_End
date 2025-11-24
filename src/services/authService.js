import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { resend } from "../config/mailer.config.js";
import ENVIRONMENT from "../config/environment.config.js";

class AuthService {

    static async register(username, email, password) {
        try {

            // Validación básica
            if (!username || !email || !password) {
                throw new Error("Username, email y contraseña son requeridos");
            }

            if (password.length < 6) {
                throw new Error("La contraseña debe tener al menos 6 caracteres");
            }

            // Verificar email duplicado
            const userExists = await User.findOne({ email });
            if (userExists) {
                return { success: false, message: "El email ya está en uso" };
            }

            // Hashear contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Crear usuario
            const newUser = await User.create({
                username: username.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                verified_email: false,
            });

            // Token para verificar email
            const verificationToken = jwt.sign(
                {
                    email: newUser.email,
                    user_id: newUser._id.toString()
                },
                ENVIRONMENT.JWT_SECRET,
                { expiresIn: "24h" }
            );

            // Token de login
            const authToken = jwt.sign(
                {
                    user_id: newUser._id.toString(),
                    username: newUser.username,
                    email: newUser.email
                },
                ENVIRONMENT.JWT_SECRET,
                { expiresIn: "21d" }
            );

            // Construcción del link
            const verificationURL = `${ENVIRONMENT.URL_API_WHATSAPP_MESSENGER}/api/auth/verify-email/${verificationToken}`;

            // HTML del correo
            const emailHTML = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #25D366;">¡Bienvenido ${newUser.username}! 👋</h2>
                    <p>Gracias por registrarte en WhatsApp Messenger.</p>
                    <p>Haz clic en el botón para verificar tu dirección de email:</p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationURL}" 
                        style="background-color: #25D366; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Verificar Mi Email
                        </a>
                    </div>

                    <p>Si no solicitaste esta cuenta, simplemente ignora este mensaje.</p>
                </div>
            `;

            // ENVÍO REAL CON RESEND 
            await resend.emails.send({
                from: process.env.EMAIL_FROM,
                to: newUser.email,
                subject: "Verificación de correo electrónico",
                html: emailHTML,
            });

            return {
                success: true,
                message: "Usuario registrado correctamente. Verifica tu email.",
                token: authToken,
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    verified_email: newUser.verified_email,
                },
            };

        } catch (error) {
            console.error("❌ Error en register:", error);
            return { success: false, message: error.message };
        }
    }

    static async login(email, password) {
        try {
            if (!email || !password) {
                return { success: false, message: "Email y contraseña son requeridos" };
            }

            const user = await User.findOne({ email: email.toLowerCase().trim() })
                .select("+password");

            if (!user) {
                return { success: false, message: "email_not_found" };
            }

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
                return { success: false, message: "wrong_password" };
            }

            if (!user.verified_email) {
                return { success: false, message: "email_not_verified" };
            }

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
                }
            };

        } catch (error) {
            console.error("🔥 ERROR EN LOGIN:", error);
            return { success: false, message: error.message };
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
            console.error("❌ Error en verifyEmail:", error);
            return { success: false, message: error.message };
        }
    }
}

export default AuthService;
