-- Create database
CREATE DATABASE IF NOT EXISTS reviews_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE reviews_db;

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    original_price DECIMAL(12, 2) NULL,
    category VARCHAR(100),
    brand VARCHAR(100),
    sku VARCHAR(100) UNIQUE,
    stock INT DEFAULT 0,
    specifications TEXT,
    warranty VARCHAR(100),
    status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_brand (brand),
    INDEX idx_status (status),
    INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT,
    user_name VARCHAR(100) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_product_id (product_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for products
INSERT INTO products (name, description, image_url, price, original_price, category, brand, sku, stock, specifications, warranty, status) VALUES
('iPhone 15 Pro Max', 
 'Premium smartphone from Apple with A17 Pro chip, featuring an advanced camera system, ProMotion display, and all-day battery life. Perfect for photography enthusiasts and power users.',
 'https://images.unsplash.com/photo-1592286927505-38c8853b4a19?w=400',
 1299.00, 1399.00, 'Smartphone', 'Apple', 'IPH15PM-256GB', 25,
 'Display: 6.7-inch Super Retina XDR, Processor: A17 Pro chip, RAM: 8GB, Storage: 256GB, Camera: 48MP Main + 12MP Ultra Wide + 12MP Telephoto, Battery: Up to 29 hours video playback',
 '1 year warranty', 'active'),

('Samsung Galaxy S24', 
 'Flagship Android device with excellent camera, AI-powered features, and stunning display. Experience next-generation mobile technology.',
 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
 999.00, 1099.00, 'Smartphone', 'Samsung', 'SGS24-128GB', 30,
 'Display: 6.2-inch Dynamic AMOLED 2X, Processor: Snapdragon 8 Gen 3, RAM: 8GB, Storage: 128GB, Camera: 50MP Main + 12MP Ultra Wide + 10MP Telephoto, Battery: 4000mAh',
 '2 years warranty', 'active'),

('MacBook Pro M3', 
 'High-performance laptop for developers and creative professionals. Powered by Apple M3 chip with incredible performance and battery life.',
 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
 1999.00, 2199.00, 'Laptop', 'Apple', 'MBP-M3-14', 15,
 'Display: 14.2-inch Liquid Retina XDR, Processor: Apple M3 chip, RAM: 18GB, Storage: 512GB SSD, Graphics: 10-core GPU, Battery: Up to 18 hours',
 '1 year warranty', 'active'),

('AirPods Pro 2', 
 'Active noise cancelling earbuds with spatial audio and adaptive transparency. Experience immersive sound like never before.',
 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
 249.00, 299.00, 'Audio', 'Apple', 'APP2-USB-C', 50,
 'Active Noise Cancellation, Spatial Audio, Adaptive Transparency, H2 chip, Up to 6 hours listening time, Charging case with USB-C',
 '1 year warranty', 'active');

-- Insert sample data for reviews
INSERT INTO reviews (product_id, user_name, rating, comment) VALUES
(1, 'John Smith', 5, 'Amazing product! Camera is beautiful and super smooth.'),
(1, 'Emily Johnson', 4, 'Good but price is a bit high compared to specs.'),
(1, 'Michael Brown', 5, 'Worth every penny, great battery life and beautiful display!'),
(2, 'Sarah Davis', 5, 'Best Android device right now, very smooth!'),
(2, 'David Wilson', 4, 'Good product, but OneUI is a bit heavy.'),
(3, 'Jennifer Garcia', 5, 'Very powerful machine for programming and design.'),
(3, 'James Martinez', 5, '18 hours battery life, absolutely amazing!'),
(4, 'Lisa Anderson', 4, 'Great noise cancellation, but a bit pricey.');

-- View to get aggregated statistics
CREATE OR REPLACE VIEW review_statistics AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    COUNT(r.id) as total_reviews,
    AVG(r.rating) as average_rating,
    SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) as five_star,
    SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) as four_star,
    SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) as three_star,
    SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) as two_star,
    SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) as one_star
FROM products p
LEFT JOIN reviews r ON p.id = r.product_id
GROUP BY p.id, p.name;

