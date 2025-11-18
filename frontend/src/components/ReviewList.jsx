import React from 'react'
import './ReviewList.css'

const ReviewList = ({ reviews, loading }) => {
  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    // Backend đã cộng 7 giờ rồi, chỉ cần format đẹp
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false // Format 24 giờ
    })
  }

  if (loading) {
    return (
      <div className="review-list-container">
        <h2>📝 Reviews List</h2>
        <div className="loading">⏳ Loading...</div>
      </div>
    )
  }

  return (
    <div className="review-list-container">
      <h2>📝 Reviews List ({reviews.length})</h2>

      {reviews.length === 0 ? (
        <div className="empty-state">
          <p>No reviews yet. Be the first to add a review!</p>
        </div>
      ) : (
        <div className="review-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="review-product">
                  {review.product_image && (
                    <img
                      src={review.product_image}
                      alt={review.product_name}
                      className="product-thumb"
                    />
                  )}
                  <div>
                    <h3>{review.product_name}</h3>
                    <p className="review-user">👤 {review.user_name}</p>
                  </div>
                </div>
                <div className="review-rating">
                  <span className="stars">{renderStars(review.rating)}</span>
                  <span className="rating-number">{review.rating}/5</span>
                </div>
              </div>

              {review.comment && (
                <div className="review-comment">
                  <p>{review.comment}</p>
                </div>
              )}

              <div className="review-footer">
                <span className="review-date">
                  🕒 {formatDate(review.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ReviewList

