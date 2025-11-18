const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { authenticate } = require("../middleware/authMiddleware");

// Routes for products
router.get("/products", reviewController.getAllProducts);
router.get("/products/:productId", reviewController.getProductById);

// Routes for reviews
router.get("/reviews", reviewController.getAllReviews);
router.get("/reviews/product/:productId", reviewController.getReviewsByProduct);
router.post("/reviews", authenticate, reviewController.createReview); // Require authentication

// Route for statistics
router.get("/statistics", reviewController.getStatistics);

// Special route: Fetch reviews from external sources
router.post("/fetch-reviews", reviewController.fetchReviews);

module.exports = router;
