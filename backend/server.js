const express = require("express");
const cors = require("cors");
require("dotenv").config();

const reviewRoutes = require("./routes/reviewRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", reviewRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running normally",
    timestamp: new Date().toISOString(),
  });
});
// localhost:4000/health

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Reviews API Server",
    version: "1.0.0",
    endpoints: {
      // Auth endpoints
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      getCurrentUser: "GET /api/auth/me",
      forgotPassword: "POST /api/auth/forgot-password",
      resetPassword: "POST /api/auth/reset-password",
      changePassword: "POST /api/auth/change-password",
      // Review endpoints
      products: "/api/products",
      productDetail: "GET /api/products/:productId",
      reviews: "/api/reviews",
      createReview: "POST /api/reviews",
      fetchReviews: "POST /api/fetch-reviews",
      statistics: "/api/statistics",
      // Admin endpoints (require admin role)
      adminUsers: "GET /api/admin/users",
      adminProducts: "GET /api/admin/products",
      adminStatistics: "GET /api/admin/statistics",
      health: "/health",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Server error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log("\n" + "=".repeat(50));
  console.log("🚀 SERVER STARTED SUCCESSFULLY!");
  console.log("=".repeat(50));
  console.log(`📡 Backend running at: http://localhost:${PORT}`);
  console.log(
    `🌍 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
  );
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("=".repeat(50) + "\n");
});

module.exports = app;
