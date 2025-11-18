# TechHive – Web Application for Technology Product Review Aggregation

## 📌 Introduction

TechHive is a web application that helps users view reviews of technology products  
(iPhone, Samsung Galaxy, MacBook, AirPods, etc.) aggregated from multiple e-commerce platforms such as:  
**Amazon, FakeStore API**, and other sources.

The project is built using the Fullstack Web Development model, including:

- Frontend interface displaying product lists and reviews.
- Backend API providing product and review data.
- Database storing product information and reviews.
- Admin dashboard for managing users, products, and statistics.

---

## 📚 Technologies Used

### **Frontend**

- React 18 (with Hooks and Context API)
- Vite (build tool)
- Axios (HTTP client)
- Recharts (chart library)
- CSS Modules (component-level styling)
- Responsive layout

### **Backend**

- Node.js
- Express.js
- RESTful API
- JWT (JSON Web Tokens) for authentication
- bcryptjs for password hashing
- Nodemailer for email functionality
- Axios for external API calls

### **Database**

- MySQL 8+
- Tables: `products`, `users`, `reviews`, `password_reset_tokens`
- Views: `review_statistics`

---

## 🧩 Feature List

### ✔ Required Features

- ✅ Display product list
- ✅ View product details
- ✅ Display reviews from multiple sources (Amazon, FakeStore, Mock data)
- ✅ Search and filter products (by category, brand, status)
- ✅ User-friendly, intuitive interface
- ✅ Admin dashboard for management

### ✔ Features Completed by Team

- ✅ **User Authentication System**

  - User registration and login
  - Password reset via email
  - Password change for logged-in users
  - JWT-based session management

- ✅ **Product Management**

  - Display products with images, prices, categories, brands
  - Product detail pages with specifications
  - Product statistics (average rating, review distribution)

- ✅ **Review System**

  - Submit authenticated reviews
  - Display reviews with ratings and comments
  - Aggregate reviews from external sources (FakeStore API, RapidAPI/Amazon)
  - Review statistics and charts

- ✅ **Admin Dashboard**

  - User management (CRUD operations, search, pagination)
  - Product management (CRUD, filters, SKU validation)
  - Comprehensive statistics dashboard
  - Charts: Rating distribution, Category/Brand distribution, Monthly growth

- ✅ **External Review Integration**
  - Fetch reviews from FakeStore API (free)
  - Fetch reviews from RapidAPI (Amazon) with retry logic
  - Mock data fallback for offline testing
  - Configurable via environment variables

---

## 🚀 Project Setup Guide

### **1. Clone Project**

```bash
git clone <repository-url> WebFullStack
cd WebFullStack
```

### **2. Install Backend Dependencies**

```bash
cd backend
npm install
```

### **3. Install Frontend Dependencies**

```bash
cd ../frontend
npm install
```

### **4. Import Database**

1. Open phpMyAdmin or MySQL Workbench
2. Create a new database named `reviews_db`
3. Import file: `backend/database/schema.sql`

This will create all necessary tables and insert sample data.

### **5. Configure Environment Variables**

Create a `.env` file in the `backend/` directory:

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=reviews_db
DB_PORT=3306
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
TIMEZONE=+07:00

# External review sources (optional)
USE_FAKESTORE_API=true        # set true to pull free FakeStore data
USE_REAL_API=false            # set true with valid RapidAPI credentials
RAPIDAPI_HOST=real-time-amazon-data.p.rapidapi.com
RAPIDAPI_KEY=your_key_here

# Email configuration (optional, for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@techhive.com
```

See `backend/ENV_CONFIGURATION.md` for detailed configuration guide.

### **6. Run Backend**

```bash
cd backend
npm run dev          # Starts server with nodemon (auto-reload)
```

Backend will run at: `http://localhost:4000`

### **7. Run Frontend**

```bash
cd frontend
npm run dev          # Starts Vite dev server
```

Frontend will run at: `http://localhost:5173`

### **8. Access the Application**

- **Customer Portal**: `http://localhost:5173`
- **Backend Health Check**: `http://localhost:4000/health`
- **API Documentation**: `http://localhost:4000` (root endpoint shows all available routes)

---

## 🔑 Key API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change password (authenticated)
- `GET /api/auth/me` - Get current user info (authenticated)

### Products & Reviews

- `GET /api/products` - Get all products
- `GET /api/products/:productId` - Get product details with reviews
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/product/:productId` - Get reviews for a product
- `POST /api/reviews` - Create new review (authenticated)
- `GET /api/statistics` - Get review statistics
- `POST /api/fetch-reviews` - Fetch reviews from external sources

### Admin (Requires Admin Role)

- `GET /api/admin/users` - Get all users (with pagination, search)
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:userId` - Update user
- `DELETE /api/admin/users/:userId` - Delete user
- `GET /api/admin/products` - Get all products (with filters)
- `POST /api/admin/products` - Create new product
- `PUT /api/admin/products/:productId` - Update product
- `DELETE /api/admin/products/:productId` - Delete product
- `GET /api/admin/statistics` - Get comprehensive admin statistics

---

## 👥 Team Members and Roles

### **Group Members: 3 members**

#### **Roles & Responsibilities:**
# Nguyễn Thành Nam
**1. Frontend Lead**

- Build main React UI (Home, Products, Product Detail)
- Implement review interface & rating components
- Develop Admin Dashboard UI
- Responsible for managing the admin page (User/Product/Review Management)
- Create responsive layouts and user experience
# Nguyễn Quang Huy
**2. Backend Lead**

- Backend (Express + MySQL)
- Build Express.js REST API (Products, Reviews, Users)
- Error handling, data validation
- Implement authentication and authorization
- External API integration (RapidAPI, FakeStore)
- Bonus Task: Pie Chart – Rating Distribution + Line Chart – Monthly Growth (Users/Products)
# Nguyễn Tuấn Hùng
**3. Integration & Documentation Lead**

- Connect frontend–backend (fetch API, axios, routes)
- Ensure data is displayed correctly from the backend
- Test functionalities (or features)
- Write README.md & LLM_Usage.md
- Bonus charts: Bar Chart – Products by Category + Bar Chart – Products by Brand

---

## 📊 Project Structure

```
WebFullStack/
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── reviewController.js  # Reviews & products
│   │   └── adminController.js   # Admin operations
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT verification
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── adminRoutes.js
│   ├── database/
│   │   ├── schema.sql           # Database schema
│   │   └── migration_*.sql      # Database migrations
│   ├── server.js                # Express app entry point
│   ├── package.json
│   └── .env                      # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── ReviewList.jsx
│   │   │   ├── AddReview.jsx
│   │   │   ├── Statistics.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── admin/           # Admin components
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication context
│   │   ├── services/
│   │   │   ├── api.js           # Product/review API
│   │   │   ├── authApi.js       # Auth API
│   │   │   └── adminApi.js      # Admin API
│   │   ├── App.jsx              # Main app component
│   │   └── main.jsx             # React entry point
│   ├── package.json
│   └── vite.config.js
│
├── README.md                     # This file
└── LLM_Usage.md                  # LLM usage documentation
```

---

## 🛠️ Additional Documentation

- `backend/ENV_CONFIGURATION.md` – Detailed backend `.env` configuration guide
- `backend/TIMEZONE_CONFIGURATION.md` – Timezone setup for MySQL/Node.js
- `backend/ENV_RAPIDAPI.example` – RapidAPI configuration template
- `LLM_Usage.md` – Documentation on how LLM was used in this project

---

## 📝 Notes

- All timestamps are stored in UTC but converted to Vietnam timezone (+07:00) when displayed
- Password reset emails work in development mode (link printed to console)
- External review fetching supports multiple fallback options for reliability
- Admin dashboard requires user with `role='admin'` in database

---

## ✅ Testing Checklist

- [ ] User registration and login
- [ ] Password reset flow
- [ ] Product listing and detail pages
- [ ] Review submission (authenticated)
- [ ] External review fetching (FakeStore/RapidAPI/Mock)
- [ ] Admin user management
- [ ] Admin product management
- [ ] Admin statistics dashboard
- [ ] Charts and visualizations
- [ ] Responsive design on mobile/tablet/desktop

---

**© 2025 TechHive Product Review Platform - Powered by React & Express**
