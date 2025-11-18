import React from 'react'
import './Statistics.css'

const Statistics = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="statistics-container">
        <h2>📊 Overall Statistics</h2>
        <div className="loading">⏳ Loading...</div>
      </div>
    )
  }

  const { overall, byProduct } = data

  const renderStarBar = (count, total) => {
    const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0
    return (
      <div className="star-bar">
        <div className="star-bar-fill" style={{ width: `${percentage}%` }}></div>
        <span className="star-bar-label">{count} ({percentage}%)</span>
      </div>
    )
  }

  return (
    <div className="statistics-container">
      <h2>📊 Overall Statistics</h2>

      {/* Overall Statistics */}
      <div className="stats-overall">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{overall.total_products}</div>
            <div className="stat-label">Products</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <div className="stat-value">{overall.total_reviews}</div>
            <div className="stat-label">Reviews</div>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-value">
              {parseFloat(overall.overall_average_rating).toFixed(1)}
            </div>
            <div className="stat-label">Avg Rating</div>
          </div>
        </div>
      </div>

      {/* Star Distribution */}
      <div className="star-distribution">
        <h3>Rating Distribution</h3>
        <div className="star-bars">
          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} className="star-row">
              <span className="star-label">{star} ⭐</span>
              {renderStarBar(
                overall[`total_${['one', 'two', 'three', 'four', 'five'][star - 1]}_star`],
                overall.total_reviews
              )}
            </div>
          ))}
        </div>
      </div>

      {/* By Product Statistics */}
      <div className="stats-by-product">
        <h3>Statistics by Product</h3>
        <div className="product-stats-grid">
          {byProduct.map((product) => (
            <div key={product.product_id} className="product-stat-card">
              <h4>{product.product_name}</h4>
              <div className="product-stat-info">
                <div className="product-stat-item">
                  <span className="label">Reviews:</span>
                  <span className="value">{product.total_reviews}</span>
                </div>
                <div className="product-stat-item">
                  <span className="label">Average:</span>
                  <span className="value highlight">
                    ⭐ {parseFloat(product.average_rating).toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="mini-star-dist">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = product[`${['one', 'two', 'three', 'four', 'five'][star - 1]}_star`]
                  return count > 0 ? (
                    <span key={star} className="mini-star-item">
                      {star}⭐: {count}
                    </span>
                  ) : null
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Statistics

