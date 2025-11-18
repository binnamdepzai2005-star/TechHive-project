import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import "./App.css";
import api from "./services/api";
import ReviewList from "./components/ReviewList";
import Statistics from "./components/Statistics";
import AddReview from "./components/AddReview";
import ProductList from "./components/ProductList";
import ProductDetail from "./components/ProductDetail";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import AdminDashboard from "./components/admin/AdminDashboard";

function App() {
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState("home");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchMessage, setFetchMessage] = useState("");

  // Check URL for reset password token, product ID, or admin route
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get("token");
    const productId = urlParams.get("product");
    const path = window.location.pathname;
    
    if (resetToken) {
      setCurrentView("reset-password");
    } else if (productId) {
      setSelectedProductId(productId);
      setCurrentView("product-detail");
    } else if (path === "/admin" && isAuthenticated && user?.role === "admin") {
      setCurrentView("admin");
    }
  }, [isAuthenticated, user]);

  // Load dữ liệu ban đầu (only if authenticated or view is home)
  useEffect(() => {
    if (currentView === "home" && !authLoading) {
      loadInitialData();
    }
  }, [currentView, authLoading]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [reviewsData, productsData, statsData] = await Promise.all([
        api.getAllReviews(),
        api.getAllProducts(),
        api.getStatistics(),
      ]);

      setReviews(reviewsData);
      setProducts(productsData);
      setStatistics(statsData);
    } catch (err) {
      setError("Unable to load data: " + err.message);
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Reviews từ backend (thu thập từ nguồn thực tế hoặc giả lập)
  const handleFetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      setFetchMessage("⏳ Fetching reviews from external system...");

      const result = await api.fetchReviews();

      // Display source information
      const source = result.source || "External System";
      let sourceIcon = "🎭"; // Default: Mock Data
      if (source.includes("RapidAPI")) {
        sourceIcon = "🌐";
      } else if (source.includes("FakeStore")) {
        sourceIcon = "🛒";
      }
      
      // Check if it fell back to mock data due to API error
      if (source.includes("Mock") && result.message?.includes("fallback")) {
        setFetchMessage(
          `⚠️ API temporarily unavailable, using mock data. ${sourceIcon} Source: ${source}`
        );
      } else {
        setFetchMessage(`✅ Successfully fetched new reviews! ${sourceIcon} Source: ${source}`);
      }

      // Reload lại dữ liệu
      await loadInitialData();

      // Xóa message sau 7 giây (lâu hơn nếu có warning)
      const timeout = source.includes("Mock") ? 7000 : 5000;
      setTimeout(() => setFetchMessage(""), timeout);
    } catch (err) {
      // Better error messages
      let errorMessage = "Error fetching reviews: " + err.message;
      
      if (err.message.includes("503") || err.message.includes("Service Temporarily Unavailable")) {
        errorMessage = "⚠️ RapidAPI server is temporarily overloaded. Please try again in a few minutes. (Using mock data as fallback)";
      } else if (err.message.includes("timeout")) {
        errorMessage = "⏱️ Request timed out. Please check your internet connection and try again.";
      }
      
      setError(errorMessage);
      setFetchMessage("");
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  // Thêm review mới
  const handleAddReview = async (reviewData) => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      if (!isAuthenticated) {
        setError("Please login to add a review!");
        setCurrentView("login");
        return false;
      }

      await api.createReview(reviewData);

      // Reload lại dữ liệu
      await loadInitialData();

      return true;
    } catch (err) {
      // If 401 error, redirect to login
      if (err.message.includes("login") || err.message.includes("401")) {
        setError("Please login to add a review!");
        setCurrentView("login");
      } else {
        setError("Error adding review: " + err.message);
      }
      console.error("Error adding review:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handle require login callback
  const handleRequireLogin = () => {
    setCurrentView("login");
  };

  const handleLogout = () => {
    logout();
    setCurrentView("login");
    window.location.href = "/";
  };

  // Handle reset password success
  const handleResetPasswordSuccess = () => {
    setCurrentView("login");
    window.location.href = "/";
  };

  // Get reset token from URL
  const getResetToken = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("token");
  };

  // Show admin dashboard
  if (currentView === "admin" && isAuthenticated && user?.role === "admin") {
    return (
      <AdminDashboard
        onBack={() => {
          setCurrentView("home");
          window.location.href = "/";
        }}
      />
    );
  }

  // Show loading state
  if (authLoading) {
    return (
      <div className="app">
        <div className="loading-container">
          <p>⏳ Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth pages
  if (currentView === "login") {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🌟 TechHive</h1>
        </header>
        <Login
          onSwitchToRegister={() => setCurrentView("register")}
          onSwitchToForgotPassword={() => setCurrentView("forgot-password")}
        />
      </div>
    );
  }

  if (currentView === "register") {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🌟 TechHive</h1>
        </header>
        <Register onSwitchToLogin={() => setCurrentView("login")} />
      </div>
    );
  }

  if (currentView === "forgot-password") {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🌟 TechHive</h1>
        </header>
        <ForgotPassword onSwitchToLogin={() => setCurrentView("login")} />
      </div>
    );
  }

  if (currentView === "reset-password") {
    const token = getResetToken();
    return (
      <div className="app">
        <header className="app-header">
          <h1>🌟 TechHive</h1>
        </header>
        <ResetPassword token={token} onSuccess={handleResetPasswordSuccess} />
      </div>
    );
  }

  // Handle product click
  const handleProductClick = (productId) => {
    setSelectedProductId(productId);
    setCurrentView("product-detail");
    // Update URL without reload
    window.history.pushState({}, "", `/?product=${productId}`);
  };

  // Handle back from product detail
  const handleBackFromProduct = () => {
    setSelectedProductId(null);
    setCurrentView("home");
    window.history.pushState({}, "", "/");
  };

  // Show product detail view
  if (currentView === "product-detail" && selectedProductId) {
    return (
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <div>
              <h1>🌟 TechHive</h1>
              <p className="subtitle">
                Manage and collect product reviews automatically
              </p>
            </div>
            <div className="user-section">
              {isAuthenticated && user ? (
                <>
                  <span className="user-info">
                    👤 {user.full_name} ({user.email})
                  </span>
                  {user.role === "admin" && (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setCurrentView("admin");
                        window.history.pushState({}, "", "/admin");
                      }}
                      title="Admin Dashboard"
                    >
                      🔐 Admin
                    </button>
                  )}
                  <button
                    className="btn btn-secondary"
                    onClick={handleLogout}
                    title="Logout"
                  >
                    🚪 Logout
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentView("login")}
                >
                  🔐 Login
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="app-main">
          <ProductDetail
            productId={selectedProductId}
            onBack={handleBackFromProduct}
            onRequireLogin={handleRequireLogin}
          />
        </main>

        <footer className="app-footer">
          <p>© 2025 Product Reviews System - Powered by React & Express</p>
        </footer>
      </div>
    );
  }

  // Main app view
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>🌟 TechHive</h1>
            <p className="subtitle">
              Manage and collect product reviews automatically
            </p>
          </div>
          <div className="user-section">
            {isAuthenticated && user ? (
              <>
                <span className="user-info">
                  👤 {user.full_name} ({user.email})
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={handleLogout}
                  title="Logout"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setCurrentView("login")}
              >
                  🔐 Login
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Error Message */}
        {error && <div className="alert alert-error">❌ {error}</div>}

        {/* Fetch Message */}
        {fetchMessage && (
          <div className="alert alert-info">{fetchMessage}</div>
        )}

        {/* Fetch Reviews Button */}
        <div className="fetch-section">
          <button
            className="btn btn-primary btn-large"
            onClick={handleFetchReviews}
            disabled={loading}
            title="Fetch reviews from Amazon via RapidAPI or use mock data"
          >
            {loading ? "⏳ Processing..." : "🔄 Fetch Reviews"}
          </button>
          <p className="help-text">
            Click to collect new reviews from external systems (Amazon, eBay, etc.)
          </p>
        </div>

        {/* Statistics */}
        {statistics && <Statistics data={statistics} loading={loading} />}

        {/* Product List */}
        <ProductList
          products={products}
          loading={loading}
          onProductClick={handleProductClick}
        />

        {/* Add Review Form */}
        <AddReview
          products={products}
          onAddReview={handleAddReview}
          loading={loading}
          onRequireLogin={handleRequireLogin}
        />

        {/* Review List */}
        <ReviewList reviews={reviews} loading={loading} />
      </main>

      <footer className="app-footer">
        <p>© 2025 Product Reviews System - Powered by React & Express</p>
      </footer>
    </div>
  );
}

export default App;
