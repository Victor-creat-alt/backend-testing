# Vetty Backend API Documentation

## Introduction
This document provides the Swagger-style API documentation for the Vetty backend service. Vetty is an e-commerce application providing veterinary services and products to users. The backend is built with Python (Flask) and uses PostgreSQL as the database.

---

## Authentication Endpoints

### POST /signup
Register a new user (Admin or User).
- Request Body:
  - username (string, required)
  - email (string, required)
  - password (string, required)
  - role (string, optional, default: "User")
- Response:
  - 201 Created: User created, verification email sent.
  - 400 Bad Request: Username or email already exists.
  - 500 Internal Server Error: Email sending failure.

### POST /verify-email
Verify user email with a code.
- Request Body:
  - email (string, required)
  - code (string, required)
- Response:
  - 200 OK: Email verified.
  - 400 Bad Request: Invalid verification code.
  - 404 Not Found: User not found.

### POST /login
User login to receive JWT tokens.
- Request Body:
  - email (string, required)
  - password (string, required)
- Response:
  - 200 OK: Returns access_token and refresh_token.
  - 401 Unauthorized: Invalid credentials.
  - 403 Forbidden: Email not verified.

### GET /auto-login
Get user info from JWT token.
- Headers: Authorization: Bearer <access_token>
- Response:
  - 200 OK: Returns user identity.

### POST /logout
Logout (client-side token removal).
- Headers: Authorization: Bearer <access_token>
- Response:
  - 200 OK: Logout message.

---

## Admin Endpoints

### GET /admin/users
Get all users (Admin only).

### GET /admin/orders
Get all orders (Admin only).

### PUT /admin/products/<product_id>/stock
Update product stock quantity (Admin only).
- Request Body:
  - stock_quantity (integer, required)

### PUT /admin/products/<product_id>
Update product details (Admin only).
- Request Body: Any of the product fields (name, description, price, discount, category, stock_quantity, image_url).

### PUT /admin/service_requests/<request_id>/approve
Approve a service request (Admin only).

### PUT /admin/service_requests/<request_id>/disapprove
Disapprove a service request (Admin only).

### PUT /admin/orders/<order_id>/approve
Approve a product order (Admin only).

### PUT /admin/orders/<order_id>/disapprove
Disapprove a product order (Admin only).

### GET /admin/stats/revenue
Get revenue statistics (Admin only).

---

## Product Endpoints

### GET /products
List all products.

### GET /products/<product_id>
Get product details.

### POST /products
Create a new product (Admin only).
- Request Body:
  - name (string, required)
  - price (float, required)
  - category (string, required)
  - stock_quantity (integer, required)
  - image_url (string, required)
  - description (string, optional)
  - discount (float, optional)

### PUT /products/<product_id>
Update product (Admin only).

### DELETE /products/<product_id>
Delete product (Admin only).

### GET /products/search?query=<search_term>
Search products by name or category.

---

## Service Endpoints

### GET /services
List all services.

### GET /services/<service_id>
Get service details.

### POST /services
Create a new service (Admin only).
- Request Body:
  - name (string, required)
  - description (string, required)
  - price (float, required)
  - duration (string, required)
  - image_url (string, required)

### PUT /services/<service_id>
Update service (Admin only).

### DELETE /services/<service_id>
Delete service (Admin only).

### GET /services/search?query=<search_term>
Search services by name or description.

---

## Order Endpoints

### GET /orders
Get all orders for the authenticated user.

### POST /orders
Create a new order.
- Request Body:
  - items (array of order items)
  - total_price (float, optional)

### GET /orders/<order_id>
Get a specific order (user must own).

### PUT /orders/<order_id>
Update an order (user must own).

### DELETE /orders/<order_id>
Delete an order (user must own).

### GET /orders/<order_id>/items
Get all items for a specific order (user must own).

### PUT /orders/<order_id>/status
Update order status (Admin only).
- Request Body:
  - status (string, required)

---

## Cart Endpoints

### GET /cart
Get the current user's cart.

### POST /cart
Create a cart for the current user if none exists.

### DELETE /cart
Delete the current user's cart.

### GET /cart/total
Calculate total price of items in the current user's cart.

---

## Error Handling and Authentication Notes
- Most endpoints require JWT authentication except public GET endpoints.
- Admin-only endpoints require the user role to be "Admin".
- Error responses use appropriate HTTP status codes and JSON error messages.

---

## Feedback on Strict Condition Fulfillment

**Does the backend strictly meet the conditions described in the project?**

**Answer: YES**

The backend implements all required user stories for Admin and User roles, including authentication, product and service management, order and cart handling, and admin approvals. The technical stack matches the requirements (Python Flask backend, PostgreSQL database). The API endpoints cover all specified functionalities.
