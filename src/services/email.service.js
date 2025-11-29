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
                from: process.env.EMAIL_FROM, 
                to: email,
                subject: "Verifica tu cuenta",
                html
            });

            console.log("📧 Email de verificación enviado ✔", result);
            return result;

        } catch (error) {
            console.error("❌ Error enviando email de verificación:", error);
            throw new Error("No se pudo enviar el correo de verificación");
        }
    },

    async sendInvitationEmail(email, ownerName, inviteLink) {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #25D366;">¡Te han invitado a WhatsApp!</h2>
                <p>Hola,</p>
                <p><strong>${ownerName}</strong> te ha invitado a unirte a WhatsApp Messenger.</p>
                <p>Para crear tu cuenta y comenzar a chatear, haz clic en el siguiente enlace:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${inviteLink}" 
                       style="
                           background-color: #25D366; 
                           color: white; 
                           padding: 12px 24px; 
                           text-decoration: none; 
                           border-radius: 5px; 
                           font-weight: bold;
                           display: inline-block;
                       ">
                        Unirme a WhatsApp
                    </a>
                </div>
                
                <p>O copia y pega este enlace en tu navegador:</p>
                <p style="
                    background-color: #f5f5f5; 
                    padding: 10px; 
                    border-radius: 5px; 
                    word-break: break-all; 
                    font-size: 14px;
                ">
                    ${inviteLink}
                </p>
                
                <p><em>Este enlace de invitación expirará en 24 horas.</em></p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                
                <p style="color: #666; font-size: 12px;">
                    Si no esperabas esta invitación, puedes ignorar este mensaje.
                </p>
            </div>
        `;

        try {
            const result = await resend.emails.send({
                from: process.env.EMAIL_FROM, 
                to: email,
                subject: "¡Invitación para unirte a WhatsApp!",
                html
            });

            console.log("📧 Email de invitación enviado ✔", result);
            return result;

        } catch (error) {
            console.error("❌ Error enviando email de invitación:", error);
            throw new Error("No se pudo enviar el correo de invitación");
        }
    }
};