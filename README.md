# DriveEasy Car Rental System

**Course:** ITUE301 Open-Book Practical Examination  
**Institution:** CSPIT, CHARUSAT  
**Development Stage:** Stage 5 — MongoDB Persistence with Mongoose, Transactional Bookings & Seeding  
**Architecture:** Full-Stack MERN (Node.js, Express, MongoDB, React, Vite)

---

## 📌 Project Overview

**DriveEasy Car Rental System** is an end-to-end full-stack web application designed for vehicle fleet browsing and reservations.
- The **Backend (Express + Node.js + Mongoose)** connects to MongoDB via Mongoose ODM, defines strict schemas with custom validators, encrypts passwords with `bcryptjs`, issues JWT Bearer tokens, guards endpoints, and uses database transactions with date-overlap detection to prevent double-bookings.
- The **Frontend (React + Vite)** provides a component-driven SPA interface with React Router DOM, state management via React Context (`{ customer, token }`), session persistence via `localStorage`, route protection via `ProtectedRoute`, and lazy loading via `React.lazy` and `Suspense`.

---

## 🍃 Mongoose Schemas & Data Models

### 1. Model: `Customer` (`models/Customer.js`)
| Field | Type | Rules & Validation |
|---|---|---|
| `name` | `String` | Required, trimmed. |
| `email` | `String` | Required, unique, trimmed, normalized to lowercase with regex format validation. |
| `phone` | `String` | Required, trimmed. |
| `licenseNumber` | `String` | Required, unique, trimmed, uppercase format. |
| `passwordHash` | `String` | Required, `select: false` (excluded from query responses to prevent leaks). |
| `role` | `String` | Enum: `['customer', 'fleetManager', 'admin']`, default: `'customer'`. |

- **Instance Method:** `matchPassword(candidatePassword)` compares submitted plaintext password with stored bcrypt hash using `bcrypt.compare`.

---

### 2. Model: `Vehicle` (`models/Vehicle.js`)
| Field | Type | Rules & Validation |
|---|---|---|
| `model` | `String` | Required, trimmed (e.g. `"Honda City ZX"`). |
| `type` | `String` | Required, enum: `['Hatchback', 'Sedan', 'SUV']`. |
| `pricePerDay` | `Number` | Required, min: `0`. |
| `available` | `Boolean` | Default: `true`. |
| `registrationNumber` | `String` | Trimmed, unique, uppercase (e.g. `"GJ-23-EF-9012"`). |

---

### 3. Model: `Booking` (`models/Booking.js`)
| Field | Type | Rules & Validation |
|---|---|---|
| `customerId` | `ObjectId` | Ref: `Customer`, required. Derived strictly from `req.user.id`. |
| `vehicleId` | `ObjectId` | Ref: `Vehicle`, required. |
| `pickupDate` | `Date` | Required. |
| `returnDate` | `Date` | Required, schema-level validator ensures `returnDate > pickupDate`. |
| `totalPrice` | `Number` | Min: `0`. |
| `status` | `String` | Enum: `['reserved', 'ongoing', 'completed', 'cancelled']`, default: `'reserved'`. |

---

## 🚫 Double-Booking Prevention & Date Overlap Logic (Viva Explanation)

### Why a Single `available` Boolean is Insufficient
A single boolean `available: true/false` only describes whether a car is occupied **right this instant**. It cannot answer questions like:
- *"Can Customer B rent this car next month if Customer A has it reserved today?"*
- *"Can Customer C rent this car from Nov 1 to Nov 5 if Customer D rented it from Nov 10 to Nov 15?"*

If a system relied solely on `Vehicle.available`, marking a car as rented today would block all future dates indefinitely; conversely, leaving it `true` for future dates would allow overlapping reservations.

### Interval Overlap Mathematical Detection
Two reservation date intervals `[P₁, R₁]` (existing booking) and `[P₂, R₂]` (new request) overlap if and only if:
$$\text{Existing Pickup} < \text{New Return} \quad \text{AND} \quad \text{Existing Return} > \text{New Pickup}$$

In DriveEasy, every booking request executes a query against MongoDB before creation:
```javascript
const activeStatuses = ['reserved', 'ongoing'];
const overlappingBooking = await Booking.findOne({
  vehicleId: vehicle._id,
  status: { $in: activeStatuses },
  pickupDate: { $lt: end },
  returnDate: { $gt: start }
});

if (overlappingBooking) {
  return res.status(400).json({
    success: false,
    message: `Vehicle '${vehicle.model}' is already booked for the selected date range.`
  });
}
```

---

## 🔄 Transactional Booking Creation & Fallback

When reserving a vehicle, two operations must succeed atomically:
1. Creating the `Booking` document.
2. Setting `Vehicle.available = false`.

DriveEasy employs **Mongoose Multi-Document Transactions**:
```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
  const [newBooking] = await Booking.create([bookingData], { session });
  await Vehicle.findByIdAndUpdate(vehicleId, { available: false }, { session });
  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
} finally {
  session.endSession();
}
```
**Standalone Topology Fallback:** On standalone MongoDB deployments where multi-document replica set transactions are disabled, the controller executes a safe two-phase write with compensation rollback: if updating the vehicle fails, the newly inserted booking is immediately purged (`Booking.findByIdAndDelete`) before responding with an error, ensuring data consistency is maintained.

---

## 🔄 Availability Management on Status Changes

When a booking is cancelled or marked completed via `PATCH /api/v1/bookings/:id/status`:
1. The status is updated to `'cancelled'` or `'completed'`.
2. The controller inspects if there are any *other* active bookings (`'reserved'` or `'ongoing'`) for that vehicle.
3. The vehicle's `available` field is restored to `true` **only if no other active reservations require it**.

---

## 🧪 Database Seeding (`npm run seed`)

The seed script creates realistic demo accounts with pre-hashed passwords using `bcryptjs`. It is built with **repeatable upsert operations** (`findOneAndUpdate` with `upsert: true`) so running it multiple times never creates duplicates:

```bash
cd driveeasy/server
npm run seed
```

### Seed Demonstration Accounts:
| Role | Email | Password | Phone | License Number |
|---|---|---|---|---|
| **Customer** | `customer@driveeasy.com` | `customer123` | `+91 9876543210` | `DL-GJ06-20210001` |
| **Fleet Manager** | `manager@driveeasy.com` | `manager123` | `+91 9876543211` | `DL-GJ06-20180002` |
| **Administrator** | `admin@driveeasy.com` | `admin123` | `+91 9876543212` | `DL-GJ06-20150003` |

---

## 📡 REST API Endpoints Specification

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Public | Validates credentials against real MongoDB Customer record and bcrypt `passwordHash`. |
| `GET` | `/api/v1/vehicles` | Public | Retrieves fleet vehicles with optional `?type=SUV` filtering. |
| `POST` | `/api/v1/bookings` | `authGuard` | Creates booking with date-overlap prevention, transaction, and vehicle reservation. |
| `GET` | `/api/v1/bookings/my` | `authGuard` | Retrieves customer bookings populated with `customerId` (`name`, `email`) and `vehicleId` (`model`, `type`). |
| `PATCH` | `/api/v1/bookings/:id/status` | `authGuard` | Updates status (`reserved`, `ongoing`, `completed`, `cancelled`) with RBAC and intelligent vehicle release. |
| `GET` | `/api/v1/health` | Public | Real-time system uptime & MongoDB connection monitor. |

---

## 🚀 Running the Applications

### 1. Start MongoDB (If running locally):
Ensure MongoDB Community Server is started on `mongodb://127.0.0.1:27017`.

### 2. Seed Database:
```bash
cd driveeasy/server
npm run seed
```

### 3. Start Backend:
```bash
cd driveeasy/server
npm run dev
```
> Server runs on `http://localhost:5000`.

### 4. Start Frontend:
```bash
cd driveeasy/client
npm run dev
```
> Client runs on `http://localhost:5173`.
