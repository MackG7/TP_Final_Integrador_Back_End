import { Resend } from "resend";
import ENVIRONMENT from "./environment.config.js";

// Validación para evitar errores silenciosos
if (!ENVIRONMENT.RESEND_API_KEY) {
    console.error("❌ ERROR: RESEND_API_KEY no está definido en el archivo .env");
    throw new Error("RESEND_API_KEY requerido");
}

// Inicialización de Resend
export const resend = new Resend(ENVIRONMENT.RESEND_API_KEY);

// Log opcional para desarrollo
if (ENVIRONMENT.NODE_ENV !== "production") {
    console.log(" Resend inicializado correctamente");
}
