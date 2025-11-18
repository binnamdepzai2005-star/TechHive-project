# ⚙️ Cấu Hình File .env cho Backend

## 📝 Tạo File .env

Tạo file `.env` trong thư mục `backend/` với nội dung sau:

```env
# ===================================
# SERVER CONFIGURATION
# ===================================
PORT=4000
NODE_ENV=development

# ===================================
# MYSQL DATABASE CONFIGURATION
# ===================================
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=reviews_db
DB_PORT=3306

# ===================================
# CORS CONFIGURATION
# ===================================
FRONTEND_URL=http://localhost:5173

# ===================================
# APPLICATION SETTINGS
# ===================================
APP_NAME=Reviews API
APP_VERSION=1.0.0

# ===================================
# JWT CONFIGURATION
# ===================================
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# ===================================
# EMAIL CONFIGURATION (Optional)
# ===================================
# For production, configure real email service
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASSWORD=your-app-password
# EMAIL_FROM=noreply@yourapp.com
```

---

## 📖 Giải Thích Từng Biến

### 🖥️ Server Configuration

#### `PORT=4000`

- **Mô tả:** Port mà backend server sẽ chạy
- **Mặc định:** 4000
- **Thay đổi:** Nếu port 4000 bị chiếm, đổi thành 4001, 5000, etc.

#### `NODE_ENV=development`

- **Mô tả:** Môi trường chạy ứng dụng
- **Giá trị:**
  - `development` - Cho môi trường phát triển (hiển thị error chi tiết)
  - `production` - Cho môi trường sản xuất (ẩn error details)
  - `test` - Cho môi trường testing

---

### 🗄️ MySQL Database Configuration

#### `DB_HOST=localhost`

- **Mô tả:** Địa chỉ MySQL server
- **Mặc định:** localhost
- **Thay đổi:**
  - `127.0.0.1` - IP local
  - `mysql.example.com` - Remote server
  - `192.168.1.100` - LAN server

#### `DB_USER=root`

- **Mô tả:** Username MySQL
- **Mặc định:** root
- **Thay đổi:** Tên user MySQL của bạn (ví dụ: `reviews_user`)

#### `DB_PASSWORD=`

- **Mô tả:** Password MySQL
- **Mặc định:** Để trống (không có password)
- **⚠️ QUAN TRỌNG:** Thay bằng password MySQL của bạn
- **Ví dụ:** `DB_PASSWORD=my_secure_password_123`

#### `DB_NAME=reviews_db`

- **Mô tả:** Tên database sẽ kết nối
- **Mặc định:** reviews_db
- **Lưu ý:** Database này phải đã được tạo từ file `schema.sql`

#### `DB_PORT=3306`

- **Mô tả:** Port MySQL server
- **Mặc định:** 3306 (default MySQL port)
- **Thay đổi:** Nếu MySQL chạy port khác

---

### 🔐 CORS Configuration

#### `FRONTEND_URL=http://localhost:5173`

- **Mô tả:** URL của frontend để cấu hình CORS
- **Mặc định:** http://localhost:5173 (Vite default port)
- **Thay đổi:**
  - `http://localhost:3000` - Nếu dùng React default
  - `http://localhost:8080` - Nếu dùng Vue
  - `https://yourdomain.com` - Production domain

---

### ⚙️ Application Settings (Optional)

#### `APP_NAME=Reviews API`

- **Mô tả:** Tên ứng dụng
- **Sử dụng:** Hiển thị trong logs, responses

#### `APP_VERSION=1.0.0`

- **Mô tả:** Version của API
- **Sử dụng:** Tracking versions

---

## 🚀 Ví Dụ Cấu Hình

### Cấu Hình Cơ Bản (Localhost)

```env
PORT=4000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=reviews_db
DB_PORT=3306
FRONTEND_URL=http://localhost:5173
```

### Cấu Hình Với MySQL Password

```env
PORT=4000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mypassword123
DB_NAME=reviews_db
DB_PORT=3306
FRONTEND_URL=http://localhost:5173
```

### Cấu Hình Remote Database

```env
PORT=4000
NODE_ENV=production
DB_HOST=db.example.com
DB_USER=reviews_user
DB_PASSWORD=secure_password_here
DB_NAME=reviews_db
DB_PORT=3306
FRONTEND_URL=https://myapp.com
```

### Cấu Hình Với User Riêng

```env
PORT=4000
NODE_ENV=development
DB_HOST=localhost
DB_USER=reviews_user
DB_PASSWORD=user_password_123
DB_NAME=reviews_db
DB_PORT=3306
FRONTEND_URL=http://localhost:5173
```

---

## 📋 Checklist Setup

### Bước 1: Tạo File

```bash
# Trong thư mục backend/
# Windows:
type nul > .env

# Mac/Linux:
touch .env
```

### Bước 2: Copy Nội Dung

- Copy template ở trên vào file `.env`
- Hoặc sử dụng code editor để tạo file

### Bước 3: Chỉnh Sửa

- [ ] Thay `DB_PASSWORD` bằng password MySQL của bạn
- [ ] Kiểm tra `DB_USER` (thường là `root`)
- [ ] Kiểm tra `PORT` (4000 hoặc port khác nếu bị chiếm)
- [ ] Xác nhận `DB_NAME` (phải là `reviews_db`)

### Bước 4: Kiểm Tra

```bash
# Start backend
npm run dev

# Xem console, phải thấy:
# ✅ Kết nối MySQL thành công!
# 🚀 Server đang chạy tại: http://localhost:4000
```

---

## ❌ Các Lỗi Thường Gặp

### Lỗi 1: Access denied for user 'root'@'localhost'

```
❌ Error: Access denied for user 'root'@'localhost' (using password: YES)
```

**Nguyên nhân:** Sai password MySQL

**Giải pháp:**

- Kiểm tra lại `DB_PASSWORD` trong file `.env`
- Reset password MySQL nếu quên

### Lỗi 2: Unknown database 'reviews_db'

```
❌ Error: Unknown database 'reviews_db'
```

**Nguyên nhân:** Database chưa được tạo

**Giải pháp:**

- Chạy file `backend/database/schema.sql` trong MySQL
- Xem hướng dẫn trong file `DATABASE_SETUP.md`

### Lỗi 3: ECONNREFUSED

```
❌ Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Nguyên nhân:** MySQL server không chạy

**Giải pháp:**

```bash
# Windows
net start MySQL80

# Mac
brew services start mysql

# Linux
sudo systemctl start mysql
```

### Lỗi 4: Port already in use

```
❌ Error: listen EADDRINUSE: address already in use :::4000
```

**Nguyên nhân:** Port 4000 đã được sử dụng

**Giải pháp:**

- Thay đổi `PORT=4001` trong file `.env`

---

## 🔐 Bảo Mật

### ⚠️ QUAN TRỌNG:

1. **KHÔNG commit file `.env` lên Git**

   - File `.env` đã có trong `.gitignore`
   - Chứa thông tin nhạy cảm (passwords, API keys)

2. **Sử dụng password mạnh**

   - Ít nhất 12 ký tự
   - Kết hợp chữ, số, ký tự đặc biệt
   - Không dùng password dễ đoán

3. **Khác nhau cho mỗi môi trường**

   - Development: password đơn giản hơn
   - Production: password phức tạp, secure

4. **Backup file .env**
   - Lưu ở nơi an toàn
   - Không share qua email/chat

---

## 📝 Template Quick Copy

Copy đoạn này và paste vào file `.env`:

```env
PORT=4000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=THAY_PASSWORD_CUA_BAN_O_DAY
DB_NAME=reviews_db
DB_PORT=3306
FRONTEND_URL=http://localhost:5173
APP_NAME=Reviews API
APP_VERSION=1.0.0
```

**🔴 Nhớ thay `THAY_PASSWORD_CUA_BAN_O_DAY` bằng password MySQL thực tế!**

---

## 🆘 Cần Trợ Giúp?

### Kiểm tra kết nối MySQL:

```bash
mysql -u root -p
# Nhập password
# Nếu kết nối thành công -> password đúng
```

### Test biến môi trường:

Thêm vào `backend/server.js` (tạm thời để test):

```javascript
console.log("ENV Variables:");
console.log("PORT:", process.env.PORT);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
```

---

**✅ Sau khi cấu hình xong file `.env`, chạy `npm run dev` để start backend!**
