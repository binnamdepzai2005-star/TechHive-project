import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import AddReview from "./AddReview";
import "./ProductDetail.css";

const ProductDetail = ({ productId, onBack, onRequireLogin }) => {
  const { user, isAuthenticated } = useAuth();
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddReview, setShowAddReview] = useState(false);

  useEffect(() => {
    loadProductDetail();
  }, [productId]);

  const loadProductDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProductById(productId);
      setProductData(data);
    } catch (err) {
      setError("Unable to load product details: " + err.message);
      console.error("Error loading product detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (reviewData) => {
    try {
      // Check authentication
      if (!isAuthenticated) {
        if (onRequireLogin) {
          onRequireLogin();
        }
        return false;
      }

      reviewData.product_id = parseInt(productId);
      await api.createReview(reviewData);
      // Reload product data to show new review
      await loadProductDetail();
      setShowAddReview(false);
      return true;
    } catch (err) {
      // If 401 error, redirect to login
      if (err.message.includes("login") || err.message.includes("401")) {
        if (onRequireLogin) {
          onRequireLogin();
        }
      }
      console.error("Error adding review:", err);
      return false;
    }
  };

  const renderStars = (rating) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const renderStarBar = (count, total) => {
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
    return (
      <div className="star-bar">
        <div
          className="star-bar-fill"
          style={{ width: `${percentage}%` }}
        ></div>
        <span className="star-bar-label">
          {count} ({percentage}%)
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="loading">⏳ Loading product details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-container">
        <div className="alert alert-error">❌ {error}</div>
        {onBack && (
          <button className="btn btn-primary" onClick={onBack}>
            ← Back to Products
          </button>
        )}
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="product-detail-container">
        <div className="alert alert-error">❌ Product not found</div>
        {onBack && (
          <button className="btn btn-primary" onClick={onBack}>
            ← Back to Products
          </button>
        )}
      </div>
    );
  }

  const { product, statistics, reviews } = productData;

  return (
    <div className="product-detail-container">
      {/* Back Button */}
      {onBack && (
        <button className="btn btn-secondary btn-back" onClick={onBack}>
          ← Back to Products
        </button>
      )}

      {/* Product Header */}
      <div className="product-detail-header">
        <div className="product-detail-image">
          {product.image_url && (
            <img src={product.image_url} alt={product.name} />
          )}
        </div>
        <div className="product-detail-info">
          {/* Badges */}
          <div className="product-badges">
            {product.category && (
              <span className="badge badge-category">{product.category}</span>
            )}
            {product.status === 'out_of_stock' && (
              <span className="badge badge-out-of-stock">Out of Stock</span>
            )}
            {product.status === 'active' && product.stock > 0 && product.stock < 10 && (
              <span className="badge badge-low-stock">Only {product.stock} left</span>
            )}
          </div>

          {product.brand && (
            <p className="product-brand">🏷️ Brand: {product.brand}</p>
          )}

          <h1>{product.name}</h1>

          {/* Pricing */}
          <div className="product-pricing-detail">
            {product.price !== null && product.price !== undefined && (
              <div className="price-container-detail">
                <span className="product-price-large">
                  ${parseFloat(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                  <>
                    <span className="original-price-large">
                      ${parseFloat(product.original_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="discount-badge-large">
                      Save {Math.round(((parseFloat(product.original_price) - parseFloat(product.price)) / parseFloat(product.original_price)) * 100)}%
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {product.description && (
            <p className="product-detail-description">{product.description}</p>
          )}

          {/* Product Details Grid */}
          <div className="product-details-grid">
            {product.sku && (
              <div className="detail-item">
                <span className="detail-label">SKU:</span>
                <span className="detail-value">{product.sku}</span>
              </div>
            )}
            {product.stock !== null && product.stock !== undefined && (
              <div className="detail-item">
                <span className="detail-label">Stock:</span>
                <span className={`detail-value ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {product.stock > 0 ? `✅ ${product.stock} available` : '❌ Out of stock'}
                </span>
              </div>
            )}
            {product.warranty && (
              <div className="detail-item">
                <span className="detail-label">Warranty:</span>
                <span className="detail-value">🛡️ {product.warranty}</span>
              </div>
            )}
            {product.status && (
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className={`detail-value status-${product.status}`}>
                  {product.status === 'active' ? '✅ Active' : product.status === 'out_of_stock' ? '⚠️ Out of Stock' : '❌ Inactive'}
                </span>
              </div>
            )}
          </div>

          {/* Specifications */}
          {product.specifications && (
            <div className="product-specifications">
              <h3>📋 Specifications</h3>
              <div className="specifications-content">
                {product.specifications.split(',').map((spec, index) => (
                  <div key={index} className="spec-item">
                    <span className="spec-bullet">•</span>
                    <span>{spec.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistics Summary */}
          <div className="product-stats-summary">
            <div className="stat-item">
              <span className="stat-label">Rating:</span>
              <span className="stat-value highlight">
                ⭐ {parseFloat(statistics.average_rating || 0).toFixed(1)} / 5.0
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Reviews:</span>
              <span className="stat-value">{statistics.total_reviews || 0}</span>
            </div>
          </div>

          {/* Rating Distribution */}
          {statistics.total_reviews > 0 && (
            <div className="rating-distribution">
              <h3>Rating Distribution</h3>
              <div className="star-bars">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count =
                    statistics[
                      `${["one", "two", "three", "four", "five"][star - 1]}_star`
                    ] || 0;
                  return (
                    <div key={star} className="star-row">
                      <span className="star-label">{star} ⭐</span>
                      {renderStarBar(count, statistics.total_reviews)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Review Button */}
      <div className="add-review-section">
        {isAuthenticated ? (
          <button
            className="btn btn-primary btn-large"
            onClick={() => setShowAddReview(!showAddReview)}
          >
            {showAddReview ? "✖️ Cancel" : "✍️ Add Review"}
          </button>
        ) : (
          <div className="login-prompt">
            <p>🔐 Login to add a review</p>
            {onRequireLogin && (
              <button
                className="btn btn-primary btn-large"
                onClick={onRequireLogin}
              >
                🔐 Login Now
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Review Form */}
      {showAddReview && isAuthenticated && (
        <div className="add-review-form-container">
          <AddReview
            products={[product]}
            onAddReview={handleAddReview}
            loading={loading}
            onRequireLogin={onRequireLogin}
          />
        </div>
      )}

      {/* Reviews Section */}
      <div className="product-reviews-section">
        <h2>📝 Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <div className="empty-state">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="review-user-info">
                    <span className="review-user-name">👤 {review.user_name}</span>
                    <span className="review-date">
                      🕒 {formatDate(review.created_at)}
                    </span>
                  </div>
                  <div className="review-rating">
                    <span className="stars">
                      {renderStars(review.rating)}
                    </span>
                    <span className="rating-number">{review.rating}/5</span>
                  </div>
                </div>
                {review.comment && (
                  <div className="review-comment">
                    <p>{review.comment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

