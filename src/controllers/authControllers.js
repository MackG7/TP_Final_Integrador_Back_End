import AuthService from "../services/authService.js";
import ENVIRONMENT from '../config/environment.config.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const result = await AuthService.register(name, email, password);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        console.log('🔍 BACKEND - Body recibido:', req.body);
        console.log('🔍 BACKEND - Tipo de email:', typeof req.body.email);
        console.log('🔍 BACKEND - Email value:', req.body.email);
        
        const { email, password } = req.body;
        
        // Validar que email sea string
        if (typeof email !== 'string') {
            console.error('❌ BACKEND - Email no es string:', email);
            return res.status(400).json({
                success: false,
                error: 'Formato de email inválido'
            });
        }
    } catch (err) {
        console.error("Error en loginUser:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = await AuthService.getProfile(req.user._id);
        res.json(user);
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        console.log('INICIANDO VERIFICACIÓN DE EMAIL ==================');
        
        // OBTENER EL TOKEN CORRECTAMENTE
        const { token } = req.params;
        
        console.log('Token extraído:', token ? token.substring(0, 20) + '...' : '❌ UNDEFINED');
        console.log('URL_API_WHATSAPP_MESSENGER:', ENVIRONMENT.URL_API_WHATSAPP_MESSENGER);
        
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token de verificación requerido'
            });
        }

        console.log('Verificando token JWT...');

        // Verificar el token JWT usando la variable de entorno
        const decoded = jwt.verify(token, ENVIRONMENT.JWT_SECRET);
        console.log('Token decodificado:', decoded);

        // Buscar el usuario en la base de datos
        console.log('Buscando usuario con ID:', decoded.user_id);
        const user = await User.findById(decoded.user_id);
        
        if (!user) {
            console.log('Usuario no encontrado con ID:', decoded.user_id);
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        console.log('Usuario encontrado:', user.email);
        console.log('Estado de verificación actual:', user.isEmailVerified);

        // Verificar si el email ya está verificado
        if (user.isEmailVerified) {
            console.log('Email ya estaba verificado');
            return res.status(400).json({
                success: true,
                message: 'El email ya está verificado'
            });
        }

        // Marcar el email como verificado
        console.log('🔄 Marcando email como verificado...');
        user.isEmailVerified = true;
        user.verifiedAt = new Date();
        await user.save();

        console.log('✅ Email verificado exitosamente para:', user.email);

        // Respuesta exitosa
        res.status(200).json({
            success: true,
            message: 'Email verificado exitosamente',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isEmailVerified: user.isEmailVerified
            }
        });

    } catch (error) {
        console.error('💥 ERROR EN VERIFICACIÓN:', error.message);
        console.error('📋 Detalles del error:');
        console.error('   - Nombre:', error.name);
        console.error('   - Mensaje:', error.message);

        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({
                success: false,
                message: 'El token ha expirado'
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario inválido'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// 🔥 FUNCIÓN PARA ENVIAR EMAIL DE VERIFICACIÓN - AÑADE ESTA FUNCIÓN
export const sendVerificationEmail = async (user, token) => {
    try {
        const verificationUrl = `${ENVIRONMENT.URL_API_WHATSAPP_MESSENGER}/api/auth/verify-email/${token}`;
        
        console.log('📧 ENVIANDO EMAIL DE VERIFICACIÓN ==================');
        console.log('🔗 URL de verificación:', verificationUrl);
        console.log('👤 Para usuario:', user.email);
        console.log('📧 Desde:', ENVIRONMENT.GMAIL_USERNAME);
        
    } catch (error) {
        console.error('❌ Error preparando email de verificación:', error);
    }
};

export const verifyToken = async (req, res) => {
    try {
        // El usuario ya está disponible por el middleware de auth
        const user = req.user;
        
        console.log('✅ Token verificado para usuario:', user.email);
        
        // ✅ Estructura de respuesta que el frontend espera
        res.json({
            success: true,
            user: {
                id: user._id || user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin || false
            },
            message: 'Token válido'
        });
        
    } catch (error) {
        console.error('❌ Error en verifyToken:', error);
        res.status(401).json({
            success: false,
            error: 'Token inválido o expirado'
        });
    }
};