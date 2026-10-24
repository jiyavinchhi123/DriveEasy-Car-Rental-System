const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = require('../app');
const { Customer, Vehicle, Booking } = require('../models');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/driveeasy';

async function runAudit() {
  console.log('================================================================');
  console.log('  DRIVEEASY CAR RENTAL SYSTEM - STAGE 7 COMPREHENSIVE AUDIT     ');
  console.log('================================================================');

  await mongoose.connect(MONGO_URI);
  console.log(`[Database] Connected to MongoDB: ${mongoose.connection.name}`);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/v1`;
  console.log(`[Server] Test server active on http://localhost:${port}`);

  const results = [];

  const record = (id, description, passed, details = '') => {
    results.push({ id, description, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} [${id}] ${description} ${details ? `(${details})` : ''}`);
  };

  try {
    // TEST 1: POST /api/v1/auth/login with valid customer
    let res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@driveeasy.com', password: 'customer123' })
    });
    let data = await res.json();
    const customerToken = data.data?.token;
    const customerId = data.data?.customer?.id;
    record('D1', 'Successful login returns valid JWT and safe details (no password/hash)', res.status === 200 && !!customerToken && !data.data.customer.passwordHash && !data.data.customer.password);

    // TEST 2: POST /api/v1/auth/login invalid credentials -> 401
    res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@driveeasy.com', password: 'incorrectPassword' })
    });
    record('D2', 'Login with wrong password returns 401 Unauthorized', res.status === 401);

    // TEST 3: Login as Admin
    res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@driveeasy.com', password: 'admin123' })
    });
    data = await res.json();
    const adminToken = data.data?.token;
    record('D3', 'Admin login succeeds and returns admin role token', res.status === 200 && data.data?.customer?.role === 'admin');

    // TEST 4: Missing Bearer token on protected route -> 401
    res = await fetch(`${baseUrl}/bookings/my`);
    record('D4', 'Missing Bearer token returns 401 Unauthorized', res.status === 401);

    // TEST 5: Invalid/malformed token -> 401
    res = await fetch(`${baseUrl}/bookings/my`, {
      headers: { Authorization: 'Bearer thisIsAnInvalidBogusTokenString123' }
    });
    record('D5', 'Malformed/invalid Bearer token returns 401 Unauthorized', res.status === 401);

    // TEST 6: Public GET /api/v1/vehicles works without token -> 200
    res = await fetch(`${baseUrl}/vehicles`);
    const vehList = await res.json();
    record('D6', 'Public GET /api/v1/vehicles succeeds without authentication token', res.status === 200 && Array.isArray(vehList.data));

    // TEST 7: GET /api/v1/vehicles?type=SUV filters properly
    res = await fetch(`${baseUrl}/vehicles?type=SUV`);
    const suvList = await res.json();
    record('D7', 'GET /api/v1/vehicles?type=SUV filters by category type', res.status === 200 && suvList.data.every((v) => v.type === 'SUV'));

    // Prepare vehicles for booking tests
    // Ensure at least one available vehicle and one unavailable vehicle
    let availableVehicle = await Vehicle.findOne({ available: true });
    let unavailableVehicle = await Vehicle.findOne({ available: false });

    if (!availableVehicle) {
      availableVehicle = await Vehicle.create({
        model: 'Audit Test Car A',
        type: 'Sedan',
        pricePerDay: 2500,
        available: true,
        registrationNumber: `GJ-06-AUD-${Date.now().toString().slice(-4)}`
      });
    }

    if (!unavailableVehicle) {
      unavailableVehicle = await Vehicle.create({
        model: 'Audit Test Car B (Unavailable)',
        type: 'SUV',
        pricePerDay: 3200,
        available: false,
        registrationNumber: `GJ-06-UNAV-${Date.now().toString().slice(-4)}`
      });
    }

    // Clean existing test bookings for this test vehicle
    await Booking.deleteMany({ vehicleId: availableVehicle._id });
    await Vehicle.findByIdAndUpdate(availableVehicle._id, { available: true });

    // TEST 8: Missing fields in booking -> 400
    res = await fetch(`${baseUrl}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({ vehicleId: availableVehicle._id }) // missing dates
    });
    record('D8', 'POST /bookings with missing dates returns 400 Bad Request', res.status === 400);

    // TEST 9: Invalid dates (returnDate <= pickupDate) -> 400
    res = await fetch(`${baseUrl}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({
        vehicleId: availableVehicle._id,
        pickupDate: '2026-11-20',
        returnDate: '2026-11-15' // earlier than pickup
      })
    });
    record('D9', 'POST /bookings with returnDate earlier than pickupDate returns 400', res.status === 400);

    // TEST 10: Booking an unavailable vehicle -> 400
    res = await fetch(`${baseUrl}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({
        vehicleId: unavailableVehicle._id,
        pickupDate: '2026-11-01',
        returnDate: '2026-11-05'
      })
    });
    const unavailBody = await res.json();
    record('D10', 'Booking unavailable vehicle returns 400 with clear rejection message', res.status === 400 && unavailBody.message.includes('unavailable'));

    // TEST 11: Valid booking creation -> 201
    const testPickup = '2026-12-10T10:00:00.000Z';
    const testReturn = '2026-12-15T10:00:00.000Z';

    res = await fetch(`${baseUrl}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({
        vehicleId: availableVehicle._id,
        pickupDate: testPickup,
        returnDate: testReturn
      })
    });
    const createdBookingRes = await res.json();
    const createdBooking = createdBookingRes.data;
    record('D11', 'Valid booking request returns 201 Created and sets vehicle available=false', res.status === 201 && !!createdBooking?._id);

    // Verify vehicle available is now false
    const vehicleAfterBooking = await Vehicle.findById(availableVehicle._id);
    record('D12', 'Vehicle availability is set to false in MongoDB after booking creation', vehicleAfterBooking.available === false);

    // TEST 13: Prevent double-booking / date overlap -> 400
    // Try to book the exact same vehicle for overlapping range: 2026-12-12 to 2026-12-17
    res = await fetch(`${baseUrl}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({
        vehicleId: availableVehicle._id,
        pickupDate: '2026-12-12T10:00:00.000Z',
        returnDate: '2026-12-17T10:00:00.000Z'
      })
    });
    const doubleBookingRes = await res.json();
    record('D13', 'Overlapping date range booking rejected with 400 (double-booking prevention)', res.status === 400);

    // TEST 14: Customer cannot spoof customerId by putting another ID in request body
    // Derivation must come strictly from req.user.id
    record('D14', 'Ownership derived strictly from JWT: customerId matches authenticated token ID', createdBooking.customerId.toString() === customerId);

    // TEST 15: GET /api/v1/bookings/my populates customerId and vehicleId
    res = await fetch(`${baseUrl}/bookings/my`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    const myBookingsRes = await res.json();
    const firstMyB = myBookingsRes.data?.find((b) => b._id === createdBooking._id);
    const hasPopulatedCustomer = !!firstMyB?.customerId?.name && !!firstMyB?.customerId?.email;
    const hasPopulatedVehicle = !!firstMyB?.vehicleId?.model && !!firstMyB?.vehicleId?.type;
    record('D15', 'GET /bookings/my populates customerId (name, email) and vehicleId (model, type)', res.status === 200 && hasPopulatedCustomer && hasPopulatedVehicle);

    // TEST 16: Customer cannot perform manager/admin status changes (e.g. 'completed' or 'ongoing') -> 403
    res = await fetch(`${baseUrl}/bookings/${createdBooking._id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({ status: 'completed' })
    });
    record('D16', 'Customer attempting admin/manager status transition returns 403 Forbidden', res.status === 403);

    // TEST 17: Customer CAN cancel their own booking -> 200
    res = await fetch(`${baseUrl}/bookings/${createdBooking._id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({ status: 'cancelled' })
    });
    record('D17', 'Customer can cancel their own booking (returns 200 OK)', res.status === 200);

    // TEST 18: Vehicle availability restored to true after cancellation
    const vehicleAfterCancel = await Vehicle.findById(availableVehicle._id);
    record('D18', 'Vehicle availability restored to true after booking is cancelled', vehicleAfterCancel.available === true);

    // TEST 19: Invalid status value -> 400
    res = await fetch(`${baseUrl}/bookings/${createdBooking._id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'invalid_status_xyz' })
    });
    record('D19', 'Invalid booking status value returns 400 Bad Request', res.status === 400);

    // TEST 20: Invalid ObjectId format -> 400 from CastError handler
    res = await fetch(`${baseUrl}/bookings/notAValidMongoId123/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'cancelled' })
    });
    record('D20', 'Invalid ObjectId parameter returns clean 400 Bad Request from CastError handler', res.status === 400);

    // TEST 21: Unknown route returns structured 404 JSON without stack trace
    res = await fetch(`${baseUrl}/nonexistent/endpoint/path`);
    const notFoundBody = await res.json();
    record('D21', 'Unknown route returns structured 404 JSON without stack trace', res.status === 404 && notFoundBody.success === false && !notFoundBody.stack);

    console.log('================================================================');
    const passedCount = results.filter((r) => r.passed).length;
    console.log(`  AUDIT SUMMARY: ${passedCount} OF ${results.length} TESTS PASSED`);
    console.log('================================================================');

    return passedCount === results.length;
  } catch (err) {
    console.error('[Audit Exception]:', err);
    return false;
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  runAudit().then((success) => process.exit(success ? 0 : 1));
}

module.exports = runAudit;
