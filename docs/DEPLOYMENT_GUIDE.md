# Deployment Guide

## Introduction

This guide explains how to deploy the Mahalaxmi Steels application, including environment setup, backend deployment, frontend deployment, and post-deployment checks.

## Deployment Topology

A common production setup:

- Backend API on Render (Node Web Service)
- Frontend on Vercel (static build)
- MongoDB Atlas for database
- Cloudinary for media storage
- SMTP provider (for example Brevo)

## Environment Variables

### Backend (required in production)

```env
PORT=5000
NODE_ENV=production

MONGO_URI=<mongodb-atlas-uri>

JWT_SECRET=<strong-random-secret>
JWT_EXPIRE=30d

CLIENT_URL=<frontend-public-url>
FRONTEND_URL=<frontend-public-url>

ADMIN_EMAIL=<admin-mailbox>

SMTP_HOST=<smtp-host>
SMTP_PORT=2525
SMTP_USER=<smtp-user>
SMTP_PASS=<smtp-pass>
EMAIL_FROM=Mahalaxmi Steels <noreply@yourdomain.com>

GOOGLE_CLIENT_ID=<google-web-client-id>

CLOUDINARY_CLOUD_NAME=<cloudinary-name>
CLOUDINARY_API_KEY=<cloudinary-key>
CLOUDINARY_API_SECRET=<cloudinary-secret>
```

### Frontend

```env
VITE_API_URL=<backend-public-url>
VITE_GOOGLE_CLIENT_ID=<google-web-client-id>
VITE_SHOP_UPI_ID=<upi-id>
```

## Backend Deployment (Render)

### 1. Create service

- Platform: Render
- Type: Web Service
- Runtime: Node
- Root directory: `backend`

### 2. Build and start commands

- Build command: `npm install`
- Start command: `npm start`

### 3. Configure environment variables

Add all backend variables listed above in Render dashboard.

### 4. Health verification

After deploy, open:

- `<backend-url>/api/health`

Expected:

```json
{
  "status": "OK",
  "message": "Mahalaxmi Steels API is running"
}
```

## Frontend Deployment (Vercel)

### 1. Import frontend project

- Root directory: `frontend`
- Framework preset: Vite

### 2. Build settings

- Build command: `npm run build`
- Output directory: `dist`

### 3. SPA routing

`frontend/vercel.json` already contains rewrite configuration:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### 4. Configure frontend env vars

Set at least `VITE_API_URL` to the deployed backend URL.

## CORS and URL Alignment

Ensure these values are aligned:

- Backend `CLIENT_URL` and `FRONTEND_URL` should match deployed frontend domain.
- Frontend `VITE_API_URL` should match deployed backend domain.

Misalignment here is the most common production issue.

## Deployment Checklist

- Database reachable from backend host
- SMTP credentials valid and not blocked
- Cloudinary credentials valid
- Google OAuth client allowed origins configured
- CORS URLs correct
- Admin login and order flow tested
- Socket notifications tested on admin screen

## Smoke Test Plan

Run this minimal post-deploy validation:

1. Open storefront and load products.
2. Register a test user and verify email link flow.
3. Place an order and confirm:
   - order record creation
   - customer email
   - admin email
   - admin real-time order update
4. In admin panel, mark order paid and delivered.
5. Confirm delivery email sent.

## Security Recommendations

- Use long random secrets and rotate periodically.
- Enable HTTPS only endpoints and secure cookies if introduced later.
- Avoid logging sensitive env variables.
- Restrict database IP/network access where possible.
