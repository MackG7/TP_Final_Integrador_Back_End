import transporter from './src/config/mailer.config.js';
import ENVIRONMENT from './src/config/environment.config.js';

async function testMail() {
    try {
        const info = await transporter.sendMail({
            from: `"Test Mailer" <${ENVIRONMENT.GMAIL_USERNAME}>`,
            to: "tu_correo_de_prueba@gmail.com", // tu correo real
            subject: " Test de correo nodemailer",
            html: `
        <h1>¡Hola! Esto es un test de nodemailer </h1>
        <p>Si ves este correo, tu configuración funciona correctamente.</p>
        `,
        });

        console.log("Correo enviado correctamente:", info.messageId);
    } catch (error) {
        console.error("Error enviando correo:", error);
    }
}

testMail()