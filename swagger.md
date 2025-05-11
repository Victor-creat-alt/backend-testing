# Backend API Documentation (Swagger Style)

## Introduction
This document provides an overview of the backend API routes, data models, schemas, and how to use these routes in the frontend components.

---

## Backend Routes

### User Routes (`/users`)
| Method | Endpoint                  | Description                              | Auth Required | Role Required |
|--------|---------------------------|--------------------------------------|---------------|---------------|
| GET    | `/users/<user_id>`         | Get user by ID                        | Yes           | User/Admin    |
| PUT    | `/users/<user_id>`         | Update user by ID                     | Yes           | User/Admin    |
| DELETE | `/users/<user_id>`         | Delete user by ID                    | Yes           | User/Admin    |
| GET    | `/users`                   | Get list of all users                 | No            | None          |
| POST   | `/users`                   | Create new user (sends verification email) | No        | None          |
| POST   | `/users/verify-otp`        | Verify OTP for email verification     | No            | None          |
| POST   | `/users/login`             | User login, returns JWT tokens        | No            | None          |
| POST   | `/users/password-reset-request` | Request password reset email      | No            | None          |
| POST   | `/users/password-reset-confirm` | Confirm password reset            | No            | None          |
| GET    | `/users/verify-email`      | Verify email using token query param  | No            | None          |

### Product Routes (`/products`)
| Method | Endpoint                  | Description                              | Auth Required | Role Required |
|--------|---------------------------|--------------------------------------|---------------|---------------|
| GET    | `/products`                | Get all products                      | No            | None          |
| GET    | `/products/<product_id>`   | Get product by ID                    | No            | None          |
| POST   | `/products`                | Create new product                   | Yes           | Admin         |
| PUT/PATCH | `/products/<product_id>` | Update product by ID                 | Yes           | Admin         |
| DELETE | `/products/<product_id>`   | Delete product by ID                 | Yes           | Admin         |
| GET    | `/products/search`         | Search products by name or category | No            | None          |

### Service Routes (`/services`)
| Method | Endpoint                  | Description                              | Auth Required | Role Required |
|--------|---------------------------|--------------------------------------|---------------|---------------|
| GET    | `/services`                | Get all services                     | No            | None          |
| GET    | `/services/<service_id>`   | Get service by ID                   | No            | None          |
| POST   | `/services`                | Create new service                  | Yes           | Authenticated |
| PUT/PATCH | `/services/<service_id>` | Update service by ID                | Yes           | Authenticated |
| DELETE | `/services/<service_id>`   | Delete service by ID                | Yes           | Authenticated |
| GET    | `/services/search`         | Search services                    | No            | None          |

### Admin Routes (`/admin`)
| Method | Endpoint                  | Description                              | Auth Required | Role Required |
|--------|---------------------------|--------------------------------------|---------------|---------------|
| GET    | `/admin/users`             | Get all users                       | Yes           | Admin         |
| GET    | `/admin/orders`            | Get all orders                     | Yes           | Admin         |
| PUT    | `/admin/products/<product_id>/stock` | Update product stock         | Yes           | Admin         |
| PUT    | `/admin/products/<product_id>` | Update product                  | Yes           | Admin         |
| GET    | `/admin/stats/revenue`     | Get revenue stats                  | Yes           | Admin         |
| PUT    | `/admin/service_requests/<request_id>/approve` | Approve service request | Yes           | Admin         |
| PUT    | `/admin/service_requests/<request_id>/disapprove` | Disapprove service request | Yes           | Admin         |
| PUT    | `/admin/orders/<order_id>/approve` | Approve order                 | Yes           | Admin         |
| PUT    | `/admin/orders/<order_id>/disapprove` | Disapprove order             | Yes           | Admin         |

---

## Models and Schemas

### User Model (`app/models/User.py`)
- `id`: Integer, primary key
- `username`: String(50), unique, required
- `email`: String(120), unique, required
- `password`: String, required (hashed)
- `role`: String(20), default "User" ("Admin" or "User")
- `is_verified`: Boolean, default False
- `verification_code`: String(6), default "000000"
- `two_fa_secret`: String(32), default generated
- `is_2fa_enabled`: Boolean, default False
- `created_at`: DateTime, default current time
- Relationships: orders, cart, service_requests

### User Schema (`app/schemas/User_schema.py`)
- `id`: dump_only
- `username`: required, length 3-50, unique
- `email`: required, valid email, unique
- `password`: required, load_only, min length 6
- `role`: optional, one of ["Admin", "User"]
- `created_at`: dump_only
- Custom validation for uniqueness on username and email

---

## Frontend Usage Examples

### Fetching Products (No Auth Required)
```js
const fetchProducts = async () => {
  const response = await fetch('/products');
  if (!response.ok) throw new Error('Failed to fetch products');
  const data = await response.json();
  // Use data in component state
};
```

### Creating a Product (Admin Auth Required)
```js
const createProduct = async (productData) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch('/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
  if (!response.ok) throw new Error('Failed to create product');
  const data = await response.json();
  return data;
};
```

### Fetching User Info (Auth Required)
```js
const fetchUser = async (userId) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch user');
  const data = await response.json();
  return data;
};
```

---

This documentation covers the main backend routes, models, and how to use them in the frontend components. For more details, refer to the source code in the `app/routes`, `app/models`, and `app/schemas` directories.
