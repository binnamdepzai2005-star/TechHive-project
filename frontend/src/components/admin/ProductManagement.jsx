import React, { useState, useEffect } from "react";
import adminApi from "../../services/adminApi";
import "./ProductManagement.css";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ categories: [], brands: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchFilters, setSearchFilters] = useState({
    search: "",
    category: "",
    brand: "",
    status: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    price: "",
    original_price: "",
    category: "",
    brand: "",
    sku: "",
    stock: "",
    specifications: "",
    warranty: "",
    status: "active",
  });

  useEffect(() => {
    loadProductFilters();
    loadProducts();
  }, [pagination.page, searchFilters]);

  const loadProductFilters = async () => {
    try {
      const data = await adminApi.getProductFilters();
      setFilters(data);
    } catch (err) {
      console.error("Error loading filters:", err);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getProducts(
        pagination.page,
        pagination.limit,
        searchFilters.search,
        searchFilters.category,
        searchFilters.brand,
        searchFilters.status
      );
      setProducts(response.data || response);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      setError("Unable to load products: " + err.message);
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadProducts();
  };

  const handleFilterChange = (field, value) => {
    setSearchFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      image_url: "",
      price: "",
      original_price: "",
      category: "",
      brand: "",
      sku: "",
      stock: "",
      specifications: "",
      warranty: "",
      status: "active",
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      image_url: product.image_url || "",
      price: product.price || "",
      original_price: product.original_price || "",
      category: product.category || "",
      brand: product.brand || "",
      sku: product.sku || "",
      stock: product.stock || "",
      specifications: product.specifications || "",
      warranty: product.warranty || "",
      status: product.status || "active",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const submitData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        stock: parseInt(formData.stock) || 0,
      };

      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, submitData);
      } else {
        await adminApi.createProduct(submitData);
      }

      closeModal();
      loadProducts();
      alert(editingProduct ? "✅ Product updated successfully!" : "✅ Product created successfully!");
    } catch (err) {
      setError(err.message || "Failed to save product");
      console.error("Error saving product:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product? This will also delete all related reviews.")) {
      return;
    }

    try {
      setLoading(true);
      await adminApi.deleteProduct(productId);
      loadProducts();
      alert("✅ Product deleted successfully!");
    } catch (err) {
      setError(err.message || "Failed to delete product");
      console.error("Error deleting product:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="product-management">
      <div className="management-header">
        <h2>📦 Products Management</h2>
        <button className="btn btn-primary" onClick={openCreateModal}>
          ➕ Add New Product
        </button>
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchFilters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="search-input"
          />
          <select
            value={searchFilters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {filters.categories?.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            value={searchFilters.brand}
            onChange={(e) => handleFilterChange("brand", e.target.value)}
            className="filter-select"
          >
            <option value="">All Brands</option>
            {filters.brands?.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
          <select
            value={searchFilters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          <button type="submit" className="btn btn-primary">
            🔍 Search
          </button>
        </form>
      </div>

      {error && <div className="alert alert-error">❌ {error}</div>}

      {/* Products Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading">⏳ Loading...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">No products found</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="product-thumbnail"
                      />
                    ) : (
                      <span className="no-image">No Image</span>
                    )}
                  </td>
                  <td>
                    <div className="product-name-cell">
                      <strong>{product.name}</strong>
                      {product.sku && (
                        <small className="sku">SKU: {product.sku}</small>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="price-cell">
                      <span className="current-price">
                        ${parseFloat(product.price || 0).toFixed(2)}
                      </span>
                      {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                        <span className="original-price">
                          ${parseFloat(product.original_price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{product.category || "-"}</td>
                  <td>{product.brand || "-"}</td>
                  <td>
                    <span className={product.stock > 0 ? "stock-in" : "stock-out"}>
                      {product.stock || 0}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${product.status}`}>
                      {product.status}
                    </span>
                  </td>
                  <td>{formatDate(product.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => openEditModal(product)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(product.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            ← Previous
          </button>
          <span className="pagination-info">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <button
            className="btn btn-secondary"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Next →
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? "✏️ Edit Product" : "➕ Create New Product"}</h3>
              <button className="btn-close" onClick={closeModal}>
                ✖️
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Original Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.original_price}
                    onChange={(e) =>
                      setFormData({ ...formData, original_price: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    list="categories"
                  />
                  <datalist id="categories">
                    {filters.categories?.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    list="brands"
                  />
                  <datalist id="brands">
                    {filters.brands?.map((brand) => (
                      <option key={brand} value={brand} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Warranty</label>
                <input
                  type="text"
                  value={formData.warranty}
                  onChange={(e) =>
                    setFormData({ ...formData, warranty: e.target.value })
                  }
                  placeholder="e.g., 1 year warranty"
                />
              </div>

              <div className="form-group">
                <label>Specifications</label>
                <textarea
                  value={formData.specifications}
                  onChange={(e) =>
                    setFormData({ ...formData, specifications: e.target.value })
                  }
                  rows="3"
                  placeholder="Enter specifications separated by commas"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "⏳ Saving..." : editingProduct ? "💾 Update" : "✅ Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;

