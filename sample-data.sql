-- Sample data for Ordering System

-- Insert sample categories
INSERT INTO categories (name, description, createdAt, updatedAt) VALUES
('Electronics', 'Electronic devices and accessories', NOW(), NOW()),
('Clothing', 'Apparel and fashion items', NOW(), NOW()),
('Books', 'Books and publications', NOW(), NOW()),
('Food & Beverages', 'Food and drink items', NOW(), NOW()),
('Home & Garden', 'Home improvement and gardening', NOW(), NOW());

-- Insert sample users
INSERT INTO users (name, email, password, phone, address, role, createdAt, updatedAt) VALUES
('John Admin', 'admin@example.com', 'admin123', '1234567890', '123 Admin Street', 'admin', NOW(), NOW()),
('Jane Doe', 'jane@example.com', 'password123', '0987654321', '456 Customer Ave', 'customer', NOW(), NOW()),
('Bob Smith', 'bob@example.com', 'password123', '5555555555', '789 Buyer Blvd', 'customer', NOW(), NOW());

-- Insert sample products
INSERT INTO products (name, description, price, stock, image, categoryId, createdAt, updatedAt) VALUES
('Laptop', 'High-performance laptop', 999.99, 50, 'laptop.jpg', 1, NOW(), NOW()),
('Smartphone', 'Latest smartphone model', 699.99, 100, 'phone.jpg', 1, NOW(), NOW()),
('T-Shirt', 'Cotton t-shirt', 19.99, 200, 'tshirt.jpg', 2, NOW(), NOW()),
('Jeans', 'Blue denim jeans', 49.99, 150, 'jeans.jpg', 2, NOW(), NOW()),
('Programming Book', 'Learn programming', 39.99, 75, 'book.jpg', 3, NOW(), NOW()),
('Coffee Beans', 'Premium coffee beans', 15.99, 300, 'coffee.jpg', 4, NOW(), NOW()),
('Garden Hose', '50ft garden hose', 29.99, 80, 'hose.jpg', 5, NOW(), NOW());

-- Insert sample orders
INSERT INTO orders (userId, totalAmount, status, shippingAddress, createdAt, updatedAt) VALUES
(2, 1049.98, 'delivered', '456 Customer Ave', NOW(), NOW()),
(3, 69.98, 'processing', '789 Buyer Blvd', NOW(), NOW()),
(2, 15.99, 'pending', '456 Customer Ave', NOW(), NOW());

-- Insert sample order items
INSERT INTO order_items (orderId, productId, quantity, price) VALUES
(1, 1, 1, 999.99),
(1, 3, 2, 19.99),
(2, 4, 1, 49.99),
(2, 5, 1, 39.99),
(3, 6, 1, 15.99);

-- Insert sample payments
INSERT INTO payments (orderId, amount, paymentMethod, status, transactionId, createdAt) VALUES
(1, 1049.98, 'credit_card', 'completed', 'TXN123456789', NOW()),
(2, 69.98, 'paypal', 'completed', 'TXN987654321', NOW()),
(3, 15.99, 'cash', 'pending', NULL, NOW());
