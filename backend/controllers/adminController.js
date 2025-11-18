const db = require("../config/database");
const bcrypt = require("bcryptjs");

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

// ==================== USERS MANAGEMENT ====================

// Get all users with pagination and search
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const role = req.query.role || "";
    const offset = (page - 1) * limit;

    let query = "SELECT id, email, full_name, role, is_email_verified, created_at FROM users WHERE 1=1";
    let countQuery = "SELECT COUNT(*) as total FROM users WHERE 1=1";
    const params = [];
    const countParams = [];

    // Search filter
    if (search) {
      query += " AND (email LIKE ? OR full_name LIKE ?)";
      countQuery += " AND (email LIKE ? OR full_name LIKE ?)";
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
      countParams.push(searchPattern, searchPattern);
    }

    // Role filter
    if (role) {
      query += " AND role = ?";
      countQuery += " AND role = ?";
      params.push(role);
      countParams.push(role);
    }

    // Order and pagination
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [users] = await db.query(query, params);
    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: convertToVietnamTime(users),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
      error: error.message,
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const [users] = await db.query(
      "SELECT id, email, full_name, role, is_email_verified, created_at, updated_at FROM users WHERE id = ?",
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
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user",
      error: error.message,
    });
  }
};

// Create new user (admin only)
exports.createUser = async (req, res) => {
  try {
    const { email, password, full_name, role = "user" } = req.body;

    // Validation
    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, password, and full_name",
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

    // Check if user already exists
    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const [result] = await db.query(
      "INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, full_name, role]
    );

    // Get created user
    const [users] = await db.query(
      "SELECT id, email, full_name, role, is_email_verified, created_at FROM users WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "User created successfully!",
      data: convertToVietnamTime(users[0]),
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating user",
      error: error.message,
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, full_name, role, is_email_verified } = req.body;

    // Check if user exists
    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Build update query
    const updates = [];
    const params = [];

    if (email) {
      // Check if email already exists (for another user)
      const [emailCheck] = await db.query(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, userId]
      );
      if (emailCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
      updates.push("email = ?");
      params.push(email);
    }

    if (full_name) {
      updates.push("full_name = ?");
      params.push(full_name);
    }

    if (role) {
      updates.push("role = ?");
      params.push(role);
    }

    if (is_email_verified !== undefined) {
      updates.push("is_email_verified = ?");
      params.push(is_email_verified);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    params.push(userId);
    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;

    await db.query(query, params);

    // Get updated user
    const [users] = await db.query(
      "SELECT id, email, full_name, role, is_email_verified, created_at, updated_at FROM users WHERE id = ?",
      [userId]
    );

    res.json({
      success: true,
      message: "User updated successfully!",
      data: convertToVietnamTime(users[0]),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating user",
      error: error.message,
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const [users] = await db.query("SELECT id FROM users WHERE id = ?", [
      userId,
    ]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deleting yourself
    if (parseInt(userId) === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Delete user (CASCADE will delete related reviews and tokens)
    await db.query("DELETE FROM users WHERE id = ?", [userId]);

    res.json({
      success: true,
      message: "User deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting user",
      error: error.message,
    });
  }
};

// Update user password (admin)
exports.updateUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    res.json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating password",
      error: error.message,
    });
  }
};

// ==================== PRODUCTS MANAGEMENT ====================

// Get all products with pagination and search
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const brand = req.query.brand || "";
    const status = req.query.status || "";
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM products WHERE 1=1";
    let countQuery = "SELECT COUNT(*) as total FROM products WHERE 1=1";
    const params = [];
    const countParams = [];

    // Search filter
    if (search) {
      query += " AND (name LIKE ? OR description LIKE ?)";
      countQuery += " AND (name LIKE ? OR description LIKE ?)";
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
      countParams.push(searchPattern, searchPattern);
    }

    // Category filter
    if (category) {
      query += " AND category = ?";
      countQuery += " AND category = ?";
      params.push(category);
      countParams.push(category);
    }

    // Brand filter
    if (brand) {
      query += " AND brand = ?";
      countQuery += " AND brand = ?";
      params.push(brand);
      countParams.push(brand);
    }

    // Status filter
    if (status) {
      query += " AND status = ?";
      countQuery += " AND status = ?";
      params.push(status);
      countParams.push(status);
    }

    // Order and pagination
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [products] = await db.query(query, params);
    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: convertToVietnamTime(products),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products",
      error: error.message,
    });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const [products] = await db.query(
      "SELECT * FROM products WHERE id = ?",
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: convertToVietnamTime(products[0]),
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching product",
      error: error.message,
    });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      image_url,
      price,
      original_price,
      category,
      brand,
      sku,
      stock,
      specifications,
      warranty,
      status = "active",
    } = req.body;

    // Validation
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: "Please provide name and price",
      });
    }

    // Check if SKU already exists
    if (sku) {
      const [existingProducts] = await db.query(
        "SELECT id FROM products WHERE sku = ?",
        [sku]
      );
      if (existingProducts.length > 0) {
        return res.status(400).json({
          success: false,
          message: "SKU already exists",
        });
      }
    }

    // Insert product
    const [result] = await db.query(
      `INSERT INTO products (name, description, image_url, price, original_price, category, brand, sku, stock, specifications, warranty, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        image_url,
        price,
        original_price,
        category,
        brand,
        sku,
        stock,
        specifications,
        warranty,
        status,
      ]
    );

    // Get created product
    const [products] = await db.query(
      "SELECT * FROM products WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully!",
      data: convertToVietnamTime(products[0]),
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating product",
      error: error.message,
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      name,
      description,
      image_url,
      price,
      original_price,
      category,
      brand,
      sku,
      stock,
      specifications,
      warranty,
      status,
    } = req.body;

    // Check if product exists
    const [existingProducts] = await db.query(
      "SELECT id FROM products WHERE id = ?",
      [productId]
    );

    if (existingProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check SKU uniqueness if provided
    if (sku) {
      const [skuCheck] = await db.query(
        "SELECT id FROM products WHERE sku = ? AND id != ?",
        [sku, productId]
      );
      if (skuCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: "SKU already exists",
        });
      }
    }

    // Build update query
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push("name = ?");
      params.push(name);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      params.push(description);
    }
    if (image_url !== undefined) {
      updates.push("image_url = ?");
      params.push(image_url);
    }
    if (price !== undefined) {
      updates.push("price = ?");
      params.push(price);
    }
    if (original_price !== undefined) {
      updates.push("original_price = ?");
      params.push(original_price);
    }
    if (category !== undefined) {
      updates.push("category = ?");
      params.push(category);
    }
    if (brand !== undefined) {
      updates.push("brand = ?");
      params.push(brand);
    }
    if (sku !== undefined) {
      updates.push("sku = ?");
      params.push(sku);
    }
    if (stock !== undefined) {
      updates.push("stock = ?");
      params.push(stock);
    }
    if (specifications !== undefined) {
      updates.push("specifications = ?");
      params.push(specifications);
    }
    if (warranty !== undefined) {
      updates.push("warranty = ?");
      params.push(warranty);
    }
    if (status !== undefined) {
      updates.push("status = ?");
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    params.push(productId);
    const query = `UPDATE products SET ${updates.join(", ")} WHERE id = ?`;

    await db.query(query, params);

    // Get updated product
    const [products] = await db.query(
      "SELECT * FROM products WHERE id = ?",
      [productId]
    );

    res.json({
      success: true,
      message: "Product updated successfully!",
      data: convertToVietnamTime(products[0]),
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating product",
      error: error.message,
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const [products] = await db.query(
      "SELECT id FROM products WHERE id = ?",
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete product (CASCADE will delete related reviews)
    await db.query("DELETE FROM products WHERE id = ?", [productId]);

    res.json({
      success: true,
      message: "Product deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting product",
      error: error.message,
    });
  }
};

// Get categories and brands for filters
exports.getProductFilters = async (req, res) => {
  try {
    const [categories] = await db.query(
      "SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category"
    );
    const [brands] = await db.query(
      "SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL ORDER BY brand"
    );

    res.json({
      success: true,
      data: {
        categories: categories.map((c) => c.category),
        brands: brands.map((b) => b.brand),
      },
    });
  } catch (error) {
    console.error("Error fetching filters:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching filters",
      error: error.message,
    });
  }
};

// ==================== ADMIN STATISTICS ====================

// Get admin dashboard statistics
exports.getAdminStatistics = async (req, res) => {
  try {
    // Overall stats
    const [userStats] = await db.query(
      `SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as total_admins,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as total_regular_users,
        SUM(CASE WHEN is_email_verified = 1 THEN 1 ELSE 0 END) as verified_users
       FROM users`
    );

    const [productStats] = await db.query(
      `SELECT 
        COUNT(*) as total_products,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_products,
        SUM(CASE WHEN status = 'out_of_stock' THEN 1 ELSE 0 END) as out_of_stock_products,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_products,
        SUM(stock) as total_stock
       FROM products`
    );

    const [reviewStats] = await db.query(
      `SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star_reviews,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star_reviews,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star_reviews,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star_reviews,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star_reviews
       FROM reviews`
    );

    // Rating distribution for chart
    const [ratingDistribution] = await db.query(
      `SELECT 
        rating,
        COUNT(*) as count
       FROM reviews
       GROUP BY rating
       ORDER BY rating DESC`
    );

    // Product distribution by category
    const [categoryDistribution] = await db.query(
      `SELECT 
        category,
        COUNT(*) as count
       FROM products
       WHERE category IS NOT NULL
       GROUP BY category
       ORDER BY count DESC
       LIMIT 10`
    );

    // Product distribution by brand
    const [brandDistribution] = await db.query(
      `SELECT 
        brand,
        COUNT(*) as count
       FROM products
       WHERE brand IS NOT NULL
       GROUP BY brand
       ORDER BY count DESC
       LIMIT 10`
    );

    // Monthly registrations (last 6 months)
    const [monthlyUsers] = await db.query(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
       FROM users
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`
    );

    // Monthly products (last 6 months)
    const [monthlyProducts] = await db.query(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
       FROM products
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`
    );

    // Recent users (last 7 days)
    const [recentUsers] = await db.query(
      `SELECT COUNT(*) as count 
       FROM users 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );

    // Recent products (last 7 days)
    const [recentProducts] = await db.query(
      `SELECT COUNT(*) as count 
       FROM products 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );

    // Recent reviews (last 7 days)
    const [recentReviews] = await db.query(
      `SELECT COUNT(*) as count 
       FROM reviews 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );

    res.json({
      success: true,
      data: {
        users: userStats[0],
        products: productStats[0],
        reviews: reviewStats[0],
        recent: {
          users: recentUsers[0].count,
          products: recentProducts[0].count,
          reviews: recentReviews[0].count,
        },
        charts: {
          ratingDistribution: ratingDistribution,
          categoryDistribution: categoryDistribution,
          brandDistribution: brandDistribution,
          monthlyUsers: monthlyUsers,
          monthlyProducts: monthlyProducts,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching admin statistics:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching statistics",
      error: error.message,
    });
  }
};
