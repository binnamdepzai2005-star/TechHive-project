import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AdminStatistics from "./AdminStatistics";
import UserManagement from "./UserManagement";
import ProductManagement from "./ProductManagement";
import "./AdminDashboard.css";

const AdminDashboard = ({ onBack }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <div className="admin-dashboard">
      {/* Admin Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1>🔐 Admin Dashboard</h1>
            <p>Manage users, products, and system statistics</p>
          </div>
          <div className="admin-header-actions">
            <span className="admin-user-info">
              👤 {user?.full_name} ({user?.email})
            </span>
            {onBack && (
              <button className="btn btn-secondary" onClick={onBack}>
                ← Back to Home
              </button>
            )}
            <button className="btn btn-danger" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-nav">
        <button
          className={`admin-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          📊 Dashboard
        </button>
        <button
          className={`admin-nav-item ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 Users Management
        </button>
        <button
          className={`admin-nav-item ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          📦 Products Management
        </button>
      </div>

      {/* Content Area */}
      <div className="admin-content">
        {activeTab === "dashboard" && <AdminStatistics />}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "products" && <ProductManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;
