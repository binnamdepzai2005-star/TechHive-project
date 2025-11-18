import React from 'react'
import './ProductList.css'

const ProductList = ({ products, loading, onProductClick }) => {
  if (loading) {
    return (
      <div className="product-list-container">
        <h2>🛍️ Products List</h2>
        <div className="loading">⏳ Loading...</div>
      </div>
    )
  }

  return (
    <div className="product-list-container">
      <h2>🛍️ Products List ({products.length})</h2>

      <div className="product-grid">
        {products.map((product) => (
          <div
            key={product.id}
            className="product-card"
            onClick={() => onProductClick && onProductClick(product.id)}
            style={{ cursor: onProductClick ? 'pointer' : 'default' }}
          >
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="product-image"
              />
            )}
            <div className="product-info">
              <div className="product-badge">
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
                <p className="product-brand">🏷️ {product.brand}</p>
              )}
              
              <h3>{product.name}</h3>
              
              {product.description && (
                <p className="product-description">
                  {product.description.length > 100 
                    ? product.description.substring(0, 100) + '...' 
                    : product.description}
                </p>
              )}
              
              <div className="product-pricing">
                {product.price !== null && product.price !== undefined && (
                  <div className="price-container">
                    <span className="product-price">
                      ${parseFloat(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                      <>
                        <span className="original-price">
                          ${parseFloat(product.original_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="discount-badge">
                          -{Math.round(((parseFloat(product.original_price) - parseFloat(product.price)) / parseFloat(product.original_price)) * 100)}%
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {onProductClick && (
                <button className="btn-view-detail">View Details →</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductList

