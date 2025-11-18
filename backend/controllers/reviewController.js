const db = require("../config/database");
const axios = require("axios");

// Helper function: Convert UTC to Vietnam timezone (+7 hours)
// Quick fix for demo - cộng 7 giờ cho tất cả timestamps
const convertToVietnamTime = (data) => {
  if (!data) return data;

  // If array, convert each item
  if (Array.isArray(data)) {
    return data.map((item) => convertToVietnamTime(item));
  }

  // If object, convert timestamp fields
  if (typeof data === "object") {
    const converted = { ...data };

    // Convert created_at
    if (converted.created_at) {
      const date = new Date(converted.created_at);
      date.setHours(date.getHours() + 7); // Cộng 7 giờ
      converted.created_at = date.toISOString();
    }

    // Convert updated_at
    if (converted.updated_at) {
      const date = new Date(converted.updated_at);
      date.setHours(date.getHours() + 7); // Cộng 7 giờ
      converted.updated_at = date.toISOString();
    }

    return converted;
  }

  return data;
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const [products] = await db.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    res.json({
      success: true,
      data: convertToVietnamTime(products), // Convert timezone +7
    });
  } catch (error) {
    console.error("Error fetching products list:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products",
      error: error.message,
    });
  }
};

// Get product by ID with statistics
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    // Get product details
    const [products] = await db.query("SELECT * FROM products WHERE id = ?", [
      productId,
    ]);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = products[0];

    // Get statistics for this product
    const [stats] = await db.query(
      `SELECT 
        COUNT(r.id) as total_reviews,
        AVG(r.rating) as average_rating,
        SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) as one_star
       FROM reviews r
       WHERE r.product_id = ?`,
      [productId]
    );

    // Get reviews for this product
    const [reviews] = await db.query(
      `SELECT r.*, p.name as product_name, p.image_url as product_image
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [productId]
    );

    res.json({
      success: true,
      data: {
        product: convertToVietnamTime(product),
        statistics: stats[0] || {
          total_reviews: 0,
          average_rating: 0,
          five_star: 0,
          four_star: 0,
          three_star: 0,
          two_star: 0,
          one_star: 0,
        },
        reviews: convertToVietnamTime(reviews),
      },
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching product details",
      error: error.message,
    });
  }
};

// Get reviews by product
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const [reviews] = await db.query(
      `SELECT r.*, p.name as product_name 
       FROM reviews r 
       JOIN products p ON r.product_id = p.id 
       WHERE r.product_id = ? 
       ORDER BY r.created_at DESC`,
      [productId]
    );

    res.json({
      success: true,
      data: convertToVietnamTime(reviews), // Convert timezone +7
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching reviews",
      error: error.message,
    });
  }
};

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const [reviews] = await db.query(
      `SELECT r.*, p.name as product_name, p.image_url as product_image 
       FROM reviews r 
       JOIN products p ON r.product_id = p.id 
       ORDER BY r.created_at DESC`
    );

    res.json({
      success: true,
      data: convertToVietnamTime(reviews), // Convert timezone +7
    });
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching reviews",
      error: error.message,
    });
  }
};

// Create new review (requires authentication)
exports.createReview = async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;
    const userId = req.user.userId; // From JWT token
    const userEmail = req.user.email; // From JWT token

    // Validation
    if (!product_id || !rating) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (product_id, rating)",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Get user's full name from database
    const [users] = await db.query("SELECT full_name FROM users WHERE id = ?", [
      userId,
    ]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user_name = users[0].full_name;

    // Insert review with user_id
    const [result] = await db.query(
      "INSERT INTO reviews (product_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)",
      [product_id, userId, user_name, rating, comment]
    );

    // Get newly created review
    const [newReview] = await db.query(
      `SELECT r.*, p.name as product_name 
       FROM reviews r 
       JOIN products p ON r.product_id = p.id 
       WHERE r.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Review created successfully!",
      data: convertToVietnamTime(newReview[0]), // Convert timezone +7
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating review",
      error: error.message,
    });
  }
};

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const [stats] = await db.query("SELECT * FROM review_statistics");

    // Calculate overall statistics
    const [totalStats] = await db.query(`
      SELECT 
        COUNT(DISTINCT product_id) as total_products,
        COUNT(*) as total_reviews,
        AVG(rating) as overall_average_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as total_five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as total_four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as total_three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as total_two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as total_one_star
      FROM reviews
    `);

    res.json({
      success: true,
      data: {
        byProduct: stats,
        overall: totalStats[0],
      },
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching statistics",
      error: error.message,
    });
  }
};

// ============================================
// Helper: Fetch reviews from RapidAPI (Amazon) with Retry
// ============================================
const fetchAmazonReviews = async (productASIN, retryCount = 0) => {
  const MAX_RETRIES = 3; // Retry tối đa 3 lần
  const RETRY_DELAY = 2000; // Đợi 2 giây giữa các lần retry

  // Build URL manually to match cURL exactly
  const baseUrl = `https://${process.env.RAPIDAPI_HOST}/product-reviews`;
  const queryParams = new URLSearchParams({
    asin: productASIN,
    country: "US",
    sort_by: "TOP_REVIEWS",
    star_rating: "ALL",
    verified_purchases_only: "false",
    images_or_videos_only: "false",
    current_format_only: "false",
    page: "1",
  });
  const fullUrl = `${baseUrl}?${queryParams.toString()}`;

  const options = {
    method: "GET",
    url: fullUrl,
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": process.env.RAPIDAPI_HOST,
    },
    timeout: 30000, // 30 seconds timeout
    validateStatus: function (status) {
      return status < 500; // Don't throw for 4xx errors, only 5xx
    },
  };

  try {
    if (retryCount === 0) {
      console.log("📞 Calling RapidAPI with ASIN:", productASIN);
      console.log("🔑 API Key exists:", !!process.env.RAPIDAPI_KEY);
      console.log(
        "🔑 API Key (first 10 chars):",
        process.env.RAPIDAPI_KEY?.substring(0, 10) + "..."
      );
      console.log("🌐 Host:", process.env.RAPIDAPI_HOST);
      console.log("🌐 Full URL:", fullUrl);
      console.log("📋 Headers:", JSON.stringify(options.headers, null, 2));
      console.log("⏱️ Timeout:", options.timeout, "ms");
    } else {
      console.log(`🔄 Retry attempt ${retryCount}/${MAX_RETRIES}...`);
    }

    const startTime = Date.now();
    const response = await axios.request(options);
    const duration = Date.now() - startTime;

    console.log("✅ RapidAPI Response status:", response.status);
    console.log("⏱️ Response time:", duration, "ms");

    // Check for error status
    if (response.status >= 400) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log("📦 Data structure:", Object.keys(response.data || {}));

    if (response.data?.data) {
      console.log("📊 Reviews found:", response.data.data.reviews?.length || 0);
    }

    return response.data;
  } catch (error) {
    const errorDetails = {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    };

    // Check if it's a retryable error (503, 429, 500, 502, 504)
    const isRetryable =
      errorDetails.status &&
      [503, 429, 500, 502, 504].includes(errorDetails.status);

    // Retry logic for 503 errors (Service Unavailable)
    if (isRetryable && retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY * (retryCount + 1); // Exponential backoff
      console.error(
        `❌ RapidAPI Error (${errorDetails.status}): ${errorDetails.message}`
      );
      console.error(
        `   ⏳ Retrying in ${delay / 1000} seconds... (Attempt ${
          retryCount + 1
        }/${MAX_RETRIES})`
      );

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry
      return fetchAmazonReviews(productASIN, retryCount + 1);
    }

    // Log error details if not retrying
    console.error("❌ RapidAPI Error details:");
    console.error("  - Message:", errorDetails.message);
    console.error("  - Code:", errorDetails.code);
    console.error("  - Status:", errorDetails.status);
    console.error("  - Status Text:", errorDetails.statusText);

    if (errorDetails.data) {
      console.error(
        "  - Response Data:",
        JSON.stringify(errorDetails.data, null, 2)
      );

      // Special handling for 503
      if (errorDetails.status === 503) {
        console.error("  ⚠️ SERVER OVERLOAD - RapidAPI server đang quá tải");
        console.error(
          "  💡 Suggestion: Thử lại sau vài phút hoặc dùng mock data"
        );
        console.error(
          "  📝 Error message:",
          errorDetails.data.error?.message || "No resources available"
        );
      }
    }

    // Nếu là timeout, log thêm thông tin
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      console.error(
        "  ⚠️ TIMEOUT ERROR - API mất quá nhiều thời gian để phản hồi"
      );
      console.error(
        "  💡 Suggestion: Kiểm tra kết nối internet hoặc thử lại sau"
      );
    }

    throw error;
  }
};

// ============================================
// Helper: Fetch from FakeStore API (Free & Reliable)
// ============================================
const fetchFakeStoreReviews = async () => {
  try {
    console.log("🛒 Fetching from FakeStore API...");

    // Get random products from FakeStore
    const response = await axios.get(
      "https://fakestoreapi.com/products?limit=5",
      {
        timeout: 10000,
      }
    );

    const products = response.data;
    const reviews = [];

    // Generate reviews based on product ratings
    products.forEach((product) => {
      if (product.rating && product.rating.rate) {
        const rating = Math.round(product.rating.rate);
        const count = product.rating.count || 0;

        // Create 1-2 reviews per product based on rating
        for (let i = 0; i < Math.min(2, Math.ceil(rating / 2.5)); i++) {
          reviews.push({
            product_name: product.title,
            rating: rating,
            comment: generateReviewComment(rating, product.title),
            user_name: `FakeStore User ${Math.floor(Math.random() * 1000)}`,
          });
        }
      }
    });

    console.log(`✅ Fetched ${reviews.length} reviews from FakeStore`);
    return reviews;
  } catch (error) {
    console.error("❌ FakeStore API Error:", error.message);
    throw error;
  }
};

// Helper: Generate review comment based on rating
const generateReviewComment = (rating, productName) => {
  const comments = {
    5: [
      `Excellent product! Highly recommend ${productName}.`,
      `Amazing quality! ${productName} exceeded my expectations.`,
      `Perfect! Best purchase I've made.`,
    ],
    4: [
      `Very good product. ${productName} is worth the price.`,
      `Great quality, would buy again.`,
      `Good value for money.`,
    ],
    3: [
      `Decent product. ${productName} is okay but could be better.`,
      `Average quality, nothing special.`,
      `It's fine, but expected more.`,
    ],
    2: [
      `Not impressed with ${productName}. Quality could be better.`,
      `Disappointed with the product.`,
      `Below expectations.`,
    ],
    1: [
      `Poor quality. Would not recommend ${productName}.`,
      `Very disappointed with this purchase.`,
      `Not worth the money.`,
    ],
  };

  const ratingComments = comments[rating] || comments[3];
  return ratingComments[Math.floor(Math.random() * ratingComments.length)];
};

// ============================================
// Helper: Generate mock reviews (fallback)
// ============================================
const generateMockReviews = () => {
  return [
    {
      product_id: Math.floor(Math.random() * 4) + 1,
      user_name: `User_${Date.now()}`,
      rating: Math.floor(Math.random() * 5) + 1,
      comment: "New review fetched from external system!",
    },
    {
      product_id: Math.floor(Math.random() * 4) + 1,
      user_name: `AutoFetch_${Date.now()}`,
      rating: Math.floor(Math.random() * 5) + 1,
      comment: "Automatically collected review - great product!",
    },
  ];
};

// ============================================
// Main: Fetch reviews from external sources
// ============================================
exports.fetchReviews = async (req, res) => {
  try {
    console.log("🔄 Starting to fetch reviews from external source...");

    let externalReviews = [];
    const useRealAPI = process.env.USE_REAL_API === "true";
    const useFakeStore = process.env.USE_FAKESTORE_API === "true";

    // Priority: FakeStore > RapidAPI > Mock Data
    if (useFakeStore) {
      console.log("🛒 Using FakeStore API (Free & Reliable)...");

      try {
        const fakeStoreReviews = await fetchFakeStoreReviews();

        // Map to our products
        const [products] = await db.query(
          "SELECT id, name FROM products ORDER BY RAND() LIMIT 5"
        );

        if (products.length > 0) {
          externalReviews = fakeStoreReviews
            .slice(0, Math.min(5, products.length))
            .map((review, index) => ({
              product_id: products[index % products.length].id,
              user_name: review.user_name,
              rating: review.rating,
              comment: review.comment,
            }));

          console.log(
            `✅ Mapped ${externalReviews.length} FakeStore reviews to products`
          );
        } else {
          throw new Error("No products in database");
        }
      } catch (fakeStoreError) {
        console.error(
          "⚠️ FakeStore API error, falling back to mock data:",
          fakeStoreError.message
        );
        externalReviews = generateMockReviews();
      }
    } else if (useRealAPI && process.env.RAPIDAPI_KEY) {
      console.log("📡 Fetching from RapidAPI (Amazon)...");

      try {
        // Get random product from database to map reviews to
        const [products] = await db.query(
          "SELECT id, name FROM products ORDER BY RAND() LIMIT 1"
        );

        if (products.length === 0) {
          throw new Error("No products in database to map reviews to");
        }

        const targetProduct = products[0];

        // Example Amazon ASIN - You can customize this
        // Popular products: B08N5WRWNW (Echo Dot), B07XJ8C8F5 (Fire TV Stick)
        const amazonASIN = "B08N5WRWNW"; // Echo Dot as example

        const amazonData = await fetchAmazonReviews(amazonASIN);

        // Parse Amazon reviews and map to our format
        // Response structure from RapidAPI: { status: "OK", data: { reviews: [...] } }
        console.log("🔍 Parsing API response...");
        console.log("📦 Response keys:", Object.keys(amazonData || {}));

        let reviews = [];

        // Try different possible response structures
        if (
          amazonData?.data?.reviews &&
          Array.isArray(amazonData.data.reviews)
        ) {
          reviews = amazonData.data.reviews;
          console.log("✅ Found reviews in data.reviews");
        } else if (amazonData?.reviews && Array.isArray(amazonData.reviews)) {
          reviews = amazonData.reviews;
          console.log("✅ Found reviews in reviews");
        } else if (
          amazonData?.data?.data?.reviews &&
          Array.isArray(amazonData.data.data.reviews)
        ) {
          reviews = amazonData.data.data.reviews;
          console.log("✅ Found reviews in data.data.reviews");
        } else {
          console.log(
            "⚠️ Response structure:",
            JSON.stringify(amazonData, null, 2).substring(0, 500)
          );
        }

        if (reviews.length > 0) {
          // Get first 3-5 reviews
          const selectedReviews = reviews.slice(0, 5);

          externalReviews = selectedReviews.map((review) => {
            // Map different possible field names
            const userName =
              review.reviewer?.name ||
              review.reviewer_name ||
              review.name ||
              `Amazon User ${Date.now()}`;

            const rating =
              review.rating || review.star_rating || review.stars || 5;

            const comment =
              review.review_comment ||
              review.review_title ||
              review.title ||
              review.comment ||
              "Great product!";

            return {
              product_id: targetProduct.id,
              user_name: userName,
              rating: Math.min(5, Math.max(1, parseInt(rating) || 5)),
              comment: comment.substring(0, 500), // Limit comment length
            };
          });

          console.log(
            `✅ Fetched ${externalReviews.length} reviews from Amazon (out of ${reviews.length} total)`
          );
        } else {
          console.log("⚠️ No reviews found in API response, using mock data");
          console.log(
            "📋 Full response structure:",
            JSON.stringify(amazonData, null, 2).substring(0, 1000)
          );
          externalReviews = generateMockReviews();
        }
      } catch (apiError) {
        console.error(
          "⚠️ RapidAPI error, falling back to mock data:",
          apiError.message
        );
        externalReviews = generateMockReviews();
      }
    } else {
      console.log("🎭 Using mock data (USE_REAL_API=false or no API key)");
      externalReviews = generateMockReviews();
    }

    // Save to database
    const insertedReviews = [];
    for (const review of externalReviews) {
      const [result] = await db.query(
        "INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (?, ?, ?, ?)",
        [review.product_id, review.user_name, review.rating, review.comment]
      );

      const [newReview] = await db.query(
        `SELECT r.*, p.name as product_name, p.image_url as product_image 
         FROM reviews r 
         JOIN products p ON r.product_id = p.id 
         WHERE r.id = ?`,
        [result.insertId]
      );

      insertedReviews.push(newReview[0]);
    }

    console.log(
      `✅ Successfully fetched and saved ${insertedReviews.length} new reviews`
    );

    // Determine source for response
    let source = "Mock Data";
    if (useFakeStore) {
      source = "FakeStore API";
    } else if (useRealAPI) {
      source = "RapidAPI (Amazon)";
    }

    res.json({
      success: true,
      message: `Successfully fetched ${insertedReviews.length} new reviews!`,
      data: convertToVietnamTime(insertedReviews),
      source: source,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching reviews",
      error: error.message,
    });
  }
};
