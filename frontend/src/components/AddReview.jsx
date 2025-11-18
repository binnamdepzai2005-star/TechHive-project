import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './AddReview.css'

const AddReview = ({ products, onAddReview, loading, onRequireLogin }) => {
  const { isAuthenticated, user } = useAuth()
  const [formData, setFormData] = useState({
    product_id: '',
    rating: 5,
    comment: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' || name === 'product_id' ? parseInt(value) : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check if user is authenticated
    if (!isAuthenticated) {
      if (onRequireLogin) {
        onRequireLogin()
      } else {
        alert('Please login to add a review!')
      }
      return
    }

    if (!formData.product_id) {
      alert('Please select a product!')
      return
    }

    setIsSubmitting(true)
    const success = await onAddReview(formData)

    if (success) {
      // Reset form
      setFormData({
        product_id: '',
        rating: 5,
        comment: ''
      })
      alert('✅ Review added successfully!')
    }

    setIsSubmitting(false)
  }

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="add-review-container">
        <h2>✍️ Add New Review</h2>
        <div className="login-required-message">
          <div className="alert alert-info">
            <p>🔐 You need to login to add a review</p>
            {onRequireLogin && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onRequireLogin}
              >
                🔐 Login Now
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="add-review-container">
      <h2>✍️ Add New Review</h2>
      {user && (
        <p className="review-as-user">Reviewing as: <strong>{user.full_name}</strong></p>
      )}

      <form onSubmit={handleSubmit} className="add-review-form">
        <div className="form-group">
          <label htmlFor="product_id">Product *</label>
          <select
            id="product_id"
            name="product_id"
            value={formData.product_id}
            onChange={handleChange}
            required
            disabled={loading || isSubmitting}
          >
            <option value="">-- Select a product --</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="rating">
            Rating: {renderStars(formData.rating)} ({formData.rating}/5)
          </label>
          <input
            type="range"
            id="rating"
            name="rating"
            min="1"
            max="5"
            value={formData.rating}
            onChange={handleChange}
            disabled={loading || isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="comment">Comment</label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Share your experience with this product..."
            rows="4"
            disabled={loading || isSubmitting}
          />
        </div>

        <button
          type="submit"
          className="btn btn-success"
          disabled={loading || isSubmitting}
        >
          {isSubmitting ? '⏳ Submitting...' : '✅ Submit Review'}
        </button>
      </form>
    </div>
  )
}

export default AddReview

