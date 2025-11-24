import dotenv from "dotenv";

dotenv.config();

function required(name) {
    const value = process.env[name];
    if (!value || value.trim() === "") {
        console.error(`❌ ERROR: Falta la variable de entorno: ${name}`);
        throw new Error(`Variable de entorno faltante: ${name}`);
    }
    return value;
}

const ENVIRONMENT = {
    // Base de datos
    MONGO_DB_CONNECTION_STRING: required("MONGO_DB_CONNECTION_STRING"),

    // JWT
    JWT_SECRET: required("JWT_SECRET"),

    // URLs
    URL_FRONTEND: process.env.URL_FRONTEND || "http://localhost:5173",
    URL_API_WHATSAPP_MESSENGER:
        process.env.URL_API_WHATSAPP_MESSENGER || "http://localhost:5000",

    // Email
    EMAIL_FROM: required("EMAIL_FROM"),       
    RESEND_API_KEY: required("RESEND_API_KEY") 
};

export default ENVIRONMENT;
