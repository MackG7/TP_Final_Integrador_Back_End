import UserRepository from "../repositories/userRepository.js";

class UserController {

    // CREATE - Crear usuario
    static async createUser(req, res) {
        try {
            const { username, email, password } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({
                    ok: false,
                    message: "Nombre de usuario, email y contraseña son requeridos"
                });
            }

            const user = await UserRepository.createUser({ username, email, password });

            res.status(201).json({
                ok: true,
                message: "Usuario creado correctamente",
                data: user
            });
        } catch (error) {
            console.error("UserController - Error en createUser:", error);
            if (error.code === 11000) {
                return res.status(400).json({
                    ok: false,
                    message: "El email ya está registrado"
                });
            }
            res.status(400).json({
                ok: false,
                message: "Error al crear usuario",
                error: error.message
            });
        }
    }

    // READ - Obtener todos los usuarios
    static async getAllUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = {
                name: req.query.name,
                email: req.query.email
            };

            const result = await UserRepository.getAllUsers(page, limit, filters);

            res.status(200).json({
                ok: true,
                data: result.users,
                pagination: result.pagination
            });
        } catch (error) {
            console.error("UserController - Error en getAllUsers:", error);
            res.status(500).json({
                ok: false,
                message: "Error al obtener usuarios",
                error: error.message
            });
        }
    }

    // READ - Obtener usuario por ID
    static async getUserById(req, res) {
        try {
            const { userId } = req.params;
            const user = await UserRepository.getUserById(userId);

            res.status(200).json({
                ok: true,
                data: user
            });
        } catch (error) {
            console.error("UserController - Error en getUserById:", error);
            res.status(404).json({
                ok: false,
                message: error.message
            });
        }
    }

    // UPDATE - Actualizar usuario
    static async updateUser(req, res) {
        try {
            const { userId } = req.params;
            const updateData = req.body;

            const user = await UserRepository.updateUser(userId, updateData);

            res.status(200).json({
                ok: true,
                message: "Usuario actualizado correctamente",
                data: user
            });
        } catch (error) {
            console.error("UserController - Error en updateUser:", error);
            res.status(400).json({
                ok: false,
                message: "Error al actualizar usuario",
                error: error.message
            });
        }
    }

    // DELETE - Eliminar usuario
    static async deleteUser(req, res) {
        try {
            const { userId } = req.params;
            const result = await UserRepository.deleteUser(userId);

            res.status(200).json({
                ok: true,
                message: result.message
            });
        } catch (error) {
            console.error("UserController - Error en deleteUser:", error);
            res.status(400).json({
                ok: false,
                message: "Error al eliminar usuario",
                error: error.message
            });
        }
    }

    // ========== NUEVOS MÉTODOS PARA EL PERFIL ==========

    // OBTENER PERFIL DEL USUARIO AUTENTICADO
    static async getMyProfile(req, res) {
        try {
            const user = await UserRepository.getUserById(req.user._id);
            
            res.status(200).json({
                ok: true,
                data: user
            });

        } catch (error) {
            console.error("UserController - Error en getMyProfile:", error);
            res.status(404).json({
                ok: false,
                message: "Usuario no encontrado"
            });
        }
    }

    // ACTUALIZAR PERFIL DEL USUARIO AUTENTICADO
    static async updateMyProfile(req, res) {
        try {
            const { username, bio, phone } = req.body;

            // Campos permitidos para actualizar
            const updateData = {};
            if (username !== undefined) updateData.username = username;
            if (bio !== undefined) updateData.bio = bio;
            if (phone !== undefined) updateData.phone = phone;

            updateData.updatedAt = new Date();

            const updatedUser = await UserRepository.updateUser(req.user._id, updateData);

            res.status(200).json({
                ok: true,
                message: "Perfil actualizado correctamente",
                data: updatedUser
            });

        } catch (error) {
            console.error("UserController - Error en updateMyProfile:", error);
            
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    ok: false,
                    message: "Datos de entrada inválidos",
                    error: error.message
                });
            }

            res.status(500).json({
                ok: false,
                message: "Error interno del servidor"
            });
        }
    }

    // SUBIR AVATAR (Base64)
    static async uploadAvatar(req, res) {
        try {
            const { avatarBase64 } = req.body;

            if (!avatarBase64) {
                return res.status(400).json({
                    ok: false,
                    message: "Datos de imagen requeridos"
                });
            }

            // Validar que sea un base64 válido
            if (!avatarBase64.startsWith('data:image/')) {
                return res.status(400).json({
                    ok: false,
                    message: "Formato de imagen no válido"
                });
            }

            const updatedUser = await UserRepository.updateUser(req.user._id, {
                avatar: avatarBase64,
                updatedAt: new Date()
            });

            res.status(200).json({
                ok: true,
                message: "Avatar actualizado correctamente",
                data: updatedUser
            });

        } catch (error) {
            console.error("UserController - Error en uploadAvatar:", error);
            res.status(500).json({
                ok: false,
                message: "Error interno del servidor al subir avatar"
            });
        }
    }

    // BUSCAR USUARIO POR EMAIL (para agregar contactos)
    static async searchByEmail(req, res) {
        try {
            const { email } = req.query;

            if (!email) {
                return res.status(400).json({
                    ok: false,
                    message: "Email es requerido"
                });
            }

            const user = await UserRepository.findUserByEmail(email);

            if (!user) {
                return res.status(404).json({
                    ok: false,
                    message: "Usuario no encontrado"
                });
            }

            // No permitir buscar el propio usuario
            if (user._id.toString() === req.user._id.toString()) {
                return res.status(400).json({
                    ok: false,
                    message: "No puedes agregarte a ti mismo"
                });
            }

            res.status(200).json({
                ok: true,
                data: user
            });

        } catch (error) {
            console.error("UserController - Error en searchByEmail:", error);
            res.status(500).json({
                ok: false,
                message: "Error interno del servidor"
            });
        }
    }
}

export default UserController;