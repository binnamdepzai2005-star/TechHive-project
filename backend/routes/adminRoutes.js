const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticate, isAdmin } = require("../middleware/authMiddleware");

// All admin routes require authentication and admin role
router.use(authenticate, isAdmin);

// ==================== USERS MANAGEMENT ====================
router.get("/users", adminController.getAllUsers);
router.get("/users/:userId", adminController.getUserById);
router.post("/users", adminController.createUser);
router.put("/users/:userId", adminController.updateUser);
router.delete("/users/:userId", adminController.deleteUser);
router.put("/users/:userId/password", adminController.updateUserPassword);

// ==================== PRODUCTS MANAGEMENT ====================
router.get("/products", adminController.getAllProducts);
router.get("/products/filters", adminController.getProductFilters);
router.get("/products/:productId", adminController.getProductById);
router.post("/products", adminController.createProduct);
router.put("/products/:productId", adminController.updateProduct);
router.delete("/products/:productId", adminController.deleteProduct);

// ==================== STATISTICS ====================
router.get("/statistics", adminController.getAdminStatistics);

module.exports = router;
