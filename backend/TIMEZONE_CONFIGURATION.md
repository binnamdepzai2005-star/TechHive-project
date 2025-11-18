# ⏰ Cấu Hình Múi Giờ (Timezone Configuration)

## 🌏 Múi Giờ Việt Nam

Hệ thống được cấu hình mặc định sử dụng **múi giờ Việt Nam (Hà Nội)**: **GMT+7** (UTC+07:00)

---

## 📝 Cấu Hình

### 1. File `.env`

Thêm dòng sau vào file `.env` trong thư mục `backend/`:

```env
# Timezone Configuration
TIMEZONE=+07:00
```

**Các múi giờ phổ biến:**

- Việt Nam (Hà Nội): `+07:00`
- Singapore: `+08:00`
- Tokyo: `+09:00`
- UTC: `+00:00`

### 2. MySQL Connection

File `backend/config/database.js` đã được cấu hình tự động:

```javascript
const pool = mysql.createPool({
  // ... other configs
  timezone: process.env.TIMEZONE || "+07:00", // Múi giờ Việt Nam
  dateStrings: false, // Convert to Date objects
});
```

---

## 🔧 Kiểm Tra & Khắc Phục

### Kiểm Tra Timezone Hiện Tại

Chạy các lệnh SQL sau để kiểm tra timezone của MySQL:

```sql
-- Kiểm tra timezone của MySQL server
SELECT @@global.time_zone, @@session.time_zone;

-- Kiểm tra thời gian hiện tại
SELECT NOW(), CURRENT_TIMESTAMP();
```

### Cách 1: Set Timezone Toàn Bộ MySQL Server (Khuyến nghị)

**Windows:**

1. Mở file `my.ini` (thường ở `C:\ProgramData\MySQL\MySQL Server 8.0\my.ini`)
2. Thêm vào section `[mysqld]`:
   ```ini
   [mysqld]
   default-time-zone='+07:00'
   ```
3. Restart MySQL service:
   - Services → MySQL → Restart

**Mac/Linux:**

1. Mở file `my.cnf` (thường ở `/etc/mysql/my.cnf` hoặc `/etc/my.cnf`)
2. Thêm vào section `[mysqld]`:
   ```ini
   [mysqld]
   default-time-zone='+07:00'
   ```
3. Restart MySQL:

   ```bash
   # Mac
   brew services restart mysql

   # Linux
   sudo systemctl restart mysql
   ```

### Cách 2: Set Timezone Cho Session (Tạm thời)

Chạy SQL sau khi kết nối:

```sql
SET time_zone = '+07:00';
SET GLOBAL time_zone = '+07:00';
```

### Cách 3: Load Timezone Data (Nếu MySQL chưa có timezone data)

**Mac/Linux:**

```bash
mysql_tzinfo_to_sql /usr/share/zoneinfo | mysql -u root -p mysql
```

**Windows:**

- Download timezone data từ: https://dev.mysql.com/downloads/timezones.html
- Import vào MySQL

---

## 🧪 Test Timezone

### 1. Tạo File Test

Tạo file `backend/test-timezone.js`:

```javascript
const db = require("./config/database");

async function testTimezone() {
  try {
    // Test 1: Check MySQL timezone
    const [timezone] = await db.query(
      "SELECT @@session.time_zone as session_tz, @@global.time_zone as global_tz"
    );
    console.log("MySQL Timezone:", timezone[0]);

    // Test 2: Check current time
    const [currentTime] = await db.query("SELECT NOW() as mysql_time");
    console.log("MySQL NOW():", currentTime[0].mysql_time);
    console.log("Node.js Date:", new Date());

    // Test 3: Insert and retrieve with timezone
    await db.query(
      "CREATE TEMPORARY TABLE test_tz (id INT, created_at TIMESTAMP)"
    );
    await db.query("INSERT INTO test_tz VALUES (1, NOW())");
    const [result] = await db.query("SELECT * FROM test_tz");
    console.log("Saved Time:", result[0].created_at);

    process.exit(0);
  } catch (error) {
    console.error("Test Error:", error);
    process.exit(1);
  }
}

testTimezone();
```

### 2. Chạy Test

```bash
cd backend
node test-timezone.js
```

**Kết quả mong đợi:**

```
MySQL Timezone: { session_tz: '+07:00', global_tz: '+07:00' }
MySQL NOW(): 2025-10-23 15:30:00  # Giờ Việt Nam
Node.js Date: 2025-10-23T08:30:00.000Z  # UTC (trừ 7 giờ)
Saved Time: 2025-10-23T08:30:00.000Z
```

---

## 📊 Hiển Thị Thời Gian Đúng Trên Frontend

### Frontend Format

Trong React components, format datetime theo múi giờ Việt Nam:

```javascript
// frontend/src/components/ReviewList.jsx
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// Sử dụng:
formatDate("2025-10-23T08:30:00.000Z");
// Output: "23 tháng 10, 2025 lúc 15:30:00"
```

---

## 🔍 Debug Timezone Issues

### Issue 1: Thời gian sai 7 giờ

**Nguyên nhân:** MySQL lưu theo UTC nhưng không convert khi trả về

**Giải pháp:**

1. Set `timezone: '+07:00'` trong database config ✅ (Đã fix)
2. Restart backend server
3. Xóa data cũ và insert lại với timezone mới

### Issue 2: Frontend hiển thị sai giờ

**Nguyên nhân:** Browser tự động convert theo timezone local

**Giải pháp:**
Sử dụng `toLocaleString()` với `timeZone: 'Asia/Ho_Chi_Minh'`

### Issue 3: Data cũ vẫn sai giờ

**Nguyên nhân:** Data đã lưu trước khi config timezone

**Giải pháp:**

```sql
-- Backup data trước
CREATE TABLE reviews_backup AS SELECT * FROM reviews;

-- Update data (add 7 hours nếu data đang là UTC)
UPDATE reviews
SET created_at = DATE_ADD(created_at, INTERVAL 7 HOUR),
    updated_at = DATE_ADD(updated_at, INTERVAL 7 HOUR);

-- Hoặc re-insert sample data
DELETE FROM reviews;
source database/schema.sql;
```

---

## 📌 Best Practices

1. **Luôn dùng TIMESTAMP** thay vì DATETIME trong MySQL

   - TIMESTAMP tự động convert timezone
   - DATETIME lưu giá trị literal

2. **Set timezone ở cả 3 nơi:**

   - ✅ MySQL Server config (my.ini/my.cnf)
   - ✅ MySQL Connection (database.js)
   - ✅ Frontend display (toLocaleString)

3. **Kiểm tra timezone sau mỗi lần:**

   - Restart MySQL
   - Deploy code mới
   - Migrate database

4. **Log timezone khi debug:**
   ```javascript
   console.log("Server Time:", new Date());
   console.log("Timezone Offset:", new Date().getTimezoneOffset());
   ```

---

## ✅ Checklist

Sau khi cấu hình, kiểm tra:

- [ ] File `.env` có dòng `TIMEZONE=+07:00`
- [ ] MySQL config (my.ini/my.cnf) có `default-time-zone='+07:00'`
- [ ] Restart MySQL service
- [ ] Restart backend server
- [ ] Test với `node test-timezone.js`
- [ ] Tạo review mới và kiểm tra thời gian hiển thị
- [ ] Xác nhận thời gian đúng với giờ Việt Nam hiện tại

---

## 📞 Troubleshooting

Nếu vẫn gặp vấn đề, thử các bước sau:

1. **Check MySQL timezone:**

   ```sql
   SELECT @@global.time_zone, @@session.time_zone, NOW();
   ```

2. **Check backend timezone:**

   ```bash
   cd backend
   node -e "console.log(new Date())"
   ```

3. **Check data trong database:**

   ```sql
   SELECT id, created_at, updated_at FROM reviews ORDER BY id DESC LIMIT 5;
   ```

4. **Enable debug logging:**
   ```javascript
   // backend/config/database.js
   console.log("🌏 MySQL Timezone:", process.env.TIMEZONE || "+07:00");
   ```

---

**✨ Lưu ý:** Sau khi cấu hình xong, tất cả thời gian mới insert vào database sẽ tự động theo múi giờ Việt Nam!
