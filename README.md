# Mahalaxmi Steels E-Commerce Platform

Full-stack e-commerce application for a steel and home appliance business. The project includes a public storefront, a protected admin panel, order processing, email workflows, and real-time order notifications.

## Overview

This system is built for two main user groups:

- Customers: browse products, add items to cart, checkout, and track order status.
- Admins: manage products, categories, offers, orders, and receive instant notifications for new orders.

The platform is split into:

- Backend API (`backend/`) using Node.js, Express, MongoDB, Socket.IO, and Nodemailer.
- Frontend app (`frontend/`) using React, Vite, Tailwind CSS, and Socket.IO client.

## Key Features

- Authentication
	- Email/password authentication with JWT.
	- Email verification workflow.
	- Google Sign-In support.
- Admin panel
	- Protected admin routes.
	- Product, category, and offer CRUD.
	- Order management with payment and delivery updates.
- Order system
	- Guest and authenticated order creation.
	- Delivery radius validation.
	- COD and UPI support.
- Email notifications
	- Verification and welcome emails.
	- Order confirmation and delivery updates.
	- Contact form notifications and auto-replies.
- Real-time updates
	- Socket.IO event for new orders.
	- Live refresh and notification sound in admin views.

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- Socket.IO
- Nodemailer (SMTP)
- Cloudinary + Multer (image uploads)

### Frontend

- React
- React Router
- Vite
- Tailwind CSS
- Socket.IO client
- QR code rendering for UPI payment flow

## Repository Structure

```text
.
|-- backend/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- utils/
|   |-- server.js
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- admin/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   `-- utils/
|   |-- public/
|   `-- package.json
|-- docs/
`-- README.md
```

## Installation

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB database (local or Atlas)
- SMTP credentials (for email workflows)
- Cloudinary account (for image uploads)

### 1. Clone and install dependencies

```bash
git clone <your-repository-url>
cd Mahalaxmi-steels-project

cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment variables

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>

JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRE=30d

CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

ADMIN_EMAIL=admin@example.com

SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
EMAIL_FROM=Mahalaxmi Steels <noreply@example.com>

GOOGLE_CLIENT_ID=your_google_client_id

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_SHOP_UPI_ID=your-upi-id@bank
```

## Run Locally

Start backend:

```bash
cd backend
npm run dev
```

Start frontend:

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

## API and Internal Documentation

Detailed docs are available in the `docs/` folder:

- `docs/PROJECT_ARCHITECTURE.md`
- `docs/API_DOCUMENTATION.md`
- `docs/EMAIL_SYSTEM.md`
- `docs/ADMIN_PANEL.md`
- `docs/REALTIME_NOTIFICATIONS.md`
- `docs/DEPLOYMENT_GUIDE.md`
- `docs/TROUBLESHOOTING.md`

## Deployment Notes

- Frontend can be deployed to Vercel (SPA rewrite already configured in `frontend/vercel.json`).
- Backend can be deployed to Render as a Node Web Service.
- Update CORS and frontend URLs:
	- `CLIENT_URL`
	- `FRONTEND_URL`
- Ensure all production environment variables are set before deployment.
- Use a managed MongoDB cluster for production reliability.

## Screenshots

Add screenshots to a folder such as `docs/screenshots/` and update links below.

- Storefront Home: `docs/screenshots/home.png`
- Product Listing: `docs/screenshots/products.png`
- Checkout: `docs/screenshots/checkout.png`
- Admin Dashboard: `docs/screenshots/admin-dashboard.png`
- Admin Orders: `docs/screenshots/admin-orders.png`

## Author

- Mahalaxmi Steels development team

## License

This project currently has no explicit license file. Add a `LICENSE` file (for example MIT) if you want to define usage terms.
