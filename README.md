# DriveEasy Car Rental System

**Course:** ITUE301 Open-Book Practical Examination  
**Institution:** CSPIT, CHARUSAT  
**Development Stage:** Stage 7 — Final Integration, Debugging, Testing & Examination-Readiness Audit  
**Architecture:** Full-Stack MERN (Node.js, Express, MongoDB, React, Vite)

---

## 📌 Project Overview

**DriveEasy Car Rental System** is an end-to-end full-stack MERN application engineered for car rental operations and reservations. It adheres to strict academic and production-grade specifications:
- **Backend (Express + Node.js + Mongoose):** Real MongoDB models (`Customer`, `Vehicle`, `Booking`), bcrypt password hashing, JWT Bearer tokens, CORS origin checking, global request logger (`requestLogger`), date-overlap double-booking prevention, populated cross-document queries, and role guards (`authGuard`, `roleGuard`).
- **Frontend (React 18 + Vite):** Component-driven SPA, React Router DOM, state management via React Context (`{ customer, token }`), session persistence via `localStorage`, route protection (`ProtectedRoute`), on-demand lazy loading (`React.lazy` + `Suspense`), and complete frontend-to-backend integration via dedicated service modules (`api.js`, `authService.js`, `vehicleService.js`, `bookingService.js`).

---

## 🚀 How to Run the Applications Locally

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **MongoDB:** MongoDB Community Server v6.0 or higher running locally on port `27017`

### 1. Database Seeding (Seed MongoDB with Demo Fleet & Users):
Ensure your local MongoDB daemon is running (`mongod`), then execute:
```bash
cd driveeasy/server
npm run seed
```
> Populates 3 demonstration accounts (Customer, Fleet Manager, Admin) and 6 fleet vehicles with real bcrypt password hashes.
> Note: In `production` environment (`NODE_ENV=production`), automatic seeding is disabled for safety.

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

### 4. Run Automated Backend Audit Tests:
```bash
cd driveeasy/server
npm test
```
> Runs `node scripts/audit_test.js` validating all 21 core criteria against live MongoDB.

### 5. Build Client Production Bundle:
```bash
cd driveeasy/client
npm run build
```
> Compiles all JSX/CSS assets cleanly into `dist/` with `AdminPanel` code-split into its own lazy chunk (`dist/assets/AdminPanel-*.js`).

---

## ⚙️ Environment Configuration

### Backend (`driveeasy/server/.env`):
```ini
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/driveeasy
JWT_SECRET=driveeasy_super_secret_jwt_key_cspit_charusat
JWT_EXPIRE=24h
CLIENT_URL=http://localhost:5173
```

### Frontend (`driveeasy/client/.env`):
```ini
VITE_API_BASE_URL=http://localhost:5000/api/v1
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

## 📡 Complete REST API Endpoints Specification

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

## 🧪 Section E: Postman / Thunder Client Practical Testing Guide

Recommended execution order to test complete lifecycle:

### Step 1: Customer Login
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/v1/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "email": "customer@driveeasy.com",
    "password": "customer123"
  }
  ```
- **Expected Success Status:** `200 OK`
- **Sample Success Response:**
  ```json
  {
    "success": true,
    "message": "Login successful. Welcome back, Rahul Sharma (Customer)!",
    "data": {
      "customer": {
        "id": "654321654321654321000001",
        "name": "Rahul Sharma (Customer)",
        "email": "customer@driveeasy.com",
        "role": "customer"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Validation Failure Case:** Wrong password -> `401 Unauthorized` (`"Invalid email or password."`).
- **Action:** Copy `data.token` for subsequent protected requests (`CUSTOMER_TOKEN`).

---

### Step 2: List Public Vehicles (No Token Required)
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/v1/vehicles`
- **Headers:** None (Public)
- **Expected Success Status:** `200 OK`
- **Sample Success Response:**
  ```json
  {
    "success": true,
    "count": 6,
    "data": [
      {
        "_id": "654321654321654321000011",
        "model": "Maruti Suzuki Swift",
        "type": "Hatchback",
        "pricePerDay": 1800,
        "available": true,
        "registrationNumber": "GJ-06-AB-1234"
      }
    ]
  }
  ```
- **Action:** Copy an available `_id` (`AVAILABLE_VEHICLE_ID`).

---

### Step 3: Create Booking (Valid Reservation)
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/v1/bookings`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <CUSTOMER_TOKEN>`
- **Body:**
  ```json
  {
    "vehicleId": "654321654321654321000011",
    "pickupDate": "2026-11-10T10:00:00.000Z",
    "returnDate": "2026-11-15T10:00:00.000Z"
  }
  ```
- **Expected Success Status:** `201 Created`
- **Sample Success Response:**
  ```json
  {
    "success": true,
    "message": "Booking successfully created and vehicle reserved.",
    "data": {
      "_id": "671ad4810f135b37651a99f1",
      "customerId": "654321654321654321000001",
      "vehicleId": "654321654321654321000011",
      "pickupDate": "2026-11-10T10:00:00.000Z",
      "returnDate": "2026-11-15T10:00:00.000Z",
      "totalPrice": 9000,
      "status": "reserved"
    }
  }
  ```
- **Action:** Copy the returned booking `_id` (`BOOKING_ID`).

---

### Step 4: Test Double-Booking / Date Overlap Prevention
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/v1/bookings`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <CUSTOMER_TOKEN>`
- **Body (Overlapping Range e.g. Nov 12 - Nov 18):**
  ```json
  {
    "vehicleId": "654321654321654321000011",
    "pickupDate": "2026-11-12T10:00:00.000Z",
    "returnDate": "2026-11-18T10:00:00.000Z"
  }
  ```
- **Expected Failure Status:** `400 Bad Request`
- **Sample Response:**
  ```json
  {
    "success": false,
    "message": "Vehicle 'Maruti Suzuki Swift' is already booked for the selected date range (2026-11-10 to 2026-11-15). Please choose different dates."
  }
  ```

---

### Step 5: Fetch Own Bookings with Populated Details
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/v1/bookings/my`
- **Headers:**
  - `Authorization: Bearer <CUSTOMER_TOKEN>`
- **Expected Success Status:** `200 OK`
- **Sample Success Response:**
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "_id": "671ad4810f135b37651a99f1",
        "customerId": {
          "_id": "654321654321654321000001",
          "name": "Rahul Sharma (Customer)",
          "email": "customer@driveeasy.com"
        },
        "vehicleId": {
          "_id": "654321654321654321000011",
          "model": "Maruti Suzuki Swift",
          "type": "Hatchback"
        },
        "pickupDate": "2026-11-10T10:00:00.000Z",
        "returnDate": "2026-11-15T10:00:00.000Z",
        "totalPrice": 9000,
        "status": "reserved"
      }
    ]
  }
  ```

---

### Step 6: Test Customer Role Restrictions (Attempt Unauthorized Status Change)
- **Method:** `PATCH`
- **URL:** `http://localhost:5000/api/v1/bookings/<BOOKING_ID>/status`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <CUSTOMER_TOKEN>`
- **Body (Attempting manager-only status):**
  ```json
  {
    "status": "completed"
  }
  ```
- **Expected Failure Status:** `403 Forbidden`
- **Sample Response:**
  ```json
  {
    "success": false,
    "message": "Forbidden: Customers may only cancel their own reservations ('cancelled'). Administrative status changes ('ongoing', 'completed') require Fleet Manager or Administrator permissions."
  }
  ```

---

### Step 7: Customer Cancels Own Booking
- **Method:** `PATCH`
- **URL:** `http://localhost:5000/api/v1/bookings/<BOOKING_ID>/status`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <CUSTOMER_TOKEN>`
- **Body:**
  ```json
  {
    "status": "cancelled"
  }
  ```
- **Expected Success Status:** `200 OK`
- **Verification:** Calling `GET /api/v1/vehicles` confirms the vehicle's `available` field is restored to `true`.

---

### Step 8: Test Missing or Invalid Token Handling
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/v1/bookings/my`
- **Headers:** `Authorization: Bearer invalidToken12345`
- **Expected Failure Status:** `401 Unauthorized`
- **Sample Response:**
  ```json
  {
    "success": false,
    "message": "Authentication failed: Invalid or tampered token."
  }
  ```

---

## 🎓 Section G: Comprehensive Viva & Practical Exam Preparation

### 1. React Props and Reusable Components
- **Concepts:** Props (properties) are read-only inputs passed from parent components to child components, establishing a unidirectional data flow.
- **DriveEasy Implementation:** `VehicleCard.jsx` accepts `model`, `type`, `pricePerDay`, `available`, and `onBook`. Because the component does not fetch its own data, it is a pure, reusable presentation component that can be rendered anywhere in the application (e.g. `FleetPage` or `AdminPanel`).

### 2. React Hooks: `useState`, `useEffect`, `useContext`
- **`useState`:** Manages local reactive component state. In `FleetPage.jsx`, `useState` tracks `vehicles` (the full fetched fleet), `loading` (spinner flag), and `error` (network feedback).
- **`useEffect`:** Handles side effects (such as fetching data or subscribing to events) outside the component rendering cycle. In `FleetPage.jsx`, `useEffect(() => { loadFleet(); }, [])` executes once on component mount.
- **`useContext`:** Provides global state without "prop drilling". In `AuthContext.jsx`, `createContext` and `useAuth` provide `{ customer, token, isAuthenticated, login, logout }` to all components in the tree.

### 3. React Router and `ProtectedRoute`
- **Client-Side Routing:** `react-router-dom` intercepts URL navigation, updating the DOM dynamically via `Link` and `NavLink` without requesting a new HTML page from the server.
- **ProtectedRoute Mechanism:** Checks `isAuthenticated` from `AuthContext`. If `false`, it returns `<Navigate to="/" replace />`, redirecting unauthenticated visitors to login. It also inspects `customer.role` against `allowedRoles`, blocking unauthorized users with an "Access Denied" view.

### 4. `React.lazy` and `Suspense`
- **Code Splitting:** Instead of downloading the entire application bundle on first load, `React.lazy(() => import('../pages/AdminPanel'))` tells Vite/Webpack to extract `AdminPanel` into a standalone chunk (`dist/assets/AdminPanel-*.js`).
- **Suspense:** Wraps the lazy component (`<Suspense fallback={<Loading />}><AdminPanel /></Suspense>`) to display a graceful fallback spinner while the chunk is downloaded over the network.

### 5. REST Methods and HTTP Status Codes
- **`GET` (200 OK):** Safe, idempotent retrieval of resources (`GET /api/v1/vehicles`).
- **`POST` (201 Created / 400 Bad Request):** Creates a new resource (`POST /api/v1/bookings`). Returns `201` on creation, `400` on validation errors.
- **`PATCH` (200 OK / 403 Forbidden / 404 Not Found):** Partially updates an existing resource (`PATCH /api/v1/bookings/:id/status`).
- **`401 Unauthorized`:** Token missing, expired, or invalid.
- **`403 Forbidden`:** Authenticated user lacks authorization for the requested operation.
- **`500 Internal Server Error`:** Unhandled server exception.

### 6. Express Middleware Execution Order
Express executes middleware sequentially in the order registered in `app.js`:
```
Incoming HTTP Request
       │
       ▼
1. cors() ──────────────► Enforces Allowed Origin & CORS Headers
       │
       ▼
2. express.json() ──────► Parses Incoming JSON Body to req.body
       │
       ▼
3. requestLogger ───────► Logs: [METHOD] [PATH] [TIMESTAMP]
       │
       ▼
4. apiRoutes ───────────► Mounts Endpoints (Runs authGuard on protected routes)
       │
       ▼
5. notFoundHandler ─────► Catches Unmatched Routes (returns 404 JSON)
       │
       ▼
6. errorHandler ────────► Global 4-parameter error middleware (returns structured JSON)
```

### 7. JWT Bearer Authentication vs. Role Authorization
- **Authentication (Who are you?):** User sends credentials (`POST /login`). Server verifies password with `bcrypt.compare` and returns a digitally signed JWT containing `{ id, email, role }`. The client transmits this in the header: `Authorization: Bearer <token>`.
- **Authorization (What are you allowed to do?):** `authGuard.js` verifies the signature using `JWT_SECRET` and populates `req.user`. Then `roleGuard('admin', 'fleetManager')` verifies whether `req.user.role` matches permitted roles before proceeding.

### 8. Mongoose Schemas, Validation, and `populate`
- **Schemas:** Enforce strict field typing, required constraints, unique indexes, and custom validators (e.g., `returnDate > pickupDate`).
- **Populate:** Mongoose's cross-collection referencing mechanism (similar to SQL JOIN). In `GET /bookings/my`:
  ```javascript
  Booking.find({ customerId })
    .populate('customerId', 'name email')
    .populate('vehicleId', 'model type')
  ```
  This replaces the ObjectId references with the actual documents from the `Customer` and `Vehicle` collections.

### 9. Vehicle Availability vs. Date-Overlap Checks
- **Availability Flag (`available: Boolean`):** A high-level operational switch. Useful to indicate if a car is in the maintenance shop or currently dispatched on the road.
- **Date Overlap Logic:** A mathematical range comparison across scheduled bookings:
  `existingPickup < newReturn && existingReturn > newPickup`
- **Why a Boolean availability flag alone cannot prevent double-bookings:**
  - A vehicle can be rented for *November 1–5* and also rented for *December 1–5*. During November, the car is unavailable, but in December it will be available. A single Boolean flag cannot represent multiple scheduled time slots.
  - Furthermore, race conditions occur if two users book simultaneously. Checking interval overlap ensures that regardless of the instantaneous Boolean status, two active bookings for the same vehicle never conflict.

### 10. How `requestLogger`, `authGuard`, and `errorHandler` Work
- **`requestLogger`:** Placed globally before routes. Grabs `req.method`, `req.originalUrl`, and `new Date().toISOString()`, outputting formatted diagnostics.
- **`authGuard`:** Parses `req.headers.authorization`. If missing or lacking the `Bearer ` prefix, returns `401`. Verifies using `jwt.verify(token, secret)` and binds identity to `req.user`.
- **`errorHandler`:** Four-argument middleware `(err, req, res, next)` registered last. Categorizes `CastError` (400), `ValidationError` (400), `11000 Duplicate Key` (400), and `TokenExpiredError` (401), preventing stack traces from leaking to the client.

---

## 🛠️ Troubleshooting Guide

1. **MongoDB Connection Refused (`ECONNREFUSED 127.0.0.1:27017`):**
   - Ensure MongoDB is installed and the service is active (`net start MongoDB` or `mongod`).
2. **CORS Error in Browser Console:**
   - Verify `CLIENT_URL=http://localhost:5173` is set in `server/.env`.
3. **Token Expired / 401 Redirect Loop:**
   - The application clears `localStorage` automatically on 401 responses. Simply log in again on `/` to issue a fresh JWT.
4. **Vite Port Conflict:**
   - If port `5173` is occupied, Vite will assign `5174`. Update `CLIENT_URL` in `server/.env` accordingly.
