const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// JWT Secret (nên lưu trong .env)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Email configuration
const createTransporter = () => {
  // Trong production, cấu hình email thật
  // Hiện tại dùng Gmail hoặc mock cho development
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  
  // Mock transporter cho development
  return {
    sendMail: async (options) => {
      console.log("📧 Email would be sent:", options);
      return { messageId: "mock-email-id" };
    },
  };
};

// Helper: Convert UTC to Vietnam timezone (+7 hours)
const convertToVietnamTime = (data) => {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map((item) => convertToVietnamTime(item));
  }
  if (typeof data === "object") {
    const converted = { ...data };
    if (converted.created_at) {
      const date = new Date(converted.created_at);
      date.setHours(date.getHours() + 7);
      converted.created_at = date.toISOString();
    }
    if (converted.updated_at) {
      const date = new Date(converted.updated_at);
      date.setHours(date.getHours() + 7);
      converted.updated_at = date.toISOString();
    }
    return converted;
  }
  return data;
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    // Validation
    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, password, and full name",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Password validation (min 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if user already exists
    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const [result] = await db.query(
      "INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)",
      [email, hashedPassword, full_name]
    );

    // Get created user (without password)
    const [users] = await db.query(
      "SELECT id, email, full_name, role, created_at FROM users WHERE id = ?",
      [result.insertId]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: users[0].id, email: users[0].email, role: users[0].role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      data: {
        user: convertToVietnamTime(users[0]),
        token,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      message: "Server error while registering user",
      error: error.message,
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user
    const [users] = await db.query(
      "SELECT id, email, password, full_name, role FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove password from response
    delete user.password;

    res.json({
      success: true,
      message: "Login successful!",
      data: {
        user: convertToVietnamTime(user),
        token,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      success: false,
      message: "Server error while logging in",
      error: error.message,
    });
  }
};

// Get current user (verify token)
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [users] = await db.query(
      "SELECT id, email, full_name, role, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: convertToVietnamTime(users[0]),
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Forgot password - send reset email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide email",
      });
    }

    // Find user
    const [users] = await db.query(
      "SELECT id, email, full_name FROM users WHERE email = ?",
      [email]
    );

    // Always return success (security: don't reveal if email exists)
    if (users.length === 0) {
      return res.json({
        success: true,
        message:
          "If email exists, password reset link has been sent to your email",
      });
    }

    const user = users[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Delete old tokens for this user
    await db.query(
      "DELETE FROM password_reset_tokens WHERE user_id = ? AND used = FALSE",
      [user.id]
    );

    // Save reset token
    await db.query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user.id, resetToken, expiresAt]
    );

    // Create reset link
    // Note: Frontend reads token from URL query parameter (?token=...)
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, ""); // Remove trailing slash
    const resetLink = `${frontendUrl}/?token=${resetToken}`;

    // Send email
    const transporter = createTransporter();
    
    // Email content
    const emailContent = {
      from: process.env.EMAIL_FROM || "noreply@example.com",
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.full_name},</p>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <p><a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>Or copy this link: ${resetLink}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    try {
      await transporter.sendMail(emailContent);
      console.log("✅ Password reset email sent successfully to:", user.email);
    } catch (emailError) {
      console.error("❌ Error sending email:", emailError.message);
      // In development, log the reset link to console
      if (process.env.NODE_ENV === "development" || !process.env.EMAIL_USER) {
        console.log("\n" + "=".repeat(80));
        console.log("📧 DEVELOPMENT MODE - Email not configured");
        console.log("🔗 Password Reset Link (copy this to test):");
        console.log(resetLink);
        console.log("=".repeat(80) + "\n");
      } else {
        throw emailError; // Re-throw in production if email is configured
      }
    }

    // Return success with development info
    const response = {
      success: true,
      message:
        "If email exists, password reset link has been sent to your email",
    };

    // In development mode, include reset link in response (for testing)
    if (process.env.NODE_ENV === "development" || !process.env.EMAIL_USER) {
      response.devMode = true;
      response.resetLink = resetLink; // Include for testing
      console.log("\n" + "=".repeat(80));
      console.log("📧 DEVELOPMENT MODE - Password Reset Link:");
      console.log(resetLink);
      console.log("=".repeat(80) + "\n");
    }

    res.json(response);
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide token and new password",
      });
    }

    // Password validation
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Find valid token
    const [tokens] = await db.query(
      `SELECT prt.*, u.email 
       FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id
       WHERE prt.token = ? AND prt.used = FALSE AND prt.expires_at > NOW()`,
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const resetToken = tokens[0];

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      resetToken.user_id,
    ]);

    // Mark token as used
    await db.query(
      "UPDATE password_reset_tokens SET used = TRUE WHERE id = ?",
      [resetToken.id]
    );

    res.json({
      success: true,
      message: "Password reset successfully!",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Change password (for logged in users)
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current password and new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    // Get user with password
    const [users] = await db.query(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      users[0].password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    res.json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

