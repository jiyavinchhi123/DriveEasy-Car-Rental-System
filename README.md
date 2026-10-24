# DriveEasy Car Rental System

**Course:** ITUE301 Open-Book Practical Examination  
**Institution:** CSPIT, CHARUSAT  
**Development Stage:** Stage 6 — Full-Stack Frontend & Backend Integration  
**Architecture:** Full-Stack MERN (Node.js, Express, MongoDB, React, Vite)

---

## 📌 Project Overview

**DriveEasy Car Rental System** is an end-to-end full-stack MERN web application for vehicle browsing and reservations.
- **Backend (Express + Node.js + Mongoose):** Real MongoDB models (`Customer`, `Vehicle`, `Booking`), bcrypt password hashing, JWT Bearer tokens, CORS origin checking, global request logger (`requestLogger`), date-overlap double-booking prevention, transactions, populated queries, and role guards (`authGuard`, `roleGuard`).
- **Frontend (React 18 + Vite):** Component-driven SPA, React Router DOM, state management via React Context (`{ customer, token }`), session persistence via `localStorage`, route protection (`ProtectedRoute`), on-demand lazy loading (`React.lazy` + `Suspense`), and complete frontend-to-backend integration via dedicated service modules (`api.js`, `authService.js`, `vehicleService.js`, `bookingService.js`).

---

## 🚀 How to Run the Applications

### 1. Database Seeding (Seed MongoDB with Demo Fleet & Users):
Ensure your local MongoDB daemon is running on port 27017, then execute:
```bash
cd driveeasy/server
npm run seed
```
> Populates 3 demonstration accounts (Customer, Fleet Manager, Admin) and 6 fleet vehicles with real bcrypt password hashes.

### 2. Start the Backend API Server:
```bash
cd driveeasy/server
npm run dev
```
> Express server starts on **`http://localhost:5000`** with nodemon and live Mongoose connection.

### 3. Start the Frontend Client:
In a second terminal window:
```bash
cd driveeasy/client
npm run dev
```
> Vite dev server starts on **`http://localhost:5173`**.

### 4. Build Client Bundle:
```bash
cd driveeasy/client
npm run build
```
> Compiles all modules cleanly into `dist/` with `AdminPanel` code-split into its own lazy chunk (`dist/assets/AdminPanel-*.js`).

---

## 🔗 Frontend-to-Backend Integration Architecture

```mermaid
sequenceDiagram
    autonumber
    actor User as Student / Examiner
    participant Browser as React SPA (Port 5173)
    participant Services as Client Services (api.js / vehicleService.js / bookingService.js)
    participant Server as Express API (Port 5000)
    participant DB as MongoDB (Port 27017)

    Note over User,Browser: 1. Authentication Flow
    User->>Browser: Enters email & password on LoginPage
    Browser->>Services: loginUser(email, password)
    Services->>Server: POST /api/v1/auth/login
    Server->>DB: Customer.findOne({ email }).select('+passwordHash')
    DB-->>Server: Customer Document with bcrypt hash
    Server->>Server: bcrypt.compare(password, passwordHash)
    Server-->>Services: { success: true, token, customer }
    Services-->>Browser: Saves token in localStorage & updates AuthContext
    Browser->>Browser: Redirects to /fleet

    Note over User,Browser: 2. Fleet Browsing & Client-Side Filtering
    Browser->>Services: fetchVehicles() on mount
    Services->>Server: GET /api/v1/vehicles
    Server->>DB: Vehicle.find()
    DB-->>Server: 6 Fleet Documents
    Server-->>Services: Array of Vehicles
    Services-->>Browser: Store full fleet in state
    User->>Browser: Clicks "SUV" filter tab
    Browser->>Browser: vehicles.filter(v => v.type === 'SUV') (No API refetch!)

    Note over User,Browser: 3. Double-Booking Prevention & Reservation
    User->>Browser: Clicks "Book Now", selects dates, clicks "Confirm Reservation"
    Browser->>Services: createBookingApi({ vehicleId, pickupDate, returnDate })
    Services->>Server: POST /api/v1/bookings (Authorization: Bearer <token>)
    Server->>Server: authGuard verifies JWT & extracts req.user.id
    Server->>DB: Check date overlap: (pickupDate < newReturn && returnDate > newPickup)
    DB-->>Server: No overlap found
    Server->>DB: Create Booking & Vehicle.findByIdAndUpdate(available: false)
    DB-->>Server: Created Booking
    Server-->>Services: HTTP 201 Created
    Services-->>Browser: Success Banner & triggers loadFleet() to update UI
```

---

## 🛡️ Role-Based Access Control & Demonstration Accounts

The login page contains one-click test credential fill buttons for each role:

| Role | Email | Password | Permissions & Available Views |
|---|---|---|---|
| **Customer** | `customer@driveeasy.com` | `customer123` | View fleet, create reservations, view & cancel own bookings in **My Bookings**. Restricted from Admin Panel. |
| **Fleet Manager** | `manager@driveeasy.com` | `manager123` | View fleet, view all customer bookings, dispatch cars (mark `ongoing`), toggle fleet availability. |
| **Administrator** | `admin@driveeasy.com` | `admin123` | Full administrative control: all bookings, complete/cancel any booking, toggle fleet availability, and revenue insights. |

---

## 📡 Complete REST API Endpoints

| Method | Endpoint | Access | Function |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Public | Authenticates credentials with bcrypt against MongoDB Customer record; returns signed JWT. |
| `GET` | `/api/v1/vehicles` | Public | Retrieves all fleet vehicles; supports `?type=SUV` filter. |
| `POST` | `/api/v1/vehicles` | `admin`, `fleetManager` | Adds a new vehicle to the fleet. |
| `PATCH` | `/api/v1/vehicles/:id/availability` | `admin`, `fleetManager` | Toggles vehicle availability flag in MongoDB. |
| `POST` | `/api/v1/bookings` | Authenticated (`authGuard`) | Reserves vehicle with interval date overlap check and transaction. |
| `GET` | `/api/v1/bookings/my` | Authenticated (`authGuard`) | Retrieves customer's bookings with populated `customerId` and `vehicleId`. |
| `GET` | `/api/v1/bookings` | `admin`, `fleetManager` | Retrieves all customer bookings across the platform. |
| `PATCH` | `/api/v1/bookings/:id/status` | Authenticated (`authGuard`) | Updates status (`reserved`, `ongoing`, `completed`, `cancelled`) with RBAC restrictions and vehicle release. |
| `GET` | `/api/v1/health` | Public | Live system health and MongoDB connection monitor. |

---

## 💡 Key Full-Stack Features Verified

1. **No Mock or Hardcoded Production Data:**
   - Both `FleetPage`, `MyBookingsPage`, and `AdminPanel` fetch 100% real MongoDB records via Express controllers.
2. **Client-Side Filter Optimization:**
   - On `FleetPage`, switching between *All, Hatchback, Sedan, SUV* filters the in-memory `vehicles` array using `.filter()` without triggering redundant HTTP requests.
3. **Double-Booking Prevention:**
   - Prevents overlapping reservations for the same car using mathematical date range intersection queries in MongoDB.
4. **401 Session Invalidation:**
   - When an expired or tampered token returns `401 Unauthorized`, `api.js` automatically clears `localStorage` and redirects the user to the login route.
5. **Role Restrictions on Both Ends:**
   - Frontend: `ProtectedRoute.jsx` blocks unauthorized navigation.
   - Backend: `authGuard.js` and `roleGuard` reject unauthorized HTTP calls with `401 Unauthorized` or `403 Forbidden`.
