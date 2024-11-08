const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ritiktomar468@gmail.com', // your email
        pass: 'wjyn gmgo twvq cdqw'  // use an app-specific password or OAuth2
    }
});
function generateOTP()
{
  return Math.floor(1000+Math.random()*9000).toString();
}
pass=generateOTP();
// Route to handle email sending
app.post('/sendEmail', (req, res) => {
    const { email } = req.body;

    const mailOptions = {
        from: 'ritiktomar468@gmail.com',
        to: email,
        subject: 'Email Verification',
        text: `your otp is ${pass}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error:', error);
            return res.json({ message: 'Error sending email. Try again later.' });
        } else {
            console.log('Email sent:', info.response);
        }
    });
});
app.post('/checkOTP', (req, res) => {
    const { otp1 } = req.body;
        if (otp1===pass) {
            console.alert('email verified');
        } else {
            console.alert('email not verified');
        }
});

// Serve HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});