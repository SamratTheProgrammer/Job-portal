# HireNova Job Portal - Backend API

Robust RESTful API built with **Node.js**, **Express**, **MongoDB Atlas**, **Mongoose**, and **JWT**.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables (`backend/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
NODE_ENV=development
```

### 3. Seed Database
Seeds demo jobs, categories, demo candidate, and demo employer accounts:
```bash
npm run seed
```

### 4. Start Server
```bash
npm start
# or with file watching:
npm run dev
```

---

## 🔑 Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Candidate** | `alex@hirenova.com` | `password123` |
| **Employer** | `employer@hirenova.com` | `password123` |

---

## 📡 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create candidate or employer account
- `POST /api/auth/login` - Authenticate with email & password
- `GET /api/auth/me` - Get current authenticated user profile (`Bearer <token>`)

### Jobs (`/api/jobs`)
- `GET /api/jobs` - List jobs with keyword search, location, job type, experience, salary filters, and pagination
- `GET /api/jobs/featured` - Get top featured jobs for homepage
- `GET /api/jobs/categories` - Get job categories with real open-position counts
- `GET /api/jobs/:id` - Get single job details (with application/save flags if authenticated)
- `POST /api/jobs` - Post a new job (Protected)
- `PUT /api/jobs/:id` - Update job (Protected, creator/admin)
- `DELETE /api/jobs/:id` - Delete job and associated applications (Protected)

### Applications (`/api/applications`)
- `POST /api/applications/:jobId` - Submit application for a job (Protected)
- `GET /api/applications/my` - Get all applications submitted by candidate (Protected)
- `GET /api/applications/job/:jobId` - View applicants for a posted job (Protected, Employer)
- `PATCH /api/applications/:id/status` - Update application review status (Protected, Employer)

### Users & Settings (`/api/users`)
- `PUT /api/users/profile` - Update user name, title, bio, phone, location, skills, resume
- `PUT /api/users/settings` - Change password & update notification toggles
- `POST /api/users/save-job/:jobId` - Toggle bookmark / save job
- `GET /api/users/saved-jobs` - Get all saved jobs for current user
- `GET /api/users/dashboard-stats` - Get user dashboard statistics
