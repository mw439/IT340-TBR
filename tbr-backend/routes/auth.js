const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../User');
const { exec } = require('child_process');

// MFA libs
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const router = express.Router();

// ===============================
// Logging Helper (SSH to Logger VM)
// ===============================
const logEvent = (eventType, email) => {
  const LOGGER_USER = process.env.LOGGER_USER;       // e.g., logger
  const LOGGER_IP = process.env.LOGGER_IP;           // e.g., 192.168.229.40
  const LOG_FILE = process.env.LOGGER_FILE;          // e.g., /var/log/tbr/login.log

  const timestamp = new Date().toISOString();
  const maskedEmail = String(email || '').replace(/(.{2}).+(@.+)/, "$1***$2");

  const message = `[${timestamp}] ${eventType} | email=${maskedEmail}`;

  const command = `ssh -o StrictHostKeyChecking=no ${LOGGER_USER}@${LOGGER_IP} "echo '${message}' >> ${LOG_FILE}"`;

  exec(command, (err) => {
    if (err) {
      console.error("Logging SSH Error:", err.message);
    }
  });
};

// ===============================
// Auth middleware (no new file)
// ===============================
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: 'No token provided.' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
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

// Helper: short-lived token used ONLY for MFA verification step
const generateTempMfaToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      mfa: true,
    },
    process.env.JWT_SECRET,
    { expiresIn: '5m' }
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

    const user = new User({
      username,
      email,
      password,
      mfaEnabled: false,
      mfaSecret: null,
    });

    await user.save();

    const token = generateToken(user);

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
// LOGIN (Step 1)
// If MFA enabled => return mfaRequired + tempToken
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

    // If MFA is enabled for this user, require MFA code
    if (user.mfaEnabled) {
      const tempToken = generateTempMfaToken(user);
      logEvent("LOGIN_MFA_REQUIRED", email);

      return res.json({
        message: 'MFA required.',
        mfaRequired: true,
        tempToken,
      });
    }

    // Normal login
    const token = generateToken(user);
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

// ===============================
// MFA SETUP (logged in)
// Returns QR Data URL
// ===============================
router.post('/mfa/setup', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Create new secret each time setup is called (simple for class project)
    const secret = speakeasy.generateSecret({
      name: `TBR (${user.email})`,
    });

    user.mfaSecret = secret.base32;
    user.mfaEnabled = false; // only enabled after confirm
    await user.save();

    const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);

    logEvent("MFA_SETUP_CREATED", user.email);

    return res.json({
      message: 'Scan this QR code with Google/Microsoft Authenticator.',
      qrDataUrl,
    });
  } catch (err) {
    console.error('MFA setup error:', err.message);
    res.status(500).json({ message: 'Server error during MFA setup.' });
  }
});

// ===============================
// MFA ENABLE (logged in)
// Verify one code, then turn MFA on
// ===============================
router.post('/mfa/enable', requireAuth, async (req, res) => {
  try {
    const { token } = req.body; // 6-digit code
    if (!token) return res.status(400).json({ message: 'Missing MFA code.' });

    const user = await User.findById(req.user.id);
    if (!user || !user.mfaSecret) {
      return res.status(400).json({ message: 'MFA not set up yet.' });
    }

    const ok = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: String(token),
      window: 1,
    });

    if (!ok) {
      logEvent("MFA_ENABLE_FAIL", user.email);
      return res.status(400).json({ message: 'Invalid MFA code.' });
    }

    user.mfaEnabled = true;
    await user.save();

    logEvent("MFA_ENABLED", user.email);
    return res.json({ message: 'MFA enabled successfully.' });
  } catch (err) {
    console.error('MFA enable error:', err.message);
    res.status(500).json({ message: 'Server error during MFA enable.' });
  }
});

// ===============================
// MFA VERIFY (Step 2 of login)
// tempToken + 6-digit code => returns real JWT
// ===============================
router.post('/mfa/verify', async (req, res) => {
  try {
    const { tempToken, token } = req.body;
    if (!tempToken || !token) {
      return res.status(400).json({ message: 'Missing tempToken or MFA code.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: 'Invalid or expired temp token.' });
    }

    if (!decoded.mfa) {
      return res.status(401).json({ message: 'Not an MFA login token.' });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      return res.status(400).json({ message: 'MFA not enabled for this user.' });
    }

    const ok = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: String(token),
      window: 1,
    });

    if (!ok) {
      logEvent("LOGIN_MFA_FAIL", user.email);
      return res.status(401).json({ message: 'Invalid MFA code.' });
    }

    const finalJwt = generateToken(user);
    logEvent("LOGIN_MFA_SUCCESS", user.email);

    return res.json({
      message: 'Login successful.',
      token: finalJwt,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('MFA verify error:', err.message);
    res.status(500).json({ message: 'Server error during MFA verify.' });
  }
});

module.exports = router;
