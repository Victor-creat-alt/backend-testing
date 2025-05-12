# API Documentation

This document outlines the available API endpoints for the application.

## Base URL

The base URL for these endpoints will be your deployed application's URL (e.g., `http://localhost:5000` for local development, or `https://your-app.onrender.com` for production).

## Authentication

Many endpoints require JWT (JSON Web Token) authentication. This means an `Authorization` header with a Bearer token must be included in the request:
`Authorization: Bearer <your_jwt_access_token>`

Endpoints marked with `Admin role required` need a JWT token where the user's role is "Admin".

---

## Admin Routes (`admin_bp`)

Base prefix: `/` (as registered in `app/__init__.py`, though routes themselves contain `/admin/`)

All endpoints in this section require **Admin role authentication**.

*   **GET `/admin/users`**
    *   Description: Get all users in the system.
    *   Authentication: Admin role required.
    *   Response: JSON array of user objects.
      ```json
      [
        {
          "id": 1,
          "username": "admin_user",
          "email": "admin@example.com",
          "role": "Admin",
          "created_at": "timestamp"
        }
      ]
      ```

*   **GET `/admin/orders`**
    *   Description: Get all orders in the system.
    *   Authentication: Admin role required.
    *   Response: JSON array of order objects.
      ```json
      [
        {
          "id": 1,
          "user_id": 1,
          "total_price": 100.50,
          "status": "pending",
          "created_at": "timestamp"
        }
      ]
      ```

*   **PUT `/admin/products/<int:product_id>/stock`**
    *   Description: Update the stock quantity of a product.
    *   Authentication: Admin role required.
    *   Path Parameters: `product_id` (integer)
    *   Request Body (JSON):
      ```json
      {
        "stock_quantity": 50
      }
      ```
    *   Response: JSON object with success message and updated stock.

*   **PUT `/admin/products/<int:product_id>`**
    *   Description: Update the details of a specific product.
    *   Authentication: Admin role required.
    *   Path Parameters: `product_id` (integer)
    *   Request Body (JSON): (Provide any fields to update)
      ```json
      {
        "name": "New Product Name",
        "description": "Updated description",
        "price": 19.99,
        "discount": 0.1,
        "category": "New Category",
        "stock_quantity": 100,
        "image_url": "http://example.com/new_image.jpg"
      }
      ```
    *   Response: JSON object with success message and updated product details.

*   **GET `/admin/stats/revenue`**
    *   Description: Get revenue statistics.
    *   Authentication: Admin role required.
    *   Response: JSON object with total revenue and total orders.
      ```json
      {
        "total_revenue": 12345.67,
        "total_orders": 500
      }
      ```

*   **PUT `/admin/service_requests/<int:request_id>/approve`**
    *   Description: Approve a service request.
    *   Authentication: Admin role required.
    *   Path Parameters: `request_id` (integer)
    *   Response: JSON object with success message.

*   **PUT `/admin/service_requests/<int:request_id>/disapprove`**
    *   Description: Disapprove a service request.
    *   Authentication: Admin role required.
    *   Path Parameters: `request_id` (integer)
    *   Response: JSON object with success message.

*   **PUT `/admin/orders/<int:order_id>/approve`**
    *   Description: Approve a product order.
    *   Authentication: Admin role required.
    *   Path Parameters: `order_id` (integer)
    *   Response: JSON object with success message.

*   **PUT `/admin/orders/<int:order_id>/disapprove`**
    *   Description: Disapprove a product order.
    *   Authentication: Admin role required.
    *   Path Parameters: `order_id` (integer)
    *   Response: JSON object with success message.

*   **GET `/admin/service_requests`**
    *   Description: Get all service requests in the system.
    *   Authentication: Admin role required.
    *   Response: JSON array of service request objects.
      ```json
      [
        {
          "id": 1,
          "user_id": 1,
          "service_id": 1,
          "status": "pending",
          "appointment_time": "timestamp",
          "created_at": "timestamp"
        }
      ]
      ```

*   **GET `/admin/orders/<int:order_id>/items`**
    *   Description: Get all order items for a specific order.
    *   Authentication: Admin role required.
    *   Path Parameters: `order_id` (integer)
    *   Response: JSON array of order item objects (based on `OrderItemSchema`).

*   **POST `/admin/orders/<int:order_id>/items`**
    *   Description: Create a new order item for a specific order.
    *   Authentication: Admin role required.
    *   Path Parameters: `order_id` (integer)
    *   Request Body (JSON): (Based on `OrderItemSchema`, `order_id` is set automatically)
      ```json
      {
        "product_id": 1,
        "quantity": 2,
        "unit_price": 25.00
      }
      ```
    *   Response: JSON object of the created order item.

*   **PUT `/admin/orders/<int:order_id>/items/<int:item_id>`**
    *   Description: Update an existing order item.
    *   Authentication: Admin role required.
    *   Path Parameters: `order_id` (integer), `item_id` (integer)
    *   Request Body (JSON): (Fields to update from `OrderItemSchema`)
      ```json
      {
        "quantity": 3
      }
      ```
    *   Response: JSON object of the updated order item.

*   **DELETE `/admin/orders/<int:order_id>/items/<int:item_id>`**
    *   Description: Delete an order item.
    *   Authentication: Admin role required.
    *   Path Parameters: `order_id` (integer), `item_id` (integer)
    *   Response: JSON object with success message.

---

## Authentication Routes (`auth_bp`)

Base prefix: `/auth`

*   **POST `/auth/signup`**
    *   Description: Register a new user.
    *   Authentication: None.
    *   Request Body (JSON):
      ```json
      {
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "password123",
        "role": "User" // Optional, defaults to "User"
      }
      ```
    *   Response: JSON message indicating success and that a verification email has been sent.

*   **POST `/auth/verify-email`**
    *   Description: Verify user's email using a code sent via POST.
    *   Authentication: None.
    *   Request Body (JSON):
      ```json
      {
        "email": "user@example.com",
        "code": "123456"
      }
      ```
    *   Response: JSON message indicating verification status.

*   **GET `/auth/users/verify-email`**
    *   Description: Verify user's email using a code sent via GET query parameters.
    *   Authentication: None.
    *   Query Parameters: `email`, `token` (verification code)
    *   Example: `/auth/users/verify-email?email=user@example.com&token=123456`
    *   Response: JSON message indicating verification status.

*   **POST `/auth/login`**
    *   Description: Log in an existing user.
    *   Authentication: None.
    *   Request Body (JSON):
      ```json
      {
        "email": "user@example.com",
        "password": "password123"
      }
      ```
    *   Response: JSON object with `access_token`, `refresh_token`, user details, and redirect path.
      ```json
      {
        "access_token": "...",
        "refresh_token": "...",
        "user": {
          "id": 1,
          "email": "user@example.com",
          "role": "User",
          "userType": "User"
        },
        "redirect": "/home"
      }
      ```

*   **GET `/auth/auto-login`**
    *   Description: Allows auto-login if a valid JWT is present.
    *   Authentication: JWT Required.
    *   Response: JSON object with user identity.

*   **POST `/auth/logout`**
    *   Description: Placeholder for logout; actual logout is client-side by removing the token.
    *   Authentication: JWT Required.
    *   Response: JSON message.

---

## Cart Routes (`cart_bp`)

Base prefix: `/cart`

All endpoints in this section require **JWT Authentication**.

*   **GET `/cart`** (Maps to `CartResource` and `CartListResource` GET)
    *   Description: Get the current authenticated user's cart. If `CartListResource` is hit, it might return all carts (consider admin-only for that). The `CartResource` GET is more specific for the user's cart.
    *   Authentication: JWT Required.
    *   Response: JSON object of the cart (based on `CartSchema`).

*   **POST `/cart`** (Maps to `CartListResource` POST)
    *   Description: Create a cart for the current user if one doesn't exist, or return existing cart.
    *   Authentication: JWT Required.
    *   Response: JSON object of the cart.

*   **DELETE `/cart`** (Maps to `CartResource` DELETE)
    *   Description: Delete the current authenticated user's cart.
    *   Authentication: JWT Required.
    *   Response: Empty, 204 No Content.

*   **GET `/cart/total`**
    *   Description: Calculate the total price of items in the authenticated user's cart.
    *   Authentication: JWT Required.
    *   Response: JSON object with `cart_id` and `total_price`.

---

## Cart Item Routes (`cart_item_bp`)

Base prefix: `/cart/items`

All endpoints in this section require **JWT Authentication**.

*   **POST `/cart/items`**
    *   Description: Add an item to the authenticated user's cart. Creates a cart if one doesn't exist.
    *   Authentication: JWT Required.
    *   Request Body (JSON):
      ```json
      {
        "product_id": 1, // or "service_id"
        // "service_id": 1,
        "quantity": 1
      }
      ```
    *   Response: JSON object of the created cart item (based on `CartItemSchema`).

*   **GET `/cart/items/<int:item_id>`**
    *   Description: Get a specific cart item by its ID. User must own the cart.
    *   Authentication: JWT Required.
    *   Path Parameters: `item_id` (integer)
    *   Response: JSON object of the cart item.

*   **PUT `/cart/items/<int:item_id>`**
    *   Description: Update the quantity of a specific cart item. User must own the cart.
    *   Authentication: JWT Required.
    *   Path Parameters: `item_id` (integer)
    *   Request Body (JSON):
      ```json
      {
        "quantity": 2
      }
      ```
    *   Response: JSON object of the updated cart item.

*   **DELETE `/cart/items/<int:item_id>`**
    *   Description: Delete a specific cart item. User must own the cart.
    *   Authentication: JWT Required.
    *   Path Parameters: `item_id` (integer)
    *   Response: Empty, 204 No Content.

---

## Order Routes (`order_bp`)

Base prefix: `/orders`

All endpoints in this section require **JWT Authentication** unless specified.

*   **GET `/orders`**
    *   Description: Get all orders for the authenticated user.
    *   Authentication: JWT Required.
    *   Response: JSON array of order objects (based on `OrderSchema`).

*   **POST `/orders`**
    *   Description: Create a new order for the authenticated user.
    *   Authentication: JWT Required.
    *   Request Body (JSON):
      ```json
      {
        "total_price": 150.75, // Optional, will be calculated if items are provided
        "items": [
          { "product_id": 1, "quantity": 2, "unit_price": 50.00 },
          { "service_id": 1, "quantity": 1, "unit_price": 50.75 }
        ]
      }
      ```
    *   Response: JSON object of the created order.

*   **GET `/orders/<int:order_id>`**
    *   Description: Get a specific order by ID. User must own the order.
    *   Authentication: JWT Required.
    *   Path Parameters: `order_id` (integer)
    *   Response: JSON object of the order.

*   **PUT `/orders/<int:order_id>`**
    *   Description: Update an existing order. User must own the order. (Typically status updates by admin, see below)
    *   Authentication: JWT Required.
    *   Path Parameters: `order_id` (integer)
    *   Request Body (JSON): Fields to update from `OrderSchema`.
    *   Response: JSON object of the updated order.

*   **DELETE `/orders/<int:order_id>`**
    *   Description: Delete an order by ID. User must own the order.
    *   Authentication: JWT Required.
    *   Path Parameters: `order_id` (integer)
    *   Response: Empty, 204 No Content.

*   **GET `/orders/<int:order_id>/items`**
    *   Description: Get all items for a specific order. User must own the order.
    *   Authentication: JWT Required.
    *   Path Parameters: `order_id` (integer)
    *   Response: JSON array of order item objects (based on `OrderItemSchema`).

*   **PUT `/orders/<int:order_id>/status`**
    *   Description: Update the status of an order.
    *   Authentication: Admin role required.
    *   Path Parameters: `order_id` (integer)
    *   Request Body (JSON):
      ```json
      {
        "status": "shipped"
      }
      ```
    *   Response: JSON message indicating success.

---

## Payment Routes (`payment_bp`)

Base prefix: `/payments`

*   **POST `/payments/mpesa`**
    *   Description: Initiate an M-Pesa STK push payment.
    *   Authentication: Assumed to be JWT protected if user context is needed for `order_id` association, though not explicitly decorated in the provided code.
    *   Request Body (JSON):
      ```json
      {
        "phone_number": "2547xxxxxxxx",
        "amount": 100,
        "order_id": 1,
        "account_reference": "VETTY_ORDER_1", // Optional
        "transaction_desc": "Payment for order 1" // Optional
      }
      ```
    *   Response: JSON message indicating payment initiation and M-Pesa response.

*   **POST `/payments/mpesa/callback`**
    *   Description: Callback URL for M-Pesa to send payment status updates. This is typically called by the M-Pesa system, not directly by the frontend.
    *   Authentication: None (publicly accessible for M-Pesa).
    *   Request Body (JSON): M-Pesa callback payload.
    *   Response: JSON message.

---

## Product Routes (`product_bp`)

Base prefix: `/products` (as registered in `app/__init__.py`, though routes themselves start with `/products`)

*   **GET `/products`**
    *   Description: Get a list of all products.
    *   Authentication: None.
    *   Response: JSON array of product objects.
      ```json
      [
        {
          "id": 1,
          "name": "Product Name",
          "price": 29.99,
          "description": "Product description.",
          "category": "Electronics",
          "stock_quantity": 100,
          "image_url": "http://example.com/image.jpg",
          "created_at": "timestamp",
          "discount": 0.05
        }
      ]
      ```

*   **GET `/products/<int:product_id>`**
    *   Description: Get a specific product by ID.
    *   Authentication: None.
    *   Path Parameters: `product_id` (integer)
    *   Response: JSON object of the product.

*   **POST `/products`**
    *   Description: Create a new product.
    *   Authentication: Admin role required.
    *   Request Body (JSON):
      ```json
      {
        "name": "New Product",
        "price": 49.99,
        "description": "Description of new product.",
        "category": "Gadgets",
        "stock_quantity": 50,
        "image_url": "http://example.com/new_product.jpg",
        "discount": 0.0 // Optional
      }
      ```
    *   Response: JSON message indicating success and the ID of the new product.

*   **PUT/PATCH `/products/<int:product_id>`**
    *   Description: Update an existing product.
    *   Authentication: Admin role required.
    *   Path Parameters: `product_id` (integer)
    *   Request Body (JSON): Fields to update.
    *   Response: JSON message indicating success.

*   **DELETE `/products/<int:product_id>`**
    *   Description: Delete a product.
    *   Authentication: Admin role required.
    *   Path Parameters: `product_id` (integer)
    *   Response: JSON message indicating success.

*   **GET `/products/search`**
    *   Description: Search products by name or category.
    *   Authentication: None.
    *   Query Parameters: `query` (string)
    *   Example: `/products/search?query=laptop`
    *   Response: JSON array of matching product objects.

---

## Service Routes (`service_bp`)

Base prefix: `/services` (as registered in `app/__init__.py`, though routes themselves start with `/services`)

*   **GET `/services`**
    *   Description: Get a list of all services.
    *   Authentication: None.
    *   Response: JSON array of service objects (based on `ServiceSchema`).
      ```json
      [
        {
          "id": 1,
          "name": "Service Name",
          "description": "Service description.",
          "price": 75.00,
          "duration": "60 minutes", // Or however duration is formatted
          "image_url": "http://example.com/service_image.jpg"
        }
      ]
      ```

*   **GET `/services/<int:service_id>`**
    *   Description: Get a specific service by ID.
    *   Authentication: None.
    *   Path Parameters: `service_id` (integer)
    *   Response: JSON object of the service.

*   **POST `/services`**
    *   Description: Create a new service.
    *   Authentication: Admin role required.
    *   Request Body (JSON): (Based on `ServiceSchema`)
      ```json
      {
        "name": "New Service",
        "description": "Description of new service.",
        "price": 99.00,
        "duration": "90", // Assuming duration is stringified minutes or similar
        "image_url": "http://example.com/new_service.jpg"
      }
      ```
    *   Response: JSON message indicating success and the ID of the new service.

*   **PUT/PATCH `/services/<int:service_id>`**
    *   Description: Update an existing service.
    *   Authentication: Admin role required.
    *   Path Parameters: `service_id` (integer)
    *   Request Body (JSON): Fields to update from `ServiceSchema`.
    *   Response: JSON message indicating success.

*   **DELETE `/services/<int:service_id>`**
    *   Description: Delete a service.
    *   Authentication: Admin role required.
    *   Path Parameters: `service_id` (integer)
    *   Response: JSON message indicating success.

*   **GET `/services/search`**
    *   Description: Search services by name or description.
    *   Authentication: None.
    *   Query Parameters: `query` (string)
    *   Example: `/services/search?query=consultation`
    *   Response: JSON array of matching service objects.

---

## Service Request Routes (`service_request_bp`)

Base prefix: `/service_requests`

All endpoints in this section require **JWT Authentication**.

*   **GET `/service_requests`**
    *   Description: Get service requests. Admins see all; regular users see their own. Includes nested service data.
    *   Authentication: JWT Required.
    *   Response: JSON array of service request objects (based on `ServiceRequestSchema`, with service details).
      ```json
      [
        {
          "id": 1,
          "user_id": 1,
          "service_id": 1,
          "appointment_time": "YYYY-MM-DDTHH:MM:SS",
          "status": "pending",
          "service": { // Nested service details
            "id": 1,
            "name": "Consultation",
            // ... other service fields
          }
        }
      ]
      ```

*   **POST `/service_requests`**
    *   Description: Create a new service request for the authenticated user.
    *   Authentication: JWT Required.
    *   Request Body (JSON): (Based on `ServiceRequestSchema`)
      ```json
      {
        "service_id": 1,
        "appointment_time": "YYYY-MM-DDTHH:MM:SS", // ISO 8601 format
        "status": "pending" // Optional, defaults to "pending"
      }
      ```
    *   Response: JSON object of the created service request.

*   **GET `/service_requests/<int:id>`**
    *   Description: Get a specific service request by ID. User must own it or be an Admin.
    *   Authentication: JWT Required.
    *   Path Parameters: `id` (integer)
    *   Response: JSON object of the service request.

*   **PUT `/service_requests/<int:id>`**
    *   Description: Update a service request. User must own it or be an Admin.
    *   Authentication: JWT Required.
    *   Path Parameters: `id` (integer)
    *   Request Body (JSON): Fields to update from `ServiceRequestSchema`.
    *   Response: JSON object of the updated service request.

*   **DELETE `/service_requests/<int:id>`**
    *   Description: Delete a service request. User must own it or be an Admin.
    *   Authentication: JWT Required.
    *   Path Parameters: `id` (integer)
    *   Response: Empty, 204 No Content.

*   **PUT `/service_requests/<int:id>/status`**
    *   Description: Update the status of any service request.
    *   Authentication: Admin role required.
    *   Path Parameters: `id` (integer)
    *   Request Body (JSON):
      ```json
      {
        "status": "approved"
      }
      ```
    *   Response: JSON message indicating success.

---

## User Routes (`user_bp`)

Base prefix: `/users`

*   **GET `/users`** (Maps to `UserListResource` GET)
    *   Description: Get a list of all users. (Consider if this should be Admin only).
    *   Authentication: None (as per current code, but typically admin-only).
    *   Response: JSON array of user objects (based on `UserSchema`).

*   **POST `/users`** (Maps to `UserListResource` POST)
    *   Description: Create a new user. Sends a verification email with OTP.
    *   Authentication: None.
    *   Request Body (JSON): (Based on `UserSchema`)
      ```json
      {
        "username": "testuser", // or "name" which gets mapped to username
        "email": "test@example.com",
        "password": "securepassword123",
        "role": "User" // Optional
      }
      ```
    *   Response: JSON message: "User created. Verification email sent."

*   **GET `/users/<int:user_id>`**
    *   Description: Get a user by ID.
    *   Authentication: JWT Required. User can get their own profile; Admin can get any.
    *   Path Parameters: `user_id` (integer)
    *   Response: JSON object of the user.

*   **PUT `/users/<int:user_id>`**
    *   Description: Update a user by ID.
    *   Authentication: JWT Required. User can update their own profile; Admin can update any.
    *   Path Parameters: `user_id` (integer)
    *   Request Body (JSON): Fields to update from `UserSchema`.
    *   Response: JSON object of the updated user.

*   **DELETE `/users/<int:user_id>`**
    *   Description: Delete a user by ID.
    *   Authentication: JWT Required. User can delete their own profile; Admin can delete any.
    *   Path Parameters: `user_id` (integer)
    *   Response: JSON message: "User deleted successfully."

*   **POST `/users/verify-otp`**
    *   Description: Verify OTP for email verification.
    *   Authentication: None.
    *   Request Body (JSON):
      ```json
      {
        "email": "user@example.com",
        "otp": "123456"
      }
      ```
    *   Response: JSON message indicating verification status.

*   **POST `/users/login`** (Maps to `UserLoginResource` POST)
    *   Description: User login.
    *   Authentication: None.
    *   Request Body (JSON):
      ```json
      {
        "email": "user@example.com",
        "password": "password123"
      }
      ```
    *   Response: JSON object with `access_token` and `refresh_token`.

*   **POST `/users/password-reset-request`**
    *   Description: Request a password reset. Sends an email with a reset token.
    *   Authentication: None.
    *   Request Body (JSON):
      ```json
      {
        "email": "user@example.com"
      }
      ```
    *   Response: JSON message: "Password reset email sent."

*   **POST `/users/password-reset-confirm`**
    *   Description: Confirm password reset using the token and new password.
    *   Authentication: None.
    *   Request Body (JSON):
      ```json
      {
        "token": "jwt_reset_token_here",
        "new_password": "newsecurepassword123"
      }
      ```
    *   Response: JSON message: "Password has been reset successfully."

*   **GET `/users/verify-email`** (Different from `/auth/users/verify-email`)
    *   Description: Verify email using a JWT-like token from a query parameter.
    *   Authentication: None.
    *   Query Parameters: `token`
    *   Example: `/users/verify-email?token=some_jwt_like_token`
    *   Response: JSON message indicating verification status.

---
