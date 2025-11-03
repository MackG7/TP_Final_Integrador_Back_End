import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        avatar: { type: String, default: "" },
        isAdmin: { type: Boolean, default: false },
        
        // ✅ CAMPOS CRÍTICOS PARA VERIFICACIÓN DE EMAIL - AÑADE ESTOS
        isEmailVerified: { 
            type: Boolean, 
            default: false 
        },
        verifiedAt: { 
            type: Date, 
            default: null 
        },
    },
    { timestamps: true }
);

/**
 * ✅ Hook: hashear password antes de guardar
 */
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

/**
 * ✅ Método de instancia: comparar contraseñas
 */
userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

/**
 * ✅ Método estático: buscar usuario por email
 */
userSchema.statics.findByEmail = async function (email) {
    return await this.findOne({ email });
};

/**
 * ✅ Método estático: registrar nuevo usuario
 */
userSchema.statics.registerUser = async function (name, email, password) {
    const userExists = await this.findByEmail(email);
    if (userExists) throw new Error("El correo ya está en uso");

    const user = await this.create({ name, email, password });
    return user;
};

/**
 * ✅ Método estático: generar token JWT PARA VERIFICACIÓN
 */
userSchema.statics.generateVerificationToken = function (user) {
    return jwt.sign(
        { 
            email: user.email, 
            user_id: user._id  // 👈 USA user_id EN LUGAR DE id
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: "24h" }
    );
};

export default mongoose.model("User", userSchema);