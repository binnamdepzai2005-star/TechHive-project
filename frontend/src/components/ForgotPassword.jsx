import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./ForgotPassword.css";

const ForgotPassword = ({ onSwitchToLogin }) => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    if (!email) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      setLoading(false);
      return;
    }

    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setSuccess(true);
        // In development, log reset link if available
        if (result.resetLink && process.env.NODE_ENV === "development") {
          console.log("🔗 Password Reset Link:", result.resetLink);
          console.log("💡 Copy this link to test password reset");
        }
      } else {
        setError(result.error || "Failed to send reset email");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🔑 Forgot Password</h2>
        <p className="auth-subtitle">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        {error && <div className="alert alert-error">❌ {error}</div>}

        {success ? (
          <div className="success-message">
            <div className="alert alert-success">
              ✅ Password reset link has been sent to your email!
            </div>
            <p className="success-text">
              Please check your email inbox and follow the instructions to reset
              your password.
            </p>
            <p className="success-text" style={{ fontSize: "0.9em", color: "#666", marginTop: "10px" }}>
              <strong>Note:</strong> If you don't see the email, check your spam folder.
              In development mode, check the backend console for the reset link.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={onSwitchToLogin}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? "⏳ Sending..." : "📧 Send Reset Link"}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Remember your password?{" "}
            <button
              type="button"
              className="link-button"
              onClick={onSwitchToLogin}
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

