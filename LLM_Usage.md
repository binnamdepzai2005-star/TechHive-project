# LLM Usage Documentation

This document records how the team used Large Language Models (ChatGPT) to assist in building the "TechHive" project.

The instructor requires describing **how to use AI appropriately**, not directly copying entire code.

---

## 📌 1. Purpose of Using LLM

The team used ChatGPT to:

- Understand the structure of a Fullstack project.
- Get suggestions for API architecture in the backend.
- Learn how to create MySQL database tables.
- Assist with error handling when fetching APIs from the frontend.
- Write documentation (README.md).
- Get suggestions for product interface ideas.

**The team did NOT use AI to write the entire backend/frontend code.**  
All code was **manually rewritten** based on the team's understanding.

---

## 📌 2. Representative Prompts (Some Examples)

### **Prompt 1: Design Database Structure**

> "Please suggest a MySQL table structure for a product review aggregation system that collects reviews from Amazon and other e-commerce platforms."

**AI Suggestion:**

- Create tables: `products`, `users`, `reviews`, `password_reset_tokens`.
- Foreign keys between `reviews.product_id → products.id` and `reviews.user_id → users.id`.

**Team Application:**

- Used the suggestion but modified it, added fields like `image_url`, `category`, `brand`, `sku`, `specifications`, `warranty`, and `status` for products.
- Added authentication-related tables (`users`, `password_reset_tokens`) for secure access.

---

### **Prompt 2: Help with CORS Error Handling**

> "When the frontend fetches API from Node.js, it reports a CORS error. How to fix it?"

**AI Response:**

- Add `cors()` middleware in Express.

**Team Application:**

- Enabled CORS, but fine-tuned it to allow specific localhost origins and configured proper headers for credentials.

---

### **Prompt 3: Product Interface Layout**

> "Suggest a layout for displaying products in a card grid format."

**AI Response:**

- Suggested a 3-column layout, hover effects, and a "View Details" button.

**Team Application:**

- Manually wrote CSS and optimized for responsive design.
- Added product images, ratings, prices, and category filters.
- Implemented product detail pages with review statistics.

---

### **Prompt 4: Authentication Flow**

> "How to implement JWT-based authentication with password reset functionality?"

**AI Response:**

- Use `jsonwebtoken` for tokens, `bcryptjs` for password hashing, and create a password reset token table.

**Team Application:**

- Implemented the full authentication flow including:
  - User registration and login with JWT tokens
  - Password reset via email tokens (with development mode fallback)
  - Password change for logged-in users
  - Middleware for protecting routes (`authenticate`, `isAdmin`)

---

### **Prompt 5: External API Integration**

> "How to fetch product reviews from external APIs like Amazon using RapidAPI?"

**AI Response:**

- Use Axios to call RapidAPI endpoints, handle retries for rate limits.

**Team Application:**

- Implemented a flexible system with multiple fallback options:
  - FakeStore API (free, reliable)
  - RapidAPI (Amazon reviews with retry logic)
  - Mock data (for offline testing)
- Added environment variables to toggle between sources (`USE_FAKESTORE_API`, `USE_REAL_API`).

---

### **Prompt 6: Admin Dashboard Statistics**

> "How to create an admin dashboard with statistics and charts?"

**AI Response:**

- Use SQL aggregation queries and chart libraries like Recharts.

**Team Application:**

- Built comprehensive admin statistics including:
  - User/product/review counts
  - Rating distribution charts
  - Category and brand distribution
  - Monthly growth trends
- Used Recharts for visualization in the React frontend.

---

## 📌 3. What AI Assisted With – Not Created

- ❌ Did not create the complete backend
- ❌ Did not write complete JSON responses
- ❌ Did not build entire HTML/CSS
- ❌ Did not deploy the project

The team only used AI for **guidance – reference – error explanation.**

All implementation was done manually by team members.

---

## 📌 4. Verification and Quality Assurance

The team ensured quality by:

1. **Code Review**: All AI-suggested code was reviewed and modified by team members.
2. **Testing**: Manual testing of all features (authentication, review submission, admin functions).
3. **Error Handling**: Custom error handling added beyond AI suggestions.
4. **Security**: Implemented proper password hashing, JWT validation, and SQL injection prevention.
5. **Documentation**: All code was documented with comments explaining the logic.

---

## 📌 5. Conclusion

Using LLM helped the team:

- ✅ Increase learning efficiency
- ✅ Better understand the fullstack model
- ✅ Complete documentation according to course requirements

**Team Commitment:**

- ✅ Did not copy entire code from AI
- ✅ All core code sections were built and modified by team members
- ✅ Used AI only as a learning and reference tool
- ✅ Maintained code quality and security standards

---

## 📌 6. Best Practices Applied

1. **Always understand the code**: Never copy-paste without understanding.
2. **Modify and adapt**: AI suggestions were always customized to fit project needs.
3. **Test thoroughly**: All features were manually tested before deployment.
4. **Document properly**: Code was documented to explain team's understanding.
5. **Security first**: Implemented proper authentication and authorization beyond AI suggestions.

---

This documentation demonstrates responsible use of AI tools in software development, ensuring learning outcomes while maintaining code quality and originality.
