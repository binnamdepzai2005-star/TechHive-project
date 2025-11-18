-- Migration script to add new fields to products table
-- Run this if you already have an existing database

USE reviews_db;

-- Add new columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price DECIMAL(12, 2) NOT NULL DEFAULT 0.00 AFTER image_url,
ADD COLUMN IF NOT EXISTS original_price DECIMAL(12, 2) NULL AFTER price,
ADD COLUMN IF NOT EXISTS category VARCHAR(100) AFTER original_price,
ADD COLUMN IF NOT EXISTS brand VARCHAR(100) AFTER category,
ADD COLUMN IF NOT EXISTS sku VARCHAR(100) UNIQUE AFTER brand,
ADD COLUMN IF NOT EXISTS stock INT DEFAULT 0 AFTER sku,
ADD COLUMN IF NOT EXISTS specifications TEXT AFTER stock,
ADD COLUMN IF NOT EXISTS warranty VARCHAR(100) AFTER specifications,
ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active' AFTER warranty;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_price ON products(price);

-- Update existing products with sample data
UPDATE products 
SET 
  price = CASE id
    WHEN 1 THEN 1299.00
    WHEN 2 THEN 999.00
    WHEN 3 THEN 1999.00
    WHEN 4 THEN 249.00
    ELSE 0.00
  END,
  original_price = CASE id
    WHEN 1 THEN 1399.00
    WHEN 2 THEN 1099.00
    WHEN 3 THEN 2199.00
    WHEN 4 THEN 299.00
    ELSE NULL
  END,
  category = CASE id
    WHEN 1 THEN 'Smartphone'
    WHEN 2 THEN 'Smartphone'
    WHEN 3 THEN 'Laptop'
    WHEN 4 THEN 'Audio'
    ELSE NULL
  END,
  brand = CASE id
    WHEN 1 THEN 'Apple'
    WHEN 2 THEN 'Samsung'
    WHEN 3 THEN 'Apple'
    WHEN 4 THEN 'Apple'
    ELSE NULL
  END,
  sku = CASE id
    WHEN 1 THEN 'IPH15PM-256GB'
    WHEN 2 THEN 'SGS24-128GB'
    WHEN 3 THEN 'MBP-M3-14'
    WHEN 4 THEN 'APP2-USB-C'
    ELSE NULL
  END,
  stock = CASE id
    WHEN 1 THEN 25
    WHEN 2 THEN 30
    WHEN 3 THEN 15
    WHEN 4 THEN 50
    ELSE 0
  END,
  specifications = CASE id
    WHEN 1 THEN 'Display: 6.7-inch Super Retina XDR, Processor: A17 Pro chip, RAM: 8GB, Storage: 256GB, Camera: 48MP Main + 12MP Ultra Wide + 12MP Telephoto, Battery: Up to 29 hours video playback'
    WHEN 2 THEN 'Display: 6.2-inch Dynamic AMOLED 2X, Processor: Snapdragon 8 Gen 3, RAM: 8GB, Storage: 128GB, Camera: 50MP Main + 12MP Ultra Wide + 10MP Telephoto, Battery: 4000mAh'
    WHEN 3 THEN 'Display: 14.2-inch Liquid Retina XDR, Processor: Apple M3 chip, RAM: 18GB, Storage: 512GB SSD, Graphics: 10-core GPU, Battery: Up to 18 hours'
    WHEN 4 THEN 'Active Noise Cancellation, Spatial Audio, Adaptive Transparency, H2 chip, Up to 6 hours listening time, Charging case with USB-C'
    ELSE NULL
  END,
  warranty = CASE id
    WHEN 1 THEN '1 year warranty'
    WHEN 2 THEN '2 years warranty'
    WHEN 3 THEN '1 year warranty'
    WHEN 4 THEN '1 year warranty'
    ELSE NULL
  END,
  status = 'active'
WHERE id IN (1, 2, 3, 4);

