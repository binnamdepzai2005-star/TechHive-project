import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api";

const adminApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Add token to requests
adminApiClient.interceptors.request.use(
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

// Handle response
adminApiClient.interceptors.response.use(
  (response) => {
    return response.data.data || response.data;
  },
  (error) => {
    // Handle 401/403 - redirect to login
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "Server connection error";
    throw new Error(message);
  }
);

const adminApi = {
  // Users Management
  getUsers: async (page = 1, limit = 10, search = "", role = "") => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append("search", search);
    if (role) params.append("role", role);
    return await adminApiClient.get(`/admin/users?${params}`);
  },

  getUserById: async (userId) => {
    return await adminApiClient.get(`/admin/users/${userId}`);
  },

  createUser: async (userData) => {
    return await adminApiClient.post("/admin/users", userData);
  },

  updateUser: async (userId, userData) => {
    return await adminApiClient.put(`/admin/users/${userId}`, userData);
  },

  deleteUser: async (userId) => {
    return await adminApiClient.delete(`/admin/users/${userId}`);
  },

  updateUserPassword: async (userId, newPassword) => {
    return await adminApiClient.put(`/admin/users/${userId}/password`, {
      newPassword,
    });
  },

  // Products Management
  getProducts: async (
    page = 1,
    limit = 10,
    search = "",
    category = "",
    brand = "",
    status = ""
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append("search", search);
    if (category) params.append("category", category);
    if (brand) params.append("brand", brand);
    if (status) params.append("status", status);
    return await adminApiClient.get(`/admin/products?${params}`);
  },

  getProductFilters: async () => {
    return await adminApiClient.get("/admin/products/filters");
  },

  getProductById: async (productId) => {
    return await adminApiClient.get(`/admin/products/${productId}`);
  },

  createProduct: async (productData) => {
    return await adminApiClient.post("/admin/products", productData);
  },

  updateProduct: async (productId, productData) => {
    return await adminApiClient.put(`/admin/products/${productId}`, productData);
  },

  deleteProduct: async (productId) => {
    return await adminApiClient.delete(`/admin/products/${productId}`);
  },

  // Statistics
  getStatistics: async () => {
    return await adminApiClient.get("/admin/statistics");
  },
};

export default adminApi;
