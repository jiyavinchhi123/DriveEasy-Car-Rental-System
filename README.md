# DriveEasy Car Rental System

**Course:** ITUE301 Open-Book Practical Examination  
**Institution:** CSPIT, CHARUSAT  
**Development Stage:** Stage 1 — Foundation & Starter Shell  
**Architecture:** Full-Stack MERN (Node.js, Express, MongoDB, React, Vite)

---

## 📌 Project Overview

**DriveEasy Car Rental System** is an end-to-end full-stack web application designed for seamless vehicle rentals. The system is engineered using a modular, decoupled architecture where:
- The **Backend (Express + Node.js)** exposes RESTful endpoints, handles MongoDB connections via Mongoose, enforces CORS, provides standardized error handling, and prepares JWT Bearer token authentication.
- The **Frontend (React + Vite)** provides a responsive, component-driven user interface with React Router DOM, state management via React Context (`useState`, `useEffect`, `useContext`), and an API client module.

This repository represents **Stage 1: Foundation and Starter Shell**, creating the structural, configuration, and security baseline for subsequent feature stages.

---

## 📁 Project Structure

```text
driveeasy/
├── client/                      # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/          # Reusable UI Components
│   │   │   ├── Navbar.jsx       # Top navigation header
│   │   │   ├── Footer.jsx       # University/Exam metadata footer
│   │   │   └── StatusCard.jsx   # Live backend & database health monitor
│   │   ├── pages/               # Routed Views
│   │   │   ├── HomePage.jsx     # Foundation dashboard & health verification
│   │   │   └── NotFoundPage.jsx # 404 Route handler
│   │   ├── context/             # State Management
│   │   │   └── AuthContext.jsx  # React Context (useState, useEffect, useContext)
│   │   ├── services/            # API Communication
│   │   │   └── api.js           # Fetch wrapper with configurable base URL
│   │   ├── routes/              # Routing Configuration
│   │   │   └── AppRoutes.jsx    # React Router DOM (Routes, Route)
│   │   ├── App.jsx              # Main Application Layout
│   │   ├── main.jsx             # React entry point with BrowserRouter & AuthProvider
│   │   └── index.css            # Global CSS design system (Vanilla CSS)
│   ├── .env.example             # Frontend environment variables template
│   ├── .env                     # Local frontend environment config
│   ├── index.html               # Vite HTML entry point with modern typography
│   ├── package.json             # Frontend dependencies and scripts
│   └── vite.config.js           # Vite build configuration (Port 5173)
│
├── server/                      # Backend REST API (Node.js + Express)
│   ├── config/
│   │   └── db.js                # Decoupled MongoDB connection logic
│   ├── controllers/
│   │   └── healthController.js  # Controller for health-check endpoint
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT Bearer token validation middleware
│   │   ├── errorHandler.js      # Centralized error handler (no leaked secrets)
│   │   └── notFoundHandler.js   # 404 handler for undefined API routes
│   ├── models/
│   │   └── index.js             # Placeholder for upcoming User, Car, Rental models
│   ├── routes/
│   │   ├── healthRoutes.js      # Router for /api/v1/health
│   │   └── index.js             # API v1 central router
│   ├── services/
│   │   └── healthService.js     # Health metrics and DB state evaluator
│   ├── app.js                   # Express app setup, CORS, and middleware
│   ├── server.js                # Server entry point (starts listener & connectDB)
│   ├── .env.example             # Server environment variables template
│   ├── .env                     # Local server environment config
│   └── package.json             # Backend dependencies and scripts
│
├── .gitignore                   # Ignores node_modules, .env, and dist
└── README.md                    # Project documentation & run guide
```

---

## ⚙️ Prerequisites

Make sure the following software is installed on your workstation:
1. **Node.js**: v18.0.0 or later (Tested with v24.13.0)
2. **npm**: v9.0.0 or later (Tested with v11.6.2)
3. **MongoDB**: Local MongoDB Community Edition running on port `27017` (Optional for Stage 1 health check, required for database persistence in Stage 2+)
4. **API Testing Tool**: Thunder Client (VS Code extension) or Postman

---

## 🚀 Installation & Setup Instructions

Open your terminal in the `driveeasy` folder:

### 1. Setup Backend (`server`)

```bash
# Navigate to the server folder
cd server

# Install backend dependencies
npm install

# Verify environment variables
# Note: A default .env is already supplied based on .env.example
```

#### Backend Environment Variables (`server/.env`)
| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `5000` | Port on which Express server listens |
| `NODE_ENV` | `development` | Runtime environment |
| `CLIENT_URL` | `http://localhost:5173` | Allowed frontend origin for CORS |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/driveeasy` | MongoDB connection string |
| `JWT_SECRET` | `driveeasy_super_secret_jwt_key_...` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | `7d` | Token expiration period |

---

### 2. Setup Frontend (`client`)

```bash
# Navigate to the client folder (from driveeasy root)
cd ../client

# Install frontend dependencies
npm install

# Verify environment variables
# Note: A default .env is already supplied based on .env.example
```

#### Frontend Environment Variables (`client/.env`)
| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:5000/api/v1` | Backend API base URL |

---

## 💻 Running the Applications

### Starting the Backend Server
```bash
cd driveeasy/server
npm run dev
```
> The backend will start with `nodemon` on **`http://localhost:5000`**.  
> Nodemon will automatically reload the server whenever backend files are modified.

### Starting the Frontend Client
Open a second terminal window:
```bash
cd driveeasy/client
npm run dev
```
> The Vite development server will start on **`http://localhost:5173`**.

---

## 🧪 Testing the Health Check API

### Using Browser or Postman / Thunder Client

#### 1. System Health Check
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/v1/health`
- **Expected Status:** `200 OK`
- **Sample JSON Response:**
```json
{
  "success": true,
  "message": "DriveEasy Car Rental API is operating normally",
  "data": {
    "application": "DriveEasy Car Rental System API",
    "status": "healthy",
    "stage": "Stage 1 - Foundation & Starter Shell",
    "version": "1.0.0",
    "environment": "development",
    "timestamp": "2026-10-24T17:45:00.000Z",
    "uptimeSeconds": 42,
    "database": {
      "status": "connected",
      "connected": true
    }
  }
}
```

#### 2. Root API Welcome Route
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/v1`
- **Expected Status:** `200 OK`

#### 3. Undefined Route (404 Verification)
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/v1/unknown`
- **Expected Status:** `404 Not Found`
- **Response:**
```json
{
  "success": false,
  "message": "Resource not found: Cannot GET /api/v1/unknown"
}
```

---

## 🔒 Security & Code Quality Practices Implemented

1. **Decoupled Database Initialization:** Database connection logic is isolated in `config/db.js` so connection issues do not crash the Express application process.
2. **No Hardcoded Secrets:** All ports, secrets, URIs, and origins are parsed from `.env` via `dotenv` with `.env.example` templates committed to source control.
3. **Information Disclosure Prevention:** The centralized error handler `middleware/errorHandler.js` intercepts unhandled exceptions and prevents internal stack traces from leaking to the client.
4. **CORS Whitelisting:** Cross-Origin Resource Sharing is explicitly configured for `CLIENT_URL` (`http://localhost:5173`), preventing unauthorized cross-origin requests.
5. **Viva-Friendly Readability:** Written in pure JavaScript (ES6+ / CommonJS for Node, JSX for React) with clear inline comments, semantic naming, and modular separation of concerns.

---

## 🗺️ 7-Stage Examination Development Roadmap

| Stage | Milestone | Status | Description |
|---|---|---|---|
| **Stage 1** | **Foundation & Starter Shell** | ✅ **Completed** | Full-stack architecture, package.json, health endpoint, routing, context shell |
| **Stage 2** | User Authentication | ⏳ Next | User schema, registration, login, JWT issuance, password hashing |
| **Stage 3** | Car Fleet Management | ⏳ Upcoming | Car schema, CRUD endpoints, category filtering, search |
| **Stage 4** | Rental Booking System | ⏳ Upcoming | Booking transactions, availability check, date calculation |
| **Stage 5** | Dashboards & Profile | ⏳ Upcoming | Customer rental history, admin fleet management UI |
| **Stage 6** | Payments & Notifications | ⏳ Upcoming | Payment calculation, status updates, invoice receipts |
| **Stage 7** | Testing & Final Polish | ⏳ Upcoming | API testing collection, UI refinements, final review |
