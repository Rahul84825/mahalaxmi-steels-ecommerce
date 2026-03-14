# API Documentation

## Introduction

This document describes the backend API for the Mahalaxmi Steels platform. It includes endpoint groups, authentication requirements, request/response patterns, and examples.

## Base Information

- Base URL (local): `http://localhost:5000`
- API prefix: `/api`
- Content type: `application/json` (except multipart upload endpoint)

## Authentication and Authorization

- Protected endpoints require `Authorization: Bearer <jwt-token>`
- Admin endpoints require both:
  - valid JWT token (`protect` middleware)
  - user role `admin` (`isAdmin` middleware)

### Common status codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Resource created |
| 400 | Validation or business rule failure |
| 401 | Missing/invalid token |
| 403 | Not admin |
| 404 | Resource not found |
| 500 | Server error |

---

## Health Route

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Service health check |

Example response:

```json
{
  "status": "OK",
  "message": "Mahalaxmi Steels API is running"
}
```

---

## Authentication Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register user and trigger verification email |
| POST | `/api/auth/login` | No | Login and return token |
| POST | `/api/auth/google` | No | Login/register with Google credential token |
| GET | `/api/auth/verify-email` | No | Verify email via query token |
| POST | `/api/auth/resend-verification` | No | Resend verification email |
| GET | `/api/auth/me` | Yes | Get current user profile |
| PUT | `/api/auth/profile` | Yes | Update current user profile |

### Example: Register

Request:

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "name": "Rahul Patil",
  "email": "rahul@example.com",
  "password": "StrongPass123",
  "phone": "9876543210"
}
```

Success response:

```json
{
  "message": "Registration successful! Please check your email to verify your account.",
  "email": "rahul@example.com"
}
```

### Example: Login

Request:

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "rahul@example.com",
  "password": "StrongPass123"
}
```

Success response:

```json
{
  "_id": "65f0...",
  "name": "Rahul Patil",
  "email": "rahul@example.com",
  "role": "user",
  "token": "<jwt-token>"
}
```

### Example: Verify Email

Request:

```http
GET /api/auth/verify-email?token=<raw-token>&email=rahul%40example.com
```

Response:

```json
{
  "message": "Email verified successfully! You can now log in.",
  "success": true
}
```

---

## Product Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | No | List products with filters, sorting, pagination |
| GET | `/api/products/:id` | No | Get one product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| PATCH | `/api/products/:id/stock` | Admin | Toggle stock availability |

### Supported query params on `GET /api/products`

| Param | Description |
|---|---|
| `category` | Category filter (`all` disables this filter) |
| `search` | Text search on name/description/category |
| `sortBy` | `default`, `newest`, `price-low`, `price-high`, `rating` |
| `inStockOnly` | `true` to only return in-stock products |
| `page` | Page number |
| `limit` | Items per page |

Example response:

```json
{
  "products": [
    {
      "_id": "65f1...",
      "name": "Steel Kadai",
      "category": "steel",
      "price": 799,
      "mrp": 999,
      "inStock": true
    }
  ],
  "total": 1,
  "page": 1,
  "pages": 1
}
```

---

## Category Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/categories` | No | List categories |
| POST | `/api/categories` | Admin | Create category |
| PUT | `/api/categories/:id` | Admin | Update category by category id |
| DELETE | `/api/categories/:id` | Admin | Delete category by category id |

Example create request:

```json
{
  "id": "steel",
  "label": "Steel",
  "icon": "S",
  "description": "Steel cookware and utensils"
}
```

---

## Offer Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/offers` | No | List offers |
| POST | `/api/offers` | Admin | Create offer |
| PUT | `/api/offers/:id` | Admin | Update offer |
| DELETE | `/api/offers/:id` | Admin | Delete offer |
| PATCH | `/api/offers/:id/toggle` | Admin | Toggle offer active state |

Example toggle response:

```json
{
  "active": false
}
```

---

## Order Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | No (guest allowed) | Create order, perform delivery check, trigger emails, emit socket event |
| GET | `/api/orders` | Admin | List all orders |
| GET | `/api/orders/my` | Yes | List current user orders |
| GET | `/api/orders/:id` | Admin | Get single order by id |
| PATCH | `/api/orders/:id/deliver` | Admin | Mark order delivered |
| PATCH | `/api/orders/:id/mark-paid` | Admin | Mark order payment as paid |
| PATCH | `/api/orders/:id/upi-txn` | Yes | Submit UPI transaction id for an order |

### Example: Create Order

Request:

```json
{
  "customer": {
    "name": "Rahul Patil",
    "phone": "9876543210",
    "email": "rahul@example.com"
  },
  "address": {
    "line1": "Akurdi Gaothan",
    "line2": "Near Datta Mandir",
    "city": "Pune",
    "pincode": "411035",
    "state": "Maharashtra",
    "country": "India"
  },
  "items": [
    {
      "productId": "65f1...",
      "name": "Steel Kadai",
      "image": "https://...",
      "category": "steel",
      "price": 799,
      "quantity": 1
    }
  ],
  "paymentMethod": "cod",
  "subtotal": 799,
  "delivery": 79,
  "total": 928,
  "itemCount": 1
}
```

Success response (sample):

```json
{
  "_id": "65f2...",
  "orderId": "MHL123456",
  "status": "pending",
  "paymentStatus": "pending",
  "customer": {
    "name": "Rahul Patil",
    "email": "rahul@example.com"
  },
  "total": 928,
  "createdAt": "2026-03-14T09:00:00.000Z"
}
```

### Example: Mark Delivered (admin)

Request:

```http
PATCH /api/orders/:id/deliver
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "message": "Order marked as delivered",
  "order": {
    "_id": "65f2...",
    "status": "delivered",
    "deliveredAt": "2026-03-14T11:10:00.000Z"
  }
}
```

### Example: Submit UPI transaction id

Request:

```json
{
  "upiTransactionId": "412345678901"
}
```

Response:

```json
{
  "message": "UPI transaction ID submitted",
  "order": {
    "_id": "65f2...",
    "paymentStatus": "paid",
    "upiTransactionId": "412345678901"
  }
}
```

---

## Contact Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/contact` | No | Send contact message to admin and auto-reply to sender |

Example request:

```json
{
  "name": "Priya",
  "email": "priya@example.com",
  "phone": "9898989898",
  "subject": "Bulk order inquiry",
  "message": "Please share rates for bulk stainless steel cookware."
}
```

Response:

```json
{
  "message": "Message sent successfully"
}
```

---

## Upload Routes (Admin)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/upload` | Admin | Upload product image to Cloudinary |
| DELETE | `/api/upload/:public_id` | Admin | Delete image from Cloudinary |

### Upload request format

- Content type: `multipart/form-data`
- Form field name: `image`
- Max file size: 5 MB
- Allowed mime types: jpg, jpeg, png, webp

Success response:

```json
{
  "url": "https://res.cloudinary.com/.../image/upload/...",
  "public_id": "mahalaxmi_steels/products/abc123"
}
```

---

## Admin Endpoint Summary

The following endpoints are admin-only:

- `GET /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/deliver`
- `PATCH /api/orders/:id/mark-paid`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `PATCH /api/products/:id/stock`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`
- `POST /api/offers`
- `PUT /api/offers/:id`
- `DELETE /api/offers/:id`
- `PATCH /api/offers/:id/toggle`
- `POST /api/upload`
- `DELETE /api/upload/:public_id`

---

## Error Response Format

Most errors follow this JSON shape:

```json
{
  "message": "Human readable error message",
  "stack": "stack trace in development, null in production"
}
```

In production mode (`NODE_ENV=production`), stack traces are hidden.
