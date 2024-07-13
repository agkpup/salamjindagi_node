const express = require('express');
const router = express.Router();
const twilio = require('twilio');

// Twilio credentials
const accountSid = 'AC23356d33a6622a33e105cb493d504676';
const authToken = 'd6c7afc5a4ec6e25f8fe996f3e25049b';
const client = twilio(accountSid, authToken);

// In-memory store for OTPs
const otpStore = {};

// Function to generate random OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}

// Route to send OTP via SMS
router.post('/send-otp', async (req, res) => {
    const phoneNumber = req.body.phoneNumber;
    console.log(req.body.phoneNumber);

    try {
        // Generate OTP
        const otp = generateOTP();

        // Store OTP in the in-memory store
        otpStore[phoneNumber] = otp;

        // Send OTP message using Twilio
        const message = await client.messages.create({
            body: `Welcome to salam Jindagi. Your OTP for login: ${otp}`,
            from: 'whatsapp:+14155238886', // Replace with your Twilio phone number
            to: `whatsapp:+91${phoneNumber}` // Receiver's phone number in E.164 format
        });

        console.log(`OTP sent to +91${phoneNumber}: ${message.sid}`);
        res.send({ message: 'OTP sent successfully', code: 'WA_SEND_SUCCESS' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).send({ message: 'Failed to send OTP', code: 'WA_SEND_FAILURE' });
    }
});

// Route to verify OTP
router.post('/verify-otp', (req, res) => {
    const { phoneNumber, otp } = req.body;
    const storedOtp = otpStore[phoneNumber];

    console.log({ body: req.body, otpToMatch: storedOtp });

    if (!storedOtp || otp !== storedOtp.toString()) {
        return res.status(400).send({ message: 'Invalid OTP', code: 'OTP_INVALID' });
    } else {
        // Example: Set authenticated session
        req.session.isAuthenticated = true;

        // Clear OTP from the in-memory store after successful verification
        delete otpStore[phoneNumber];

        // Example: Redirect to authenticated dashboard
        res.send({ message: 'OTP has been successfully verified', code: 'OTP_SUCCESS', redirect: true, authenticated: true });
    }
});

// Route to check authentication status
router.get('/check-auth', (req, res) => {
    if (req.session.isAuthenticated) {
        res.send('User is authenticated');
    } else {
        res.status(401).send('User is not authenticated');
    }
});

// Route to logout (clear session)
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Failed to logout');
        } else {
            res.send('Logged out successfully');
        }
    });
});

module.exports = router;
