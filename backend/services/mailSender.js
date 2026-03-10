const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
    try {
        // Create a Transporter to send emails
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Send emails to users
        let info = await transporter.sendMail({
            from: 'MeetSync <no-reply@meetsync.com>',
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        });

        console.log("Email info: ", info);
        return info;
    } catch (error) {
        console.error("Error sending email: ", error.message);
        throw new Error(error.message);
    }
};

module.exports = mailSender;
