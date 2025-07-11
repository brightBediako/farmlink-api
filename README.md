# 🌾 FarmLink API

## Overview

FarmLink is a comprehensive full-service eCommerce platform designed specifically for the agricultural marketplace. It serves as a bridge between farmers (vendors) and consumers, enabling farmers to register, showcase their farm products, and receive orders directly from consumers.

The platform features a robust user management system with distinct roles for buyers, farmers, and administrators. Farmers can create detailed profiles, upload product images, set pricing, and manage their inventory. Consumers can browse products, place orders, and make secure payments through integrated payment gateways.

---

## 📌 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the App](#-running-the-app)
- [API Documentation](#api-documentation)
- [User Roles & Permissions](#user-roles--permissions)
- [Email Functionality](#-email-functionality)
- [Payment Integration](#-payment-integration)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)
- [Contributors](#-contributors)

---

## 🚀 Features

### 👥 User Management

- ✅ User Registration & Login (JWT-based authentication)
- 🔐 Role-based access control (buyer, farmer, admin)
- 📧 Email verification system
- 🔄 Password reset functionality
- 🚫 User blocking/unblocking (admin)
- 📍 Shipping address management

### 🛒 Product Management

- 📦 Full CRUD Operations on Products
- 🖼️ Image uploads via Cloudinary
- 🏷️ Category management
- 🎨 Color and size management
- ⭐ Product reviews and ratings
- 📊 Inventory tracking

### 💳 Payment & Orders

- 💳 Stripe Payment Integration
- 📋 Order management with status tracking
- 🎫 Coupon and discount system
- 📈 Sales statistics and analytics
- 📧 Order notifications

### 🏪 Vendor System

- 👨‍🌾 Vendor profile management
- ✅ Admin approval workflow
- 🏷️ Farm information and details
- 💰 Payment information management

### 🔒 Security & Middleware

- 🔐 Protected Routes for authenticated users
- 🛡️ JWT token-based authentication
- 🔒 Password hashing with bcrypt
- 🌐 CORS protection
- ⚠️ Comprehensive error handling

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Cryptography**: crypto (for token generation)
- **Email Service**: Nodemailer
- **Payment Gateway**: Stripe
- **File Storage**: Cloudinary
- **File Upload**: Multer
- **Security**: CORS
- **Environment Variables**: dotenv
- **Development**: Nodemon

---

## 📁 Project Structure

```
farmlink-api/
├── app/
│   └── app.js                 # Express app configuration
├── config/
│   ├── categoryUpload.js      # Category image upload config
│   ├── dbConnect.js          # MongoDB connection
│   ├── fileUpload.js         # Product image upload config
│   └── vendorUpload.js       # Vendor image upload config
├── controllers/
│   ├── categoriesController.js
│   ├── colorsController.js
│   ├── couponsController.js
│   ├── ordersController.js
│   ├── productsController.js
│   ├── reviewsController.js
│   ├── usersController.js
│   └── vendorsController.js
├── middleware/
│   ├── globalErrHandler.js    # Global error handler
│   ├── isAccountVerified.js   # Email verification check
│   ├── isAdmin.js            # Admin role check
│   ├── isBlocked.js          # Blocked user check
│   └── isLoggedIn.js         # Authentication middleware
├── models/
│   ├── Category.js
│   ├── Color.js
│   ├── Coupon.js
│   ├── Notification.js
│   ├── Order.js
│   ├── Product.js
│   ├── Review.js
│   ├── User.js
│   └── Vendor.js
├── routes/
│   ├── categoriesRoute.js
│   ├── colorsRoute.js
│   ├── couponsRoute.js
│   ├── ordersRoute.js
│   ├── paymentsRoute.js
│   ├── productsRoute.js
│   ├── reviewsRoute.js
│   ├── usersRoute.js
│   └── vendorsRoute.js
├── services/
│   └── emailNotification.js   # Email notification service
├── utils/
│   ├── generateToken.js       # JWT token generation
│   ├── getTokenFromHeader.js  # Extract JWT from headers
│   └── verifyToken.js         # JWT token verification
├── public/
│   ├── index.html            # API documentation
│   └── farmlink.html         # Project overview
├── server.js                 # Server entry point
├── package.json
└── README.md
```

---

## ⚙️ Installation

```bash
# Clone the repository
git clone https://github.com/brightBediako/farmlink-api.git

# Navigate to project directory
cd farmlink-api

# Install dependencies
npm install
```

---

## 🧾 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# Email Configuration
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe (Payment)
STRIPE_KEY=your_stripe_secret_key
```

---

## ▶️ Running the App

```bash
# Development mode (with nodemon)
npm run server

# Production mode
npm start
# or
node server.js
```

The server will start on `http://localhost:8000` (or the port specified in your environment).

---

## API Documentation

The API is documented using Postman and the public HTML documentation in `public/index.html`.

### Base URL

```
http://localhost:8000/api/v1
```

### Authentication

> All protected routes require the header:  
> `Authorization: Bearer <token>`

### Main Endpoints

Development: [http://localhost:8000/api/v1/](http://localhost:8000/api/v1/)
Production: [https://farmlink-api.onrender.com/api/v1/](https://farmlink-api.onrender.com/api/v1/)

#### 👥 Users

| Method | Endpoint                                   | Description                   | Access  |
| ------ | ------------------------------------------ | ----------------------------- | ------- |
| POST   | `/users/register`                          | Register a new user           | Public  |
| POST   | `/users/login`                             | User login                    | Public  |
| GET    | `/users/profile`                           | Get user profile              | Private |
| PUT    | `/users/profile/:id`                       | Update user profile           | Private |
| PUT    | `/users/update/shipping`                   | Update shipping address       | Private |
| GET    | `/users`                                   | Get all users                 | Admin   |
| DELETE | `/users/profile/:id`                       | Delete user                   | Private |
| PUT    | `/users/block/:userId`                     | Block user                    | Admin   |
| PUT    | `/users/unblock/:userId`                   | Unblock user                  | Admin   |
| POST   | `/users/verify-email`                      | Send email verification token | Private |
| POST   | `/users/verify-email/:verifyToken`         | Verify email account          | Public  |
| POST   | `/users/forgot-password`                   | Send password reset token     | Public  |
| POST   | `/users/verify-password-reset/:resetToken` | Reset password                | Public  |

#### 🛒 Products

| Method | Endpoint                | Description                      | Access  |
| ------ | ----------------------- | -------------------------------- | ------- |
| GET    | `/products`             | List all products (with filters) | Public  |
| POST   | `/products`             | Create a product (with images)   | Private |
| GET    | `/products/:id`         | Get product detail               | Public  |
| PUT    | `/products/:id`         | Update a product                 | Private |
| DELETE | `/products/:id`         | Delete a product                 | Private |
| GET    | `/products/my-products` | Get vendor's products            | Private |

#### 🏷️ Categories

| Method | Endpoint          | Description                    | Access |
| ------ | ----------------- | ------------------------------ | ------ |
| GET    | `/categories`     | List all categories            | Public |
| POST   | `/categories`     | Create a category (with image) | Admin  |
| GET    | `/categories/:id` | Get category detail            | Public |
| PUT    | `/categories/:id` | Update a category              | Admin  |
| DELETE | `/categories/:id` | Delete a category              | Admin  |

#### 👨‍🌾 Vendors

| Method | Endpoint              | Description                  | Access  |
| ------ | --------------------- | ---------------------------- | ------- |
| POST   | `/vendors/become`     | Become a vendor (with image) | Private |
| GET    | `/vendors`            | List all vendors             | Public  |
| GET    | `/vendors/:id`        | Get vendor detail            | Public  |
| PUT    | `/vendors/:id`        | Update vendor profile        | Private |
| DELETE | `/vendors/:id`        | Delete vendor profile        | Admin   |
| PUT    | `/vendors/status/:id` | Update vendor status         | Admin   |

#### 📋 Orders

| Method | Endpoint             | Description                   | Access  |
| ------ | -------------------- | ----------------------------- | ------- |
| GET    | `/orders`            | List all orders               | Admin   |
| POST   | `/orders`            | Create an order (with Stripe) | Private |
| GET    | `/orders/:id`        | Get order detail              | Private |
| PUT    | `/orders/update/:id` | Update order status           | Admin   |
| GET    | `/orders/sales/sum`  | Get order sales statistics    | Admin   |

#### 🎫 Coupons

| Method | Endpoint       | Description       | Access |
| ------ | -------------- | ----------------- | ------ |
| GET    | `/coupons`     | List all coupons  | Admin  |
| POST   | `/coupons`     | Create a coupon   | Admin  |
| GET    | `/coupons/:id` | Get coupon detail | Admin  |
| PUT    | `/coupons/:id` | Update a coupon   | Admin  |
| DELETE | `/coupons/:id` | Delete a coupon   | Admin  |

#### 🎨 Colors

| Method | Endpoint      | Description      | Access |
| ------ | ------------- | ---------------- | ------ |
| GET    | `/colors`     | List all colors  | Public |
| POST   | `/colors`     | Create a color   | Admin  |
| GET    | `/colors/:id` | Get color detail | Public |
| PUT    | `/colors/:id` | Update a color   | Admin  |
| DELETE | `/colors/:id` | Delete a color   | Admin  |

#### ⭐ Reviews

| Method | Endpoint              | Description                   | Access  |
| ------ | --------------------- | ----------------------------- | ------- |
| POST   | `/reviews/:productID` | Create a review for a product | Private |

---

## 👥 User Roles & Permissions

### 🛒 Buyer (Default Role)

- Register and login
- Browse products
- Place orders
- Write reviews
- Manage profile and shipping address

### 👨‍🌾 Farmer (Vendor)

- All buyer permissions
- Create vendor profile
- Upload and manage products (after approval)
- View order notifications
- Manage farm information

### 👨‍💼 Admin

- All permissions
- Manage users (block/unblock)
- Approve/suspend vendors
- Manage categories, colors, coupons
- View all orders and sales statistics
- Full system access

---

## 💌 Email Functionality

The platform uses **Nodemailer** for automated email notifications:

- **Registration**: Welcome email with account verification
- **Email Verification**: Token-based email verification
- **Password Reset**: Secure password reset via email
- **Order Notifications**: Order confirmations and status updates
- **Vendor Notifications**: Vendor approval and status updates
- **Product Notifications**: New product upload confirmations

---

## 💳 Payment Integration

### Stripe Integration

- Secure payment processing
- Webhook support for real-time updates
- Multiple payment methods
- Order status tracking
- Payment confirmation emails

### Order Flow

1. User creates order with products
2. Stripe payment session created
3. User completes payment
4. Order status updated
5. Notifications sent to customer and vendors

---

## 🧪 Testing

```bash
# Run tests (if available)
npm test

# Run with coverage
npm run test:coverage
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add appropriate error handling
- Include JSDoc comments for new functions
- Test your changes thoroughly
- Update documentation if needed

---

## 📄 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

## 👥 Contributors

- [Bright Bediako](mailto:bright.bediako.dev@gmail.com)
- [Oluwatobi Adelabu](mailto:adelabutobi@gmail.com)

---

## 🔗 Quick Links

- [Project Overview](https://farmlink-api.onrender.com/farmlink.html)
- [API Documentation](https://farmlink-api.onrender.com/index.html)

---

Built with ❤️ for the agricultural community
