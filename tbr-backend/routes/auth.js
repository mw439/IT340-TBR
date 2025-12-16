const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../User');
const { exec } = require('child_process');

const router = express.Router();

// ===============================
// Logging Helper (SSH to Logger VM)
// ===============================
const logEvent = (eventType, email) => {
  const LOGGER_USER = process.env.LOGGER_USER;       // e.g., logger
  const LOGGER_IP = process.env.LOGGER_IP;           // e.g., 192.168.229.40
  const LOG_FILE = process.env.LOGGER_FILE;          // e.g., /var/log/tbr/login.log

  const timestamp = new Date().toISOString();
  const maskedEmail = email.replace(/(.{2}).+(@.+)/, "$1***$2");

  const message = `[${timestamp}] ${eventType} | email=${maskedEmail}`;

  const command = `ssh -o StrictHostKeyChecking=no ${LOGGER_USER}@${LOGGER_IP} "echo '${message}' >> ${LOG_FILE}"`;

  exec(command, (err) => {
    if (err) {
      console.error("Logging SSH Error:", err.message);
    }
  });
};

// Helper: generate JWT with id, email, and username
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ===============================
// REGISTER
// ===============================
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = generateToken(user);

    // Log register event
    logEvent("REGISTER_SUCCESS", email);

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// ===============================
// LOGIN
// ===============================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      logEvent("LOGIN_FAIL_NO_USER", email);
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      logEvent("LOGIN_FAIL_WRONG_PASSWORD", email);
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    // Log successful login
    logEvent("LOGIN_SUCCESS", email);

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

module.exports = router;
