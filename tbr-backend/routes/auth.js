const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../User');
const { exec } = require('child_process');

const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const router = express.Router();

// ===============================
// Logging Helper (SSH to Logger VM)
// ===============================
const logEvent = (eventType, email) => {
  const LOGGER_USER = process.env.LOGGER_USER;
  const LOGGER_IP = process.env.LOGGER_IP;
  const LOG_FILE = process.env.LOGGER_FILE;

  const timestamp = new Date().toISOString();
  const maskedEmail = String(email || '').replace(/(.{2}).+(@.+)/, "$1***$2");
  const message = `[${timestamp}] ${eventType} | email=${maskedEmail}`;

  // Safe even if logger is not set up yet
  if (!LOGGER_USER || !LOGGER_IP || !LOG_FILE) return;

  const command = `ssh -o StrictHostKeyChecking=no ${LOGGER_USER}@${LOGGER_IP} "echo '${message}' >> ${LOG_FILE}"`;
  exec(command, (err) => {
    if (err) console.error("Logging SSH Error:", err.message);
  });
};

// ===============================
// Token helpers
// ===============================
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// used after password success, before OTP
const generateTempMfaToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, mfa: true },
    process.env.JWT_SECRET,
    { expiresIn: '5m' }
  );
};

// used right after register, before OTP (enrollment)
const generateEnrollToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, enroll: true },
    process.env.JWT_SECRET,
    { expiresIn: '10m' }
  );
};

// ===============================
// REGISTER (FORCED MFA ENROLLMENT)
// Creates user + secret + returns QR + enrollToken
// DOES NOT return normal JWT yet
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

    // Create MFA secret immediately for enrollment
    const secret = speakeasy.generateSecret({ name: `TBR (${email})` });
    user.mfaSecret = secret.base32;
    user.mfaEnabled = false;

    await user.save();

    const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);
    const enrollToken = generateEnrollToken(user);

    logEvent("REGISTER_CREATED_MFA_ENROLL_REQUIRED", email);

    // Frontend will show QR + ask for 6-digit code, then call /mfa/complete-enroll
    return res.status(201).json({
      message: 'Account created. MFA enrollment required.',
      enrollRequired: true,
      enrollToken,
      qrDataUrl,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// ===============================
// COMPLETE ENROLLMENT (Step after register)
// enrollToken + 6-digit code -> enables MFA and returns real JWT
// ===============================
router.post('/mfa/complete-enroll', async (req, res) => {
  try {
    const { enrollToken, token } = req.body; // token = 6-digit OTP
    if (!enrollToken || !token) {
      return res.status(400).json({ message: 'Missing enrollToken or MFA code.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(enrollToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: 'Invalid/expired enroll token.' });
    }

    if (!decoded.enroll) {
      return res.status(401).json({ message: 'Not an enrollment token.' });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.mfaSecret) {
      return res.status(400).json({ message: 'Enrollment not available.' });
    }

    const ok = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: String(token),
      window: 1,
    });

    if (!ok) {
      logEvent("MFA_ENROLL_FAIL", user.email);
      return res.status(401).json({ message: 'Invalid MFA code.' });
    }

    user.mfaEnabled = true;
    await user.save();

    const finalJwt = generateToken(user);
    logEvent("MFA_ENROLL_SUCCESS", user.email);

    return res.json({
      message: 'MFA enabled. Registration complete.',
      token: finalJwt,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error('MFA complete-enroll error:', err.message);
    res.status(500).json({ message: 'Server error during MFA enrollment.' });
  }
});

// ===============================
// LOGIN (FORCED MFA FOR EVERYONE)
// password ok -> always return mfaRequired + tempToken
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

    // If for some reason user isn't enrolled yet, block login and force enrollment
    if (!user.mfaSecret || !user.mfaEnabled) {
      logEvent("LOGIN_BLOCKED_MFA_NOT_ENROLLED", user.email);
      return res.status(403).json({
        message: 'MFA enrollment required for this account. Please complete setup after registration.',
      });
    }

    const tempToken = generateTempMfaToken(user);
    logEvent("LOGIN_MFA_REQUIRED", user.email);

    return res.json({
      message: 'MFA required.',
      mfaRequired: true,
      tempToken,
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// ===============================
// MFA VERIFY (Step 2 of login)
// tempToken + 6-digit code -> returns real JWT
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
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error('MFA verify error:', err.message);
    res.status(500).json({ message: 'Server error during MFA verify.' });
  }
});

module.exports = router;
