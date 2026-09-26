import nodemailer from 'nodemailer'

export const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'sufiyanfaisal90@gmail.com',
                pass: process.env.AppPassword
            }
        });

        const mailOptions = {
            from: 'sufiyanfaisal90@gmail.com',
            to: email,
            subject: subject,
            text: text
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
    } catch (error) {
        console.error(error);
    }
} 