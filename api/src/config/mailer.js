const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,       
        pass: process.env.EMAIL_PASSWORD,  
    },
});

async function sendConfirmationEmail(to, subject, text) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Correo enviado exitosamente");
    } catch (error) {
        console.error("Error enviando correo:", error);
    }
}

module.exports = { sendConfirmationEmail };