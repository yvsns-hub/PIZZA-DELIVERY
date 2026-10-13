import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { memoryUsers } from '../store.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendLoginOtpEmail, recentEmailLogs } from '../mail.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pizza_secret_jwt_auth_key_2026_xyz';

import { authenticateToken, requireAdmin, requireRole } from '../middleware/auth.js';
export { authenticateToken, requireAdmin, requireRole };

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = memoryUsers.find((u) => u.email === cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    // 6-digit verification code
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: 'customer' as const, // Strict customer role for public signups
      phone: phone || '',
      isEmailVerified: false,
      verificationToken,
      createdAt: new Date(),
    };

    memoryUsers.push(newUser);

    // Send verification email via Gmail SMTP
    await sendVerificationEmail(cleanEmail, verificationToken, newUser.name);
    console.log(`[AUTH REGISTER] Verification code for ${cleanEmail} is: ${verificationToken}`);

    res.status(201).json({
      message: 'Account created successfully! A 6-digit OTP verification code was sent to your email.',
      requiresOtp: true,
      email: cleanEmail,
      ...(process.env.NODE_ENV !== 'production' ? { testOtp: verificationToken } : {}),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// Verify email
router.post('/verify-email', (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = memoryUsers.find((u) => u.email === cleanEmail);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.verificationToken !== code.trim()) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Email verified successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: true,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Login - Step 1: Validate credentials and dispatch 6-digit OTP
router.post('/login', async (req, res) => {
  try {
    const { email, password, expectedRole } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = memoryUsers.find((u) => u.email === cleanEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Role verification: If logging in via Rider Login tab, verify delivery role
    if (expectedRole === 'delivery' && user.role !== 'delivery') {
      return res.status(403).json({
        error: 'This account is not authorized as delivery personnel. Please use Customer Login.',
      });
    }

    // Generate 6-digit OTP for 2-factor login authentication
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.loginOtp = otp;
    user.loginOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log(`[AUTH 2FA] Dispatched login OTP code [${otp}] to ${cleanEmail}`);
    await sendLoginOtpEmail(cleanEmail, otp, user.name);

    res.json({
      requiresOtp: true,
      email: cleanEmail,
      message: 'A 6-digit OTP code was sent to your email. Please verify to sign in.',
      ...(process.env.NODE_ENV !== 'production' ? { testOtp: otp } : {}),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// Login - Step 2: Verify 6-digit OTP and issue JWT session
router.post('/verify-login-otp', async (req, res) => {
  try {
    const { email, otp, expectedRole } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP verification code are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = memoryUsers.find((u) => u.email === cleanEmail);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.loginOtp || user.loginOtp !== otp.trim()) {
      return res.status(400).json({ error: 'Invalid OTP code. Please check your email and enter the 6-digit code.' });
    }

    if (user.loginOtpExpires && user.loginOtpExpires.getTime() < Date.now()) {
      return res.status(400).json({ error: 'OTP code has expired. Please request a new one.' });
    }

    if (expectedRole === 'delivery' && user.role !== 'delivery') {
      return res.status(403).json({ error: 'This account is not authorized as delivery personnel.' });
    }

    // Clear OTP once successfully authenticated
    user.loginOtp = undefined;
    user.loginOtpExpires = undefined;

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Signed in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'OTP verification failed' });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email, type } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = memoryUsers.find((u) => u.email === cleanEmail);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    if (type === 'signup') {
      user.verificationToken = code;
      await sendVerificationEmail(cleanEmail, code, user.name);
      console.log(`[AUTH RESEND] Signup verification code for ${cleanEmail} is: ${code}`);
    } else {
      user.loginOtp = code;
      user.loginOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await sendLoginOtpEmail(cleanEmail, code, user.name);
      console.log(`[AUTH RESEND] Login OTP code for ${cleanEmail} is: ${code}`);
    }

    res.json({
      message: 'A new 6-digit verification code has been dispatched to your email.',
      ...(process.env.NODE_ENV !== 'production' ? { testOtp: code } : {}),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = memoryUsers.find((u) => u.email === cleanEmail);

    if (!user) {
      // Don't disclose user non-existence, return generic success
      return res.json({ message: 'If an account exists, a reset code was dispatched.' });
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetToken = resetToken;
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await sendPasswordResetEmail(cleanEmail, resetToken, user.name);

    res.json({
      message: 'Password reset code dispatched to your email!',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = memoryUsers.find((u) => u.email === cleanEmail);

    if (!user || user.resetToken !== token.trim()) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    if (user.resetTokenExpires && user.resetTokenExpires.getTime() < Date.now()) {
      return res.status(400).json({ error: 'Reset code has expired. Please request a new one.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    res.json({ message: 'Password reset successfully! You can now log in.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Current user profile
router.get('/me', authenticateToken, (req: any, res) => {
  const user = memoryUsers.find((u) => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified,
    },
  });
});

// Update customer profile
router.put('/profile', authenticateToken, (req: any, res) => {
  try {
    const user = memoryUsers.find((u) => u.id === req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, phone } = req.body;
    if (name && typeof name === 'string') {
      user.name = name.trim();
    }
    if (phone !== undefined && typeof phone === 'string') {
      user.phone = phone.trim();
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Profile update failed' });
  }
});

// Email dispatch logs (Admin only sensitive audit trail)
router.get('/email-logs', authenticateToken, requireAdmin, (req, res) => {
  res.json({ logs: recentEmailLogs });
});

export default router;
