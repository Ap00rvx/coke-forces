const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: process.env.APP_EMAIL ,
        pass: process.env.APP_PASSWORD ,
    },
});

const sendMail = async (toEmail,name, cfHandle) =>{
    const mailOptions = {
        from: process.env.APP_EMAIL,
        to: toEmail,
        subject: 'Ready for Your Next Codeforces Challenge?',
        html: `
            <h2>Hello ${name} (${cfHandle}),</h2>
            <p>We noticed you haven't solved any Codeforces problems lately. Your journey to becoming a better problem solver awaits!</p>
            <p>
                <strong>Why not pick up where you left off?</strong><br>
                Visit your profile: 
                <a href="https://codeforces.com/profile/${cfHandle}">https://codeforces.com/profile/${cfHandle}</a>
            </p>
            <p>
                New contests and problems are waiting for you. Sharpen your skills, climb the ranks, and enjoy the thrill of problem solving!
            </p>
            <p>Happy coding and best of luck!</p>
            <p>— Team Coke-Forces</p>
            <hr>
            <p style="font-size:small;color:gray;">
                If you wish to stop receiving these reminders, please contact us or update your notification settings.
            </p>
        `,
    }
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${toEmail}`);
    }catch (error) {
        console.error(`Error sending email to ${toEmail}:`, error);
        throw new Error(`Failed to send email to ${toEmail}`);
    }
}

module.exports = {
    sendMail
}