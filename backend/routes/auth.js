const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const otpGenerator = require('otp-generator');
const User = require('../models/User');
const OTP = require('../models/OTP');
const auth = require('../middleware/auth');
const mailSender = require('../services/mailSender');

// @route   POST api/auth/sendotp
// @desc    Generate and send OTP
// @access  Public
router.post('/sendotp', async (req, res) => {
    try {
        const { email } = req.body;
        
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists with this email' });
        }

        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
        
        // Hash OTP before saving
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);

        const newOtp = new OTP({ email, otp: hashedOtp });
        await newOtp.save();

        const title = "Verification Email from MeetSync";
        const body = `<h1>Please confirm your email</h1>
                      <p>Here is your 6-digit verification code: <b>${otp}</b></p>
                      <p>This code will expire in 5 minutes.</p>`;
        
        await mailSender(email, title, body);

        res.status(200).json({ msg: 'OTP sent successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/signup
// @desc    Register a user
// @access  Public
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password, otp } = req.body;

        if (!otp) {
            return res.status(400).json({ msg: 'OTP is required' });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists with this email' });
        }
        
        user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'Username is already taken' });
        }

        // Verify OTP
        const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);
        if (!recentOtp) {
            return res.status(400).json({ msg: 'OTP not found. Please request a new one.' });
        }

        const isValidOtp = await bcrypt.compare(otp, recentOtp.otp);
        if (!isValidOtp) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }

        user = new User({ username, email, password });
        await user.save();

        const payload = { user: { id: user.id, username: user.username } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id, username: user.username } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth/me
// @desc    Get user data
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
