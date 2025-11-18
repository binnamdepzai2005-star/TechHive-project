import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api";

const authApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Add token to requests if available
authApiClient.interceptors.request.use(
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
authApiClient.interceptors.response.use(
  (response) => {
    // For forgot password, return full response to include resetLink in dev mode
    if (response.config?.url?.includes("/auth/forgot-password")) {
      return response.data;
    }
    // For other endpoints, return data or data.data
    return response.data.data || response.data;
  },
  (error) => {
    // Handle 401 (unauthorized) - clear token and redirect to login
    // BUT: Don't redirect if this is a login/register request (to avoid redirect on login failure)
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";
      const isAuthRequest = requestUrl.includes("/auth/login") || 
                           requestUrl.includes("/auth/register") ||
                           requestUrl.includes("/auth/forgot-password") ||
                           requestUrl.includes("/auth/reset-password");
      
      // Only redirect if this is NOT a login/register request
      // (login/register failures should be handled by the component, not by interceptor)
      if (!isAuthRequest) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        const currentPath = window.location.pathname;
        // Only redirect if we're on a protected page
        if (currentPath !== "/" && !currentPath.includes("/login")) {
          window.location.href = "/";
        }
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "Server connection error";
    throw new Error(message);
  }
);

const authApi = {
  // Register
  register: async (userData) => {
    const response = await authApiClient.post("/auth/register", userData);
    if (response.token) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }
    return response;
  },

  // Login
  login: async (credentials) => {
    const response = await authApiClient.post("/auth/login", credentials);
    if (response.token) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }
    return response;
  },

  // Logout (clear local storage)
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Get current user
  getCurrentUser: async () => {
    return await authApiClient.get("/auth/me");
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await authApiClient.post("/auth/forgot-password", { email });
    // Return full response including devMode and resetLink if available
    return response;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    return await authApiClient.post("/auth/reset-password", {
      token,
      newPassword,
    });
  },

  // Change password (for logged in users)
  changePassword: async (currentPassword, newPassword) => {
    return await authApiClient.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  },
};

export default authApi;

