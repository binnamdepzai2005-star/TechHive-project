import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import adminApi from "../../services/adminApi";
import "./AdminStatistics.css";

const AdminStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getStatistics();
      setStatistics(data);
    } catch (err) {
      setError("Unable to load statistics: " + err.message);
      console.error("Error loading statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-statistics">
        <div className="loading">⏳ Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-statistics">
        <div className="alert alert-error">❌ {error}</div>
        <button className="btn btn-primary" onClick={loadStatistics}>
          Retry
        </button>
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  const { users, products, reviews, recent, charts } = statistics;

  // Prepare data for charts
  const ratingChartData = charts?.ratingDistribution?.map((item) => ({
    name: `${item.rating} ⭐`,
    value: parseInt(item.count),
    rating: item.rating,
  })) || [];

  const categoryChartData = charts?.categoryDistribution?.map((item) => ({
    name: item.category,
    value: parseInt(item.count),
  })) || [];

  const brandChartData = charts?.brandDistribution?.map((item) => ({
    name: item.brand,
    value: parseInt(item.count),
  })) || [];

  const monthlyData = (charts?.monthlyUsers || []).map((userItem, index) => {
    const productItem = charts?.monthlyProducts?.[index] || { count: 0 };
    return {
      month: userItem.month,
      users: parseInt(userItem.count),
      products: parseInt(productItem.count),
    };
  });

  // Colors for charts
  const COLORS = ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe", "#00f2fe", "#43e97b", "#38f9d7"];

  const ratingColors = {
    5: "#4CAF50",
    4: "#8BC34A",
    3: "#FFC107",
    2: "#FF9800",
    1: "#F44336",
  };

  return (
    <div className="admin-statistics">
      <h2>📊 Dashboard Overview</h2>

      {/* Main Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{users.total_users || 0}</div>
            <div className="stat-label">Total Users</div>
            <div className="stat-details">
              <span>Admins: {users.total_admins || 0}</span>
              <span>Users: {users.total_regular_users || 0}</span>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-products">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{products.total_products || 0}</div>
            <div className="stat-label">Total Products</div>
            <div className="stat-details">
              <span>Active: {products.active_products || 0}</span>
              <span>Out of Stock: {products.out_of_stock_products || 0}</span>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-reviews">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <div className="stat-value">{reviews.total_reviews || 0}</div>
            <div className="stat-label">Total Reviews</div>
            <div className="stat-details">
              <span>Avg Rating: ⭐ {parseFloat(reviews.average_rating || 0).toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-verified">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{users.verified_users || 0}</div>
            <div className="stat-label">Verified Users</div>
            <div className="stat-details">
              <span>Total Stock: {products.total_stock || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>📈 Recent Activity (Last 7 Days)</h3>
        <div className="activity-grid">
          <div className="activity-card">
            <div className="activity-icon">👤</div>
            <div className="activity-content">
              <div className="activity-value">{recent.users || 0}</div>
              <div className="activity-label">New Users</div>
            </div>
          </div>
          <div className="activity-card">
            <div className="activity-icon">📦</div>
            <div className="activity-content">
              <div className="activity-value">{recent.products || 0}</div>
              <div className="activity-label">New Products</div>
            </div>
          </div>
          <div className="activity-card">
            <div className="activity-icon">💬</div>
            <div className="activity-content">
              <div className="activity-value">{recent.reviews || 0}</div>
              <div className="activity-label">New Reviews</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <h3>📊 Data Visualization</h3>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Rating Distribution Pie Chart */}
          {ratingChartData.length > 0 && (
            <div className="chart-card">
              <h4>⭐ Rating Distribution</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ratingChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ratingChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={ratingColors[entry.rating] || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category Distribution Bar Chart */}
          {categoryChartData.length > 0 && (
            <div className="chart-card">
              <h4>📂 Products by Category</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#667eea" name="Products" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Brand Distribution Bar Chart */}
          {brandChartData.length > 0 && (
            <div className="chart-card">
              <h4>🏷️ Products by Brand</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={brandChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#f093fb" name="Products" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Monthly Growth Line Chart */}
          {monthlyData.length > 0 && (
            <div className="chart-card chart-card-full">
              <h4>📈 Monthly Growth (Last 6 Months)</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#667eea"
                    strokeWidth={2}
                    name="New Users"
                    dot={{ fill: "#667eea", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="products"
                    stroke="#f5576c"
                    strokeWidth={2}
                    name="New Products"
                    dot={{ fill: "#f5576c", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;
