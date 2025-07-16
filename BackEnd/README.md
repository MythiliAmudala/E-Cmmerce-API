**Simple E-Commerce API Project**

---

# 🛍️ Simple E-Commerce API

A basic Node.js + Express-based e-commerce API with role-based authentication and a simple HTML frontend.

---

## 📌 Features

* **Product Listings**: View all products (with optional search & pagination).
* **Cart Management**: Add, update, remove items in the cart.
* **Order Creation**: Place orders from the cart.
* **User Authentication**: JWT-based login system.
* **User Roles**:

  * **Customer**: Can view products, manage cart, and place orders.
  * **Admin**: Can manage (add, update, delete) products.
* **Optional Frontend**: Basic HTML interface for testing.
* **Bonus Features**:

  * Pagination support for product listing.
  * Search products by name or category.

---

## 🚀 Getting Started

### 1. Clone and Install

```
git clone <repo-url>
cd simple-ecommerce-api
npm install
```

### 2. Run Server

```
node server.js
```

Runs on: `http://localhost:3000`

---

## 🧑‍💻 API Endpoints

### ✅ Authentication

* **POST** `/login`

  * Request: `{ username, password }`
  * Response: `{ accessToken }`

### 📦 Products

* **GET** `/products`

  * Query Params:

    * `page` (default: 1)
    * `limit` (default: 10)
    * `name` (optional)
    * `category` (optional)
  * Response: `products`, `total`, `page`, `limit`

### 🛒 Cart (Customer Only)

* **POST** `/cart/add`

  * Body: `{ productId, quantity }`
* **PUT** `/cart/update`

  * Body: `{ productId, quantity }`
* **DELETE** `/cart/remove`

  * Body: `{ productId }`
* **GET** `/cart`

  * Returns: Cart items for the logged-in customer

### 🧾 Orders (Customer Only)

* **POST** `/order`

  * Creates order from cart

---

## 👮‍♂️ Roles & Permissions

| Role     | Action                       |
| -------- | ---------------------------- |
| Customer | View, add to cart, order     |
| Admin    | Add, update, delete products |

---

## 🖥️ Frontend (Optional)

* Basic HTML interface in `index.html`
* Functions:

  * Login
  * Load Products
  * Add to Cart
  * View Cart
  * Place Order

---

## 🔐 JWT Authentication

* Token is required for:

  * Cart & Order routes (Customer)
  * Product management routes (Admin)
* Add token in header:
  `Authorization: Bearer <token>`

---

## 👥 Demo Users

* **Customer**
  Username: `customer1`
  Password: `password1`

* **Admin**
  Username: `admin1`
  Password: `adminpass`

---


