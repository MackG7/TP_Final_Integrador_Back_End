import User from "../models/User.model.js";

class UserRepository {

    static async createUser(userData) {
        const user = await User.create({
            username: userData.username,
            email: userData.email,
            password: userData.password,
            verified_email: false,
            isActive: true
        });
        return user;
    }

    static async getById(user_id) {
        const user_found = await User.findById(user_id);
        return user_found;
    }

    static async getByEmail(email) {
        const user = await User.findOne({ email: email });
        return user;
    }

    static async findUserByEmail(email) {
        try {
            const user = await User.findOne({ 
                email: { $regex: new RegExp(`^${email}$`, 'i') } 
            })
            .select('_id username email avatar isActive')
            .lean();
            return user;
        } catch (error) {
            console.error("UserRepository - Error en findUserByEmail:", error);
            throw error;
        }
    }

    static async updateById(user_id, new_values) {
        const user_updated = await User.findByIdAndUpdate(
            user_id,
            new_values,
            { new: true }
        );
        return user_updated;
    }

    static async deleteById(user_id) {
        await User.findByIdAndDelete(user_id);
        return true;
    }

    static async getByVerificationToken(token) {
        try {
            return await User.findOne({ 
                verification_token: token 
            });
        } catch (error) {
            console.error("Error buscando usuario por token:", error);
            throw error;
        }
    }

    static async updateUser(userId, updateData) {
        try {
            return await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true } 
            );
        } catch (error) {
            console.error("Error actualizando usuario:", error);
            throw error;
        }
    }

    static async getUserById(userId) {
        try {
            return await User.findById(userId);
        } catch (error) {
            console.error("Error obteniendo usuario por ID:", error);
            throw error;
        }
    }

    static async getAllUsers(page = 1, limit = 10, filters = {}) {
        try {
            const skip = (page - 1) * limit;
            const query = {};
            
            if (filters.name) {
                query.username = { $regex: filters.name, $options: 'i' };
            }
            if (filters.email) {
                query.email = { $regex: filters.email, $options: 'i' };
            }

            const users = await User.find(query)
                .select('-password')
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await User.countDocuments(query);

            return {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error("Error obteniendo usuarios:", error);
            throw error;
        }
    }

    static async deleteUser(userId) {
        try {
            await User.findByIdAndDelete(userId);
            return { message: "Usuario eliminado correctamente" };
        } catch (error) {
            console.error("Error eliminando usuario:", error);
            throw error;
        }
    }
}

export default UserRepository;