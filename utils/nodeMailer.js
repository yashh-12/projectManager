import mailer from "nodemailer"

const transporter = mailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
})
const sendVerificationEmail = async (to) => {
    const otp = Math.floor(100000 + Math.random() * 900000); 
    
    const mailOptions = {
        from: process.env.EMAIL,
        to,
        subject: "Verification Email",
        text: `Your Verification Code is ${otp}`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }

    return otp;
};


export default sendVerificationEmail;