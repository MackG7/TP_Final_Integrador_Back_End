import User from "../models/User.model.js"

class UserRepository {

    // CREATE - Crear usuario
    static async createUser(username, email, password) {
        // Lógica para crear el usuario en la base de datos
        const user = await User.create({
            username: username,
            email: email,
            password: password,
            verified_email: false,
            isActive: true
        })
        return user
    }

    // READ - Buscar usuario por ID
    static async getById(user_id) {
        const user_found = await User.findById(user_id)
        return user_found
    }

    // READ - Buscar usuario por email
    static async getByEmail(email) {
        const user = await User.findOne({ email: email })
        return user
    }

    // UPDATE - Actualizar usuario por ID
    static async updateById(user_id, new_values) {
        const user_updated = await User.findByIdAndUpdate(
            user_id,
            new_values,
            { new: true } // Retorna el usuario actualizado
        )
        return user_updated
    }

    // DELETE - Eliminar usuario (borrado lógico o físico)
    static async deleteById(user_id) {
        await User.findByIdAndDelete(user_id)
        return true
    }

    static async getByVerificationToken(token) {
    try {
        return await UserModel.findOne({ 
            verification_token: token 
        })
    } catch (error) {
        console.error("Error buscando usuario por token:", error)
        throw error
    }
}

static async updateUser(userId, updateData) {
    try {
        return await UserModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true } 
        )
    } catch (error) {
        console.error("Error actualizando usuario:", error)
        throw error
    }
}
}

export default UserRepository
