import { resend } from "../config/resend.config.js";

export const EmailService = {
    async sendVerificationEmail(email, token) {
        const url = `${process.env.FRONTEND_URL}/verify?token=${token}`;

        const html = `
            <h2>Verifica tu cuenta</h2>
            <p>Gracias por registrarte en nuestra app.</p>
            <p>Haz clic en el botón para verificar tu cuenta:</p>
            
            <a 
                href="${url}" 
                style="
                    display: inline-block;
                    background-color: #4CAF50;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 6px;
                    text-decoration: none;
                    font-weight: bold;
                "
            >
                Verificar Cuenta
            </a>

            <p style="margin-top:20px;">Si no solicitaste esta verificación, puedes ignorar este mensaje.</p>
        `;

        try {
            const result = await resend.emails.send({
                from: process.env.EMAIL_FROM, // debe ser dominio verificado
                to: email,
                subject: "Verifica tu cuenta",
                html
            });

            console.log("📧 Email enviado ✔", result);
            return result;

        } catch (error) {
            console.error("❌ Error enviando email:", error);
            throw new Error("No se pudo enviar el correo de verificación");
        }
    }
};
