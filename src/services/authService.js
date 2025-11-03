import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import transporter from "../config/mailer.config.js";
import ENVIRONMENT from "../config/environment.config.js";

class AuthService {
    static async register(name, email, password) {
        try {
            console.log('🔍 Iniciando registro para:', { name, email });

            // ✅ VALIDACIONES MEJORADAS
            if (!name || !email || !password) {
                throw new Error("Nombre, email y contraseña son requeridos");
            }

            if (typeof password !== 'string' || password.length < 6) {
                throw new Error("La contraseña debe tener al menos 6 caracteres");
            }

            // ✅ VERIFICAR SI EL USUARIO EXISTE
            const userExists = await User.findOne({ email });
            if (userExists) {
                return { 
                    success: false, 
                    error: "El email ya está en uso",
                    message: "El email ya está en uso" 
                };
            }

            // ✅ HASH DE CONTRASEÑA CON VALIDACIÓN
            let hashedPassword;
            try {
                hashedPassword = await bcrypt.hash(password, 10);
                console.log('✅ Contraseña hasheada correctamente');
            } catch (hashError) {
                console.error('❌ Error al hashear contraseña:', hashError);
                throw new Error("Error al procesar la contraseña");
            }

            // ✅ CREAR USUARIO
            const newUser = await User.create({
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                isEmailVerified: false,
            });

            console.log('✅ Usuario creado en BD:', newUser.email);

            // ✅ GENERAR TOKEN DE VERIFICACIÓN
            const verificationToken = jwt.sign(
                { 
                    email: newUser.email, 
                    user_id: newUser._id.toString()  // ✅ Asegurar que sea string
                },
                ENVIRONMENT.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // ✅ GENERAR TOKEN DE AUTENTICACIÓN
            const authToken = jwt.sign(
                { 
                    id: newUser._id.toString(),  // ✅ Asegurar que sea string
                    email: newUser.email,
                    name: newUser.name
                },
                ENVIRONMENT.JWT_SECRET,
                { expiresIn: "7d" }
            );

            // ✅ ENVÍO DE EMAIL CON MANEJO MEJORADO DE ERRORES
            if (transporter && ENVIRONMENT.GMAIL_USERNAME) {
                try {
                    const mailOptions = {
                        from: ENVIRONMENT.GMAIL_USERNAME,
                        to: newUser.email,
                        subject: "Verificación de correo electrónico - WhatsApp Messenger",
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #25D366;">¡Bienvenido a WhatsApp Messenger, ${newUser.name}! 👋</h2>
                                <p>Gracias por registrarte. Para activar tu cuenta, por favor verifica tu dirección de email:</p>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${ENVIRONMENT.URL_API_BACKEND}/api/auth/verify-email/${verificationToken}" 
                                    style="background-color: #25D366; color: white; padding: 12px 24px; 
                                    text-decoration: none; border-radius: 8px; font-weight: bold;
                                    display: inline-block;">
                                    Verificar Mi Email
                                    </a>
                                </div>
                                
                                <p>O copia y pega este enlace en tu navegador:</p>
                                <p style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; 
                                word-break: break-all;">
                                    ${ENVIRONMENT.URL_API_BACKEND}/api/auth/verify-email/${verificationToken}
                                </p>
                                
                                <p><strong>Importante:</strong> Este enlace expirará en 24 horas.</p>
                                
                                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                                <p style="color: #666; font-size: 12px;">
                                    Si no te registraste en WhatsApp Messenger, por favor ignora este mensaje.
                                </p>
                            </div>
                        `,
                    };

                    await transporter.sendMail(mailOptions);
                    console.log('✅ Email de verificación enviado a:', newUser.email);
                } catch (emailError) {
                    console.error('❌ Error enviando email de verificación:', emailError);
                    // No lanzar error, continuar con el registro
                }
            } else {
                console.warn('⚠️ Transporter no configurado, no se envió email de verificación');
            }

            return {
                success: true,
                message: "Usuario registrado. Revisa tu correo para verificar tu cuenta.",
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    isEmailVerified: newUser.isEmailVerified,
                },
                token: authToken,
            };

        } catch (error) {
            console.error("❌ Error en register service:", error.message);
            
            // ✅ RETORNAR OBJETO DE ERROR CONSISTENTE
            return {
                success: false,
                error: error.message,
                message: error.message
            };
        }
    }

    static async login(email, password) {
        try {
            console.log('🔍 AuthService - Buscando usuario por email:', email);
            
            // ✅ VALIDACIONES DE ENTRADA
            if (!email || !password) {
                return { 
                    success: false, 
                    error: "Email y contraseña son requeridos",
                    message: "Email y contraseña son requeridos" 
                };
            }

            const user = await User.findOne({ email: email.toLowerCase().trim() });
            if (!user) {
                console.log('❌ No existe usuario con email:', email);
                return { 
                    success: false, 
                    error: "El email o la contraseña son incorrectos",
                    message: "El email o la contraseña son incorrectos" 
                };
            }

            console.log('✅ Usuario encontrado:', user.email);

            // ✅ VALIDAR CONTRASEÑA
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                console.log('❌ Contraseña incorrecta para:', user.email);
                return { 
                    success: false, 
                    error: "El email o la contraseña son incorrectos",
                    message: "El email o la contraseña son incorrectos" 
                };
            }

            // ✅ VERIFICAR EMAIL
            if (!user.isEmailVerified) {
                console.log('❌ Usuario no ha verificado su email:', user.email);
                return { 
                    success: false, 
                    error: "Por favor verifica tu email antes de iniciar sesión.",
                    message: "Por favor verifica tu email antes de iniciar sesión." 
                };
            }

            // ✅ GENERAR TOKEN
            const token = jwt.sign(
                {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin || false,
                },
                ENVIRONMENT.JWT_SECRET,
                { expiresIn: "14d" }
            );

            console.log('✅ Login exitoso para:', user.email);
            
            return {
                success: true,
                message: "Login exitoso",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    isEmailVerified: user.isEmailVerified,
                    isAdmin: user.isAdmin || false,
                },
            };

        } catch (error) {
            console.error("❌ Error en login service:", error.message);
            return {
                success: false,
                error: "Error al iniciar sesión",
                message: "Error al iniciar sesión"
            };
        }
    }

    /* Verificar email del usuario */
    static async verifyEmail(token) {
        try {
            console.log('🔍 Verificando email en AuthService...');
            
            if (!token) {
                throw new Error("Token de verificación requerido");
            }

            const payload = jwt.verify(token, ENVIRONMENT.JWT_SECRET);
            console.log('✅ Token decodificado:', payload);

            const user = await User.findById(payload.user_id);
            if (!user) {
                throw new Error("Usuario no encontrado");
            }

            console.log('✅ Usuario encontrado:', user.email);
            console.log('📊 Estado de verificación actual:', user.isEmailVerified);

            if (user.isEmailVerified) {
                return { 
                    success: true, 
                    message: "El email ya estaba verificado anteriormente",
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        isEmailVerified: user.isEmailVerified
                    }
                };
            }

            user.isEmailVerified = true;
            user.verifiedAt = new Date();
            await user.save();

            console.log('✅ Email marcado como verificado para:', user.email);

            return { 
                success: true, 
                message: "Email verificado correctamente",
                user: {
                    id: user._id,
                    name: user._id,
                    email: user.email,
                    isEmailVerified: user.isEmailVerified
                }
            };

        } catch (error) {
            console.error("❌ Error en verifyEmail:", error);
            
            if (error.name === 'JsonWebTokenError') {
                throw new Error("Token inválido");
            }
            
            if (error.name === 'TokenExpiredError') {
                throw new Error("Token expirado");
            }
            
            throw new Error(error.message || "Error al verificar el email");
        }
    }

    /* Obtener perfil de usuario */
    static async getProfile(userId) {
        try {
            if (!userId) {
                throw new Error("ID de usuario requerido");
            }

            const user = await User.findById(userId).select('-password');
            if (!user) {
                throw new Error("Usuario no encontrado");
            }

            return {
                success: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    isEmailVerified: user.isEmailVerified,
                    isAdmin: user.isAdmin || false,
                }
            };

        } catch (error) {
            console.error("❌ Error en getProfile:", error.message);
            throw new Error(error.message || "Error al obtener el perfil");
        }
    }

    /* ✅ NUEVO: Verificar token */
    static async verifyToken(token) {
        try {
            if (!token) {
                throw new Error("Token requerido");
            }

            const payload = jwt.verify(token, ENVIRONMENT.JWT_SECRET);
            const user = await User.findById(payload.id).select('-password');
            
            if (!user) {
                throw new Error("Usuario no encontrado");
            }

            return {
                success: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isEmailVerified: user.isEmailVerified,
                    isAdmin: user.isAdmin || false,
                }
            };

        } catch (error) {
            console.error("❌ Error en verifyToken:", error.message);
            throw new Error("Token inválido o expirado");
        }
    }
}

export default AuthService;




