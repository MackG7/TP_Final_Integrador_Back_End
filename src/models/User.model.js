import mongoose from "mongoose"

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "El nombre de usuario es requerido"],
            minlength: [3, "El nombre de usuario debe tener al menos 3 caracteres"],
            maxlength: [30, "El nombre de usuario no puede superar los 30 caracteres"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "El email es requerido"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/.+@.+\..+/, "Por favor ingresa un email válido"],
        },
        password: {
            type: String,
            required: [true, "La contraseña es requerida"],
            minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
            select: false, // No se devuelve por defecto en las consultas
        },
        verified_email: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true, // Crea createdAt y updatedAt automáticamente
    }
)

// Opcional: eliminar el campo __v en las respuestas JSON
UserSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.__v
        return ret
    },
})

const User = mongoose.model("User", UserSchema)

export default User