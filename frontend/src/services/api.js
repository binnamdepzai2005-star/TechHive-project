import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Add token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
apiClient.interceptors.response.use(
  (response) => {
    return response.data.data || response.data;
  },
  (error) => {
    console.error("API Error:", error);
    
    // Handle 401 (unauthorized) - clear token
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login if not already there
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    
    const message =
      error.response?.data?.message ||
      error.message ||
      "Server connection error";
    throw new Error(message);
  }
);

const api = {
  // Products
  getAllProducts: async () => {
    return await apiClient.get("/products");
  },

  getProductById: async (productId) => {
    return await apiClient.get(`/products/${productId}`);
  },

  // Reviews
  getAllReviews: async () => {
    return await apiClient.get("/reviews");
  },

  getReviewsByProduct: async (productId) => {
    return await apiClient.get(`/reviews/product/${productId}`);
  },

  createReview: async (reviewData) => {
    return await apiClient.post("/reviews", reviewData);
  },

  // Fetch reviews từ nguồn bên ngoài
  fetchReviews: async () => {
    return await apiClient.post("/fetch-reviews");
  },

  // Statistics
  getStatistics: async () => {
    return await apiClient.get("/statistics");
  },
};

export default api;
