import React, { useState, useEffect } from "react";
import "./UserForm.css";

const UserForm = ({ user, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "user",
    is_email_verified: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        password: "", // Don't pre-fill password
        full_name: user.full_name || "",
        role: user.role || "user",
        is_email_verified: user.is_email_verified || false,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!user && !formData.password) {
      newErrors.password = "Password is required for new users";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.full_name) {
      newErrors.full_name = "Full name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submitData = { ...formData };
      // Don't send password if it's empty (for updates)
      if (user && !submitData.password) {
        delete submitData.password;
      }
      onSave(submitData);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content user-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{user ? "✏️ Edit User" : "➕ Create New User"}</h2>
          <button className="btn-close" onClick={onCancel}>
            ✖️
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password {user ? "(leave empty to keep current)" : "*"}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required={!user}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="full_name">Full Name *</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              disabled={loading}
              required
            />
            {errors.full_name && (
              <span className="error-text">{errors.full_name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_email_verified"
                checked={formData.is_email_verified}
                onChange={handleChange}
                disabled={loading}
              />
              Email Verified
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "⏳ Saving..." : user ? "💾 Update" : "✅ Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;

