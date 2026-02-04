# Ordering System - NestJS Application

A comprehensive ordering system built with NestJS, TypeORM, and MySQL implementing a complete e-commerce backend with JWT authentication, email notifications, and queue-based processing.

## Features

- User Management (Admin & Customer roles)
- JWT Authentication & Authorization
- Category Management
- Product Management with Variants
- Shopping Cart System
- Order Management
- Order Items Management
- Payment Processing
- Email Notifications (via Resend)
- Queue System with BullMQ & Redis

## Database Schema

The application implements the following entities:

### Users
- id, name, email, password, phone, address, role (admin/customer)
- Relationships: One-to-Many with Orders

### Categories
- id, name, description
- Relationships: One-to-Many with Products

### Products
- id, name, description, price, stock, image, categoryId
- Relationships: Many-to-One with Category, One-to-Many with OrderItems

### Orders
- id, userId, totalAmount, status (pending/processing/shipped/delivered/cancelled), shippingAddress
- Relationships: Many-to-One with User, One-to-Many with OrderItems, One-to-One with Payment

### OrderItems
- id, orderId, productId, quantity, price
- Relationships: Many-to-One with Order and Product

### Payments
- id, orderId, amount, paymentMethod (credit_card/debit_card/paypal/cash), status (pending/completed/failed/refunded), transactionId
- Relationships: One-to-One with Order

## Prerequisites

Before running this application locally, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** 
- **MySQL** (v5.7)
- **Redis** (v6.0 or higher)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ordering-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Create MySQL Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE order_system;

# Exit MySQL
exit;
```

### 4. Redis Setup

#### Start Redis Server

**macOS (using Homebrew):**
```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

**Windows:**
Download and install from [Redis Windows releases](https://github.com/microsoftarchive/redis/releases)

#### Verify Redis is Running

```bash
redis-cli ping
# Should return: PONG
```

### 5. Environment Configuration

Copy the example environment file and update with your credentials:

```bash
cp .env.example .env
```

Then edit `.env` and update the following values:

- **DB_USERNAME**: Your MySQL username (default: `root`)
- **DB_PASSWORD**: Your MySQL password
- **JWT_SECRET**: Generate a secure secret using `openssl rand -base64 32`
- **RESEND_API_KEY**: Get your API key from [https://resend.com](https://resend.com)

**Important Notes:**
- Never commit your `.env` file to version control
- Set `DB_SYNCHRONIZE=false` in production and use migrations instead
- Use strong, unique values for JWT_SECRET in production
- Ensure EMAIL_FROM is verified in your Resend account

### 6. Database Migration

The application will automatically create tables on first run if `DB_SYNCHRONIZE=true`. For production or migration-based setup:


## Running the Application

### Development Mode (with hot reload)

```bash
npm run start:dev
```

The application will start on `http://localhost:4000` (or the PORT specified in your `.env` file)

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Other Available Scripts

```bash
# Start without watch mode
npm run start

# Start with debug mode
npm run start:debug

# Format code
npm run format

# Lint code
npm run lint

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

## Verifying the Setup

Once the application is running, you can verify it's working:

1. **Check the server is running:**
   ```bash
   curl http://localhost:4000
   ```

2. **Health check endpoint (if available):**
   ```bash
   curl http://localhost:4000/health
   ```

3. **Check Redis connection:**
   The application logs should show successful Redis connection

4. **Check MySQL connection:**
   The application logs should show successful database connection

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user (returns JWT token)

### Users (Protected)
- `GET /user` - Get all users (Admin only)
- `GET /user/:id` - Get user by ID
- `POST /user` - Create new user (Admin only)
- `PATCH /user/:id` - Update user
- `DELETE /user/:id` - Delete user (Admin only)

### Categories
- `GET /category` - Get all categories
- `GET /category/:id` - Get category by ID
- `POST /category` - Create new category (Admin only)
- `PATCH /category/:id` - Update category (Admin only)
- `DELETE /category/:id` - Delete category (Admin only)

### Products
- `GET /product` - Get all products
- `GET /product/:id` - Get product by ID
- `POST /product` - Create new product (Admin only)
- `PATCH /product/:id` - Update product (Admin only)
- `DELETE /product/:id` - Delete product (Admin only)

### Cart
- `POST /cart` - Add item to cart
- `GET /cart` - Get user's cart
- `PATCH /cart/:id` - Update cart item quantity
- `DELETE /cart/:id` - Remove item from cart
- `DELETE /cart` - Clear entire cart

### Orders
- `GET /order` - Get all orders (Admin) or user's orders
- `GET /order/:id` - Get order by ID
- `POST /order` - Create new order
- `PATCH /order/:id` - Update order status (Admin only)
- `DELETE /order/:id` - Cancel order

### Order Items
- `GET /order-item` - Get all order items
- `GET /order-item/:id` - Get order item by ID
- `POST /order-item` - Create new order item
- `PATCH /order-item/:id` - Update order item
- `DELETE /order-item/:id` - Delete order item

### Payments
- `GET /payment` - Get all payments (Admin only)
- `GET /payment/:id` - Get payment by ID
- `POST /payment` - Create new payment
- `PATCH /payment/:id` - Update payment status
- `DELETE /payment/:id` - Refund payment

### Authentication Headers

For protected endpoints, include the JWT token in the request header:

```
Authorization: Bearer <your_jwt_token>
```

## Technologies Used

- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for TypeScript and JavaScript
- **MySQL** - Relational database
- **Redis** - In-memory data store for queue management
- **BullMQ** - Queue and job processing system
- **JWT** - JSON Web Token for authentication
- **Passport** - Authentication middleware
- **Bcrypt** - Password hashing
- **Resend** - Email delivery service
- **class-validator** - Validation decorators
- **class-transformer** - Transformation decorators

## Project Structure

```
src/
├── auth/                  # Authentication module (JWT, login, register)
├── user/                  # User management
│   ├── dto/
│   ├── entities/
│   ├── user.controller.ts
│   ├── user.service.ts
│   └── user.module.ts
├── category/              # Category management
├── product/               # Product management with variants
├── cart/                  # Shopping cart functionality
├── order/                 # Order management
├── order-item/            # Order items
├── payment/               # Payment processing
├── email/                 # Email service (Resend integration)
├── queue/                 # Queue processing (BullMQ)
├── app.module.ts
└── main.ts
```

## Development Notes

- All entities include timestamps (createdAt, updatedAt)
- Global validation pipes are enabled
- CORS is enabled for cross-origin requests
- All relationships are properly configured with TypeORM decorators
- DTOs include validation decorators for data integrity
- JWT-based authentication with role-based authorization
- Email notifications are queued and processed asynchronously
- Redis is used for queue management with priority support

## Troubleshooting

### Common Issues

**MySQL Connection Failed:**
- Verify MySQL is running: `mysql -u root -p`
- Check credentials in `.env` file
- Ensure database exists: `CREATE DATABASE order_system;`

**Redis Connection Failed:**
- Check if Redis is running: `redis-cli ping`
- Start Redis: `brew services start redis` (macOS) or `sudo systemctl start redis-server` (Linux)
- Verify Redis port in `.env` matches your Redis configuration

**Port Already in Use:**
- Change the PORT in `.env` to an available port
- Or kill the process using the port: `lsof -ti:4000 | xargs kill -9`

**TypeORM Synchronization Issues:**
- Set `DB_SYNCHRONIZE=false` in `.env`
- Drop and recreate the database if needed (development only)
- Use migrations for production environments

**Email Not Sending:**
- Verify RESEND_API_KEY is valid
- Check Resend dashboard for API limits and status
- Ensure EMAIL_FROM is verified in Resend

## License

UNLICENSED
