const mysql = require("mysql2");
require("dotenv").config();

// Create connection pool for efficient connection management
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "reviews_db",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Không cần config timezone ở MySQL - backend sẽ cộng 7 giờ khi trả data
});

// Use promise wrapper for easy async/await usage
const promisePool = pool.promise();

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL connection error:", err.message);
    console.error("👉 Please check database configuration in .env file");
    return;
  }
  console.log("✅ MySQL connected successfully!");
  connection.release();
});

module.exports = promisePool;
