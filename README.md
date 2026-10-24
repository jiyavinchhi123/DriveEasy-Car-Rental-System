# DriveEasy Car Rental System

**Course:** ITUE301 Open-Book Practical Examination  
**Institution:** CSPIT, CHARUSAT  
**Development Stage:** Stage 2 — Frontend Component Architecture & UI  
**Architecture:** Full-Stack MERN (Node.js, Express, MongoDB, React, Vite)

---

## 📌 Project Overview

**DriveEasy Car Rental System** is an end-to-end full-stack web application designed for seamless vehicle rentals.
- The **Backend (Express + Node.js)** exposes modular RESTful endpoints (`/api/v1`), connects to MongoDB via Mongoose, enforces CORS, provides standardized error handling, and prepares JWT Bearer token authentication.
- The **Frontend (React + Vite)** provides a component-driven SPA interface with React Router DOM, state management via React Context (`useState`, `useEffect`, `useContext`), and an API client module.

---

## 📁 Project Structure

```text
driveeasy/
├── client/                          # Frontend Application (React 18 + Vite)
│   ├── src/
│   │   ├── components/              # Reusable UI Components
│   │   │   ├── VehicleCard.jsx      # Props: model, type, pricePerDay, available, onBook
│   │   │   ├── BookingForm.jsx      # Vehicle reservation form & price calculation
│   │   │   ├── Navbar.jsx           # React Router Link SPA navigation bar
│   │   │   ├── Loading.jsx          # Reusable loading spinner indicator
│   │   │   ├── ErrorMessage.jsx     # Reusable error alert banner with retry
│   │   │   ├── StatusCard.jsx       # Real-time backend & DB health monitor
│   │   │   └── Footer.jsx           # University & examination metadata footer
│   │   ├── pages/                   # Routed Application Pages
│   │   │   ├── HomePage.jsx         # System overview & live health verification
│   │   │   ├── LoginPage.jsx        # Login with client validation & auth connection
│   │   │   ├── FleetPage.jsx        # Vehicle fleet grid, type filter & booking form
│   │   │   ├── MyBookingsPage.jsx   # Booking list with loading, empty & error states
│   │   │   ├── AdminPanel.jsx       # Admin dashboard: Fleet, Bookings & Status
│   │   │   └── NotFoundPage.jsx     # 404 Route handler
│   │   ├── context/                 # State Management
│   │   │   └── AuthContext.jsx      # Context API (useState, useEffect, useContext)
│   │   ├── services/                # API Client
│   │   │   └── api.js               # Universal fetch client with JWT Bearer support
│   │   ├── routes/                  # Client-side Routing
│   │   │   └── AppRoutes.jsx        # Routes for /, /login, /fleet, /my-bookings, /admin
│   │   ├── App.jsx                  # Main Application Layout
│   │   ├── main.jsx                 # Entry point with BrowserRouter & AuthProvider
│   │   └── index.css                # Global CSS design system (Vanilla CSS)
│   ├── .env.example                 # Frontend environment variables template
│   ├── .env                         # Local frontend environment config
│   ├── index.html                   # HTML entry point with modern Google Fonts
│   ├── package.json                 # Frontend dependencies and npm scripts
│   └── vite.config.js               # Vite build configuration (Port 5173)
│
├── server/                          # Backend REST API (Node.js + Express)
│   ├── config/
│   │   └── db.js                    # Decoupled MongoDB connection logic
│   ├── controllers/
│   │   └── healthController.js      # Controller for /api/v1/health
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT Bearer token authentication middleware
│   │   ├── errorHandler.js          # Centralized error handler (no leaked secrets)
│   │   └── notFoundHandler.js       # 404 handler for undefined API routes
│   ├── models/
│   │   └── index.js                 # Placeholder for User, Car, Rental models
│   ├── routes/
│   │   ├── healthRoutes.js          # Route handler for /api/v1/health
│   │   └── index.js                 # API v1 central router
│   ├── services/
│   │   └── healthService.js         # Health metrics and DB state evaluator
│   ├── app.js                       # Express application configuration & CORS
│   ├── server.js                    # Server entry point
│   ├── .env.example                 # Server environment variables template
│   ├── .env                         # Local server environment config
│   └── package.json                 # Backend dependencies and npm scripts
│
├── .gitignore                       # Ignores node_modules, .env, and dist
└── README.md                        # Documentation & examination guide
```

---

## 🎨 Component Architecture & Data Flow

### 1. `VehicleCard.jsx`
- **Props Accepted:**
  - `model` *(string)*: Vehicle name (e.g., "Honda City ZX")
  - `type` *(string)*: Vehicle category ("Hatchback", "Sedan", "SUV")
  - `pricePerDay` *(number)*: Daily rental rate (e.g., 2800)
  - `available` *(boolean)*: Availability status flag
  - `onBook` *(function)*: Optional callback invoked when the user clicks "Book Now"
- **Behavior:**
  - Renders all 4 required vehicle properties.
  - When `available === true`: Displays active status dot and **"Book Now ➔"** button.
  - When `available === false`: Displays red status dot and **"Not Available"** badge instead of the button.
  - Clicking "Book Now" executes `onBook({ model, type, pricePerDay, available })`.

### 2. `FleetPage.jsx`
- Contains filter tabs: **All**, **Hatchback**, **Sedan**, and **SUV**.
- Integrates `BookingForm` with `selectedVehicle`, `pickupDate`, and `returnDate` managed via `useState`.
- Shows real-time selected vehicle and chosen dates state updates.
- Renders a responsive grid of `VehicleCard` components using clean prop passing from parent.
- Prepares for live API data (`GET /cars`) with fallback to initial sample fleet.

### 3. `LoginPage.jsx`
- Provides Email and Password input fields with accessible labels.
- Client-side validation: verifies non-empty inputs, valid email pattern, and minimum password length.
- Connects to `AuthContext` and `api.js` login service.
- **Strict verification:** Never pretends authentication succeeded if the backend rejects credentials.
- Includes examination quick-fill test credentials.

### 4. `MyBookingsPage.jsx`
- Displays user car rental reservations with vehicle details, pickup date, return date, and status badges (*Confirmed, Pending, Completed, Cancelled*).
- Implements comprehensive state handling:
  - **Loading State:** uses `<Loading />` spinner.
  - **Empty State:** clean prompt to explore fleet when no bookings exist.
  - **Error State:** uses `<ErrorMessage onRetry={...} />`.

### 5. `AdminPanel.jsx`
- Dedicated console for administrators and fleet managers.
- Top KPI cards: Total Fleet, Available Cars, Pending Bookings, Total Estimated Revenue.
- 3 distinct management sections:
  1. **Bookings Management:** Table of all customer reservations.
  2. **Vehicle Fleet Inventory:** Fleet table with real-time availability toggle.
  3. **Status Decision Console:** Approve pending requests, complete rentals, or cancel bookings.

### 6. `Navbar.jsx`
- Uses **React Router `Link`** components for instantaneous SPA navigation without page refreshes.
- Links to: **Dashboard (`/`)**, **Fleet (`/fleet`)**, **My Bookings (`/my-bookings`)**, **Admin Panel (`/admin`)**, and **Login (`/login`)**.

---

## 🚀 Running the Project

### Start Backend Server:
```bash
cd driveeasy/server
npm run dev
```
> Server runs on `http://localhost:5000` with nodemon.

### Start Frontend Client:
```bash
cd driveeasy/client
npm run dev
```
> Client runs on `http://localhost:5173` with Vite.

### Verify Frontend Production Build:
```bash
cd driveeasy/client
npm run build
```
*(Build transforms all modules cleanly without any compilation errors)*

---

## 🗺️ 7-Stage Examination Development Roadmap

| Stage | Milestone | Status | Description |
|---|---|---|---|
| **Stage 1** | **Foundation & Starter Shell** | ✅ Completed | Server & client setup, health check endpoint, environment variables, CORS |
| **Stage 2** | **Frontend Component Architecture & UI** | ✅ **Completed** | VehicleCard, BookingForm, Navbar, LoginPage, FleetPage, MyBookingsPage, AdminPanel |
| **Stage 3** | Car Fleet Management | ⏳ Next | Car Mongoose schema, seed script, REST CRUD endpoints (`/api/v1/cars`) |
| **Stage 4** | Rental Booking System | ⏳ Upcoming | Rental schema, booking transactions, date validation & total cost calculation |
| **Stage 5** | Authentication & Role Guards | ⏳ Upcoming | User registration, login, JWT issuance, ProtectedRoute component |
| **Stage 6** | Payments & Notifications | ⏳ Upcoming | Invoice receipts, payment calculation & alerts |
| **Stage 7** | Testing & Final Polish | ⏳ Upcoming | Thunder Client API collection, UI polish & final viva documentation |
