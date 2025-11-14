import AuthService from '../services/authService.js';
import UserRepository from '../repositories/userRepository.js'; 
import { ServerError } from '../utils/customError.utils.js';


const registerUser = async (req, res) => {
    try {
        console.log('🔍 BACKEND - Body completo recibido:', req.body);
        console.log('🔍 BACKEND - Tipo de body:', typeof req.body);
        console.log('🔍 BACKEND - Keys del body:', Object.keys(req.body));
        
        const username = req.body.username || req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        
        console.log('🔍 BACKEND - username/name:', username);
        console.log('🔍 BACKEND - email:', email);
        console.log('🔍 BACKEND - password:', password ? '***' : 'NO PRESENTE');

        if (!username) {
            console.log('❌ FALTA username/name');
            return res.status(400).json({
                success: false,
                message: 'El campo nombre de usuario (username/name) es requerido'
            });
        }

        if (!email) {
            console.log('❌ FALTA email');
            return res.status(400).json({
                success: false,
                message: 'El campo email es requerido'
            });
        }

        if (!password) {
            console.log('❌ FALTA password');
            return res.status(400).json({
                success: false,
                message: 'El campo password es requerido'
            });
        }

        const result = await AuthService.register(username, email, password);
        
        return res.status(201).json({
            success: true,
            message: result.message,
            user: result.user
        });
    } catch (error) {
        console.error('❌ Error en registerUser:', error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email y password son requeridos'
            });
        }

        const result = await AuthService.login(email, password);

        return res.status(200).json({
            success: true,
            message: result.message,
            token: result.token,       
            user: result.user       
        });

    } catch (error) {
        console.error('❌ Error en loginUser:', error);
        
        if (error.message === 'Email no verificado') {
            return res.status(401).json({
                success: false,
                message: error.message,
                needsVerification: true
            });
        }
        
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token de verificación es requerido'
            });
        }

        const result = await AuthService.verifyEmail(token);
        
        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('❌ Error verificando email:', error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email es requerido'
            });
        }

        const result = await AuthService.resendVerificationEmail(email);
        
        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('❌ Error reenviando verificación:', error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};


const getUserProfile = async (req, res) => {
    try {
        const user = req.user;
        
        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.name,
                email: user.email,
                verified_email: user.verified_email
            }
        });
    } catch (error) {
        console.error('❌ Error obteniendo perfil:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};


const verifyToken = async (req, res) => {
    try {
        const user = req.user;
        return res.status(200).json({
            success: true,
            message: 'Token válido',
            user: {
                id: user._id,
                username: user.name,
                email: user.email,
                verified_email: user.verified_email
            }
        });
    } catch (error) {
        console.error('❌ Error verificando token:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};


const debugUser = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email es requerido'
            });
        }

        const user = await UserRepository.getByEmail(email);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.name,
                email: user.email,
                verified_email: user.verified_email,
                verification_token: user.verification_token ? 'Presente' : 'No presente',
                verification_token_expires: user.verification_token_expires
            }
        });
    } catch (error) {
        console.error('❌ Error en debugUser:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};


const pendingInvite = await Invite.findOne({ invitedEmail:email, used:false });
if(pendingInvite){
    
    await Contact.create({
        owner: pendingInvite.owner,
        contactUser: newUser._id
    });

    await Contact.create({
        owner: newUser._id,
        contactUser: pendingInvite.owner
    });

    pendingInvite.used = true;
    await pendingInvite.save();
}


const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        
        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email y nueva contraseña son requeridos'
            });
        }


        return res.status(200).json({
            success: true,
            message: 'Password reset functionality to be implemented'
        });
    } catch (error) {
        console.error('❌ Error reseteando password:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

export {
    registerUser,
    loginUser,
    getUserProfile,
    verifyEmail,
    verifyToken,
    debugUser,
    resetPassword,
    resendVerificationEmail
};


