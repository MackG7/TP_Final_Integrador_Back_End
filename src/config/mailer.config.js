import nodemailer from 'nodemailer'
import ENVIRONMENT from './environment.config.js'


//La configuracion para nuestro mailer 

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: ENVIRONMENT.GMAIL_USERNAME,
        pass: ENVIRONMENT.GMAIL_PASSWORD,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Error al conectar con el servidor de correo:", error);
    } else {
        console.log("✅ Servidor de correo listo para enviar mensajes");
    }
});
export default transporter

