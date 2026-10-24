# DriveEasy Car Rental System

**Course:** ITUE301 Open-Book Practical Examination  
**Institution:** CSPIT, CHARUSAT  
**Development Stage:** Stage 3 — Routing, Authentication State, Protected Routes & Role-Based Access  
**Architecture:** Full-Stack MERN (Node.js, Express, MongoDB, React, Vite)

---

## 📌 Project Overview

**DriveEasy Car Rental System** is an end-to-end full-stack web application designed for vehicle fleet browsing and reservations.
- The **Backend (Express + Node.js)** exposes modular RESTful endpoints (`/api/v1`), connects to MongoDB via Mongoose, enforces CORS, provides standardized error handling, and implements JWT Bearer token authentication and role authorization guards (`authorizeRoles`).
- The **Frontend (React + Vite)** provides a component-driven SPA interface with React Router DOM, state management via React Context (`{ customer, token }`), session persistence via `localStorage`, route protection via `ProtectedRoute`, and lazy loading via `React.lazy` and `Suspense`.

---

## 🧭 Application Route Mapping

| Route | Component | Access Control | Behavior / Description |
|---|---|---|---|
| **`/`** | `LoginPage.jsx` | Public | Entry route. Form validation, calls `POST /api/v1/auth/login`. If authenticated, redirects to `/fleet`. |
| **`/fleet`** | `FleetPage.jsx` | **Protected** (All authenticated) | Redirects unauthenticated users to `/`. Displays vehicle fleet, filter tabs, and reservation form. |
| **`/my-bookings`** | `MyBookingsPage.jsx` | **Protected** (All authenticated) | Redirects unauthenticated users to `/`. Displays customer's reservations with loading, empty, and error states. |
| **`/admin`** | `AdminPanel.jsx` | **Protected & Lazy-Loaded** (`admin`, `fleet_manager`) | Loaded dynamically with `React.lazy` & `Suspense`. Customer role gets an explicit Access Denied guard. |
| `*` | `NotFoundPage.jsx` | Public | Friendly 404 route for undefined URLs. |

---

## 🧪 Registered Test Accounts by Role

The backend authentication endpoint (`POST /api/v1/auth/login`) verifies credentials and issues signed JWT tokens:

| Role | Email | Password | Allowed Access & Permissions |
|---|---|---|---|
| **Customer** | `customer@driveeasy.com` | `customer123` | View fleet, create bookings, view their own bookings. Restricted from `/admin`. |
| **Fleet Manager** | `manager@driveeasy.com` | `manager123` | View fleet, view bookings, toggle fleet availability, and approve/complete rentals. |
| **Administrator** | `admin@driveeasy.com` | `admin123` | Full access to fleet, customer bookings, cancellation, and administrative operations. |

---

## 🛡️ Frontend Protection vs. Backend AuthGuard (Viva Explanation)

A core requirement in software engineering and web application security is recognizing the boundary between frontend protection and backend authorization:

### 1. Frontend Route Protection (`ProtectedRoute.jsx`)
- **Purpose:** User Experience (UX) and navigation control.
- **Mechanism:** Inspects client-side state (`isAuthenticated`, `customer.role`). If unauthenticated, redirects to `/` via React Router's `<Navigate to="/" replace />`. If unauthorized, renders an "Access Denied" view.
- **Limitation:** Client-side JavaScript runs in the user's browser. An attacker can inspect local storage, modify client state, or send manual HTTP requests (via curl, Postman, Thunder Client) directly to server endpoints, bypassing the UI entirely.

### 2. Backend Authorization Guard (`authMiddleware.js`)
- **Purpose:** True System Security & Data Protection.
- **Mechanism:** 
  1. `verifyToken`: Extracts the HTTP `Authorization: Bearer <jwt_token>` header, verifies the cryptographic signature against `JWT_SECRET`, and extracts the decoded payload (`req.customer`).
  2. `authorizeRoles(...roles)`: Verifies that `req.customer.role` matches the clearance required for the endpoint (e.g. `['admin', 'fleet_manager']`). If invalid, rejects the request with HTTP `401 Unauthorized` or `403 Forbidden`.
- **Verdict:** Frontend protection guides legitimate users, but **only the backend guard protects sensitive data and operations against malicious tampering.**

---

## 📁 Project Structure

```text
driveeasy/
├── client/                          # Frontend Application (React 18 + Vite)
│   ├── src/
│   │   ├── components/              # Reusable UI Components
│   │   │   ├── VehicleCard.jsx      # Props: model, type, pricePerDay, available, onBook
│   │   │   ├── BookingForm.jsx      # Reservation form & real-time total price calculation
│   │   │   ├── Navbar.jsx           # Role-aware navigation (NavLink SPA links & Logout)
│   │   │   ├── Loading.jsx          # Reusable loading spinner indicator
│   │   │   ├── ErrorMessage.jsx     # Reusable error alert banner with retry
│   │   │   ├── StatusCard.jsx       # Real-time backend & DB health monitor
│   │   │   └── Footer.jsx           # University & examination metadata footer
│   │   ├── pages/                   # Application Pages
│   │   │   ├── LoginPage.jsx        # Login at / with validation & authService connection
│   │   │   ├── FleetPage.jsx        # Protected fleet grid, filter tabs & booking form
│   │   │   ├── MyBookingsPage.jsx   # Protected booking list with loading & error states
│   │   │   ├── AdminPanel.jsx       # Protected & Lazy-Loaded Admin/Manager Console
│   │   │   ├── HomePage.jsx         # Architecture & status dashboard
│   │   │   └── NotFoundPage.jsx     # 404 Route handler
│   │   ├── context/                 # State Management
│   │   │   └── AuthContext.jsx      # Context API holding { customer, token }, login, logout
│   │   ├── services/                # API Clients
│   │   │   ├── authService.js       # Reusable loginUser (POST /auth/login) helper
│   │   │   └── api.js               # Universal fetch wrapper with Bearer token injection
│   │   ├── routes/                  # Client-side Routing
│   │   │   ├── ProtectedRoute.jsx   # Route guard: redirects to / and checks allowedRoles
│   │   │   └── AppRoutes.jsx        # Route configuration with React.lazy and Suspense
│   │   ├── App.jsx                  # Main Application Layout
│   │   ├── main.jsx                 # Entry point with BrowserRouter & AuthProvider
│   │   └── index.css                # Global CSS design system (Vanilla CSS)
│   ├── .env.example                 # Frontend environment variables template
│   ├── .env                         # Local frontend environment config
│   ├── index.html                   # HTML entry point with Google Fonts
│   ├── package.json                 # Frontend dependencies and npm scripts
│   └── vite.config.js               # Vite build configuration (Port 5173)
│
├── server/                          # Backend REST API (Node.js + Express)
│   ├── config/
│   │   └── db.js                    # Decoupled MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js        # Authenticates customer & issues JWT token
│   │   └── healthController.js      # Controller for /api/v1/health
│   ├── middleware/
│   │   ├── authMiddleware.js        # verifyToken and authorizeRoles guards
│   │   ├── errorHandler.js          # Centralized error handler (no leaked secrets)
│   │   └── notFoundHandler.js       # 404 handler for undefined API routes
│   ├── models/
│   │   └── index.js                 # Placeholder for User, Car, Rental models
│   ├── routes/
│   │   ├── authRoutes.js            # POST /auth/login and GET /auth/me
│   │   ├── healthRoutes.js          # GET /health
│   │   └── index.js                 # API v1 central router
│   ├── services/
│   │   ├── healthService.js         # Health metrics evaluator
│   │   └── authService.js           # Auth business logic
│   ├── app.js                       # Express app configuration & CORS
│   ├── server.js                    # Server entry point
│   ├── .env.example                 # Server environment variables template
│   ├── .env                         # Local server environment config
│   └── package.json                 # Backend dependencies and npm scripts
│
├── .gitignore                       # Ignores node_modules, .env, and dist
└── README.md                        # Documentation & examination guide
```

---

## 🚀 Running and Testing the Application

### 1. Start the Backend Server:
```bash
cd driveeasy/server
npm run dev
```
> Server runs on `http://localhost:5000` with nodemon.

### 2. Start the Frontend Client:
```bash
cd driveeasy/client
npm run dev
```
> Client runs on `http://localhost:5173` with Vite.

### 3. Verify Frontend Production Build:
```bash
cd driveeasy/client
npm run build
```
Notice Vite builds the main bundle (`index.js`) and extracts `AdminPanel.js` into its own lazy chunk automatically!
