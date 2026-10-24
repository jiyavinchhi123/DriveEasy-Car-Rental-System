const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Customer, Vehicle, Booking } = require('../models');

/**
 * Pre-hashed bcrypt passwords for seed accounts
 * Password 'customer123', 'manager123', 'admin123'
 */
const HASHED_CUSTOMER_PWD = bcrypt.hashSync('customer123', 10);
const HASHED_MANAGER_PWD = bcrypt.hashSync('manager123', 10);
const HASHED_ADMIN_PWD = bcrypt.hashSync('admin123', 10);

const SEED_CUSTOMERS = [
  {
    _id: new mongoose.Types.ObjectId('654321654321654321000001'),
    name: 'Rahul Sharma (Customer)',
    email: 'customer@driveeasy.com',
    password: HASHED_CUSTOMER_PWD,
    role: 'customer',
    phone: '+91 9876543210'
  },
  {
    _id: new mongoose.Types.ObjectId('654321654321654321000002'),
    name: 'Priya Patel (Fleet Manager)',
    email: 'manager@driveeasy.com',
    password: HASHED_MANAGER_PWD,
    role: 'fleet_manager',
    phone: '+91 9876543211'
  },
  {
    _id: new mongoose.Types.ObjectId('654321654321654321000003'),
    name: 'System Administrator',
    email: 'admin@driveeasy.com',
    password: HASHED_ADMIN_PWD,
    role: 'admin',
    phone: '+91 9876543212'
  }
];

const SEED_VEHICLES = [
  {
    _id: new mongoose.Types.ObjectId('654321654321654321000011'),
    model: 'Maruti Suzuki Swift',
    type: 'Hatchback',
    pricePerDay: 1800,
    available: true,
    registrationNumber: 'GJ-06-AB-1234',
    fuelType: 'Petrol'
  },
  {
    _id: new mongoose.Types.ObjectId('654321654321654321000012'),
    model: 'Hyundai i20 Asta',
    type: 'Hatchback',
    pricePerDay: 2000,
    available: true,
    registrationNumber: 'GJ-01-CD-5678',
    fuelType: 'Petrol'
  },
  {
    _id: new mongoose.Types.ObjectId('654321654321654321000013'),
    model: 'Honda City ZX',
    type: 'Sedan',
    pricePerDay: 2800,
    available: true,
    registrationNumber: 'GJ-23-EF-9012',
    fuelType: 'Petrol'
  },
  {
    _id: new mongoose.Types.ObjectId('654321654321654321000014'),
    model: 'Hyundai Verna SX',
    type: 'Sedan',
    pricePerDay: 2700,
    available: false,
    registrationNumber: 'GJ-06-GH-3456',
    fuelType: 'Diesel'
  },
  {
    _id: new mongoose.Types.ObjectId('654321654321654321000015'),
    model: 'Mahindra Scorpio-N',
    type: 'SUV',
    pricePerDay: 3500,
    available: true,
    registrationNumber: 'GJ-05-IJ-7890',
    fuelType: 'Diesel'
  },
  {
    _id: new mongoose.Types.ObjectId('654321654321654321000016'),
    model: 'Tata Harrier XZA',
    type: 'SUV',
    pricePerDay: 3800,
    available: true,
    registrationNumber: 'GJ-23-KL-2345',
    fuelType: 'Diesel'
  }
];

// Fallback in-memory active state when MongoDB daemon is not running locally
let memoryCustomers = [...SEED_CUSTOMERS];
let memoryVehicles = [...SEED_VEHICLES];
let memoryBookings = [];

/**
 * Initialize seed data into MongoDB if connected
 */
const seedDatabaseIfConnected = async () => {
  // Confirm demo seeding is NOT automatically enabled in production
  if (process.env.NODE_ENV === 'production') {
    console.log('[Seed] Production environment detected; skipping automatic database seeding.');
    return;
  }

  if (mongoose.connection.readyState !== 1) {
    return;
  }

  try {
    const customerCount = await Customer.countDocuments();
    if (customerCount === 0) {
      await Customer.insertMany(SEED_CUSTOMERS);
      console.log('[Seed] Seeded default Customer accounts into MongoDB');
    }

    const vehicleCount = await Vehicle.countDocuments();
    if (vehicleCount === 0) {
      await Vehicle.insertMany(SEED_VEHICLES);
      console.log('[Seed] Seeded default Vehicles fleet into MongoDB');
    }
  } catch (err) {
    console.warn(`[Seed Warning] Could not seed MongoDB: ${err.message}`);
  }
};

/**
 * Customer Authentication query
 */
const findCustomerByEmail = async (email) => {
  if (mongoose.connection.readyState === 1) {
    return await Customer.findOne({ email: email.toLowerCase().trim() });
  }
  return memoryCustomers.find((c) => c.email.toLowerCase() === email.toLowerCase().trim()) || null;
};

const findCustomerById = async (id) => {
  if (mongoose.connection.readyState === 1) {
    return await Customer.findById(id).select('-password');
  }
  const cust = memoryCustomers.find((c) => c._id.toString() === id.toString());
  if (cust) {
    const { password, ...safe } = cust;
    return safe;
  }
  return null;
};

/**
 * Vehicle queries
 */
const findVehicles = async (typeFilter) => {
  if (mongoose.connection.readyState === 1) {
    const query = typeFilter ? { type: new RegExp(`^${typeFilter}$`, 'i') } : {};
    return await Vehicle.find(query);
  }

  if (typeFilter) {
    return memoryVehicles.filter((v) => v.type.toLowerCase() === typeFilter.toLowerCase());
  }
  return memoryVehicles;
};

const findVehicleById = async (id) => {
  if (mongoose.connection.readyState === 1) {
    return await Vehicle.findById(id);
  }
  return memoryVehicles.find((v) => v._id.toString() === id.toString()) || null;
};

const updateVehicleAvailability = async (id, available) => {
  if (mongoose.connection.readyState === 1) {
    return await Vehicle.findByIdAndUpdate(id, { available }, { new: true });
  }
  const v = memoryVehicles.find((item) => item._id.toString() === id.toString());
  if (v) {
    v.available = available;
    return v;
  }
  return null;
};

/**
 * Booking queries
 */
const createBooking = async (bookingData) => {
  if (mongoose.connection.readyState === 1) {
    const booking = await Booking.create(bookingData);
    await Vehicle.findByIdAndUpdate(bookingData.vehicleId, { available: false });
    return booking;
  }

  const newBooking = {
    _id: new mongoose.Types.ObjectId(),
    ...bookingData,
    status: 'reserved',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  memoryBookings.push(newBooking);

  // Mark vehicle unavailable
  const vehicle = memoryVehicles.find((v) => v._id.toString() === bookingData.vehicleId.toString());
  if (vehicle) {
    vehicle.available = false;
  }

  return newBooking;
};

const findBookingsByCustomer = async (customerId) => {
  if (mongoose.connection.readyState === 1) {
    return await Booking.find({ customerId })
      .populate('customerId', 'name email')
      .populate('vehicleId', 'model type')
      .sort({ createdAt: -1 });
  }

  // Memory populate
  return memoryBookings
    .filter((b) => b.customerId.toString() === customerId.toString())
    .map((b) => {
      const cust = memoryCustomers.find((c) => c._id.toString() === b.customerId.toString());
      const veh = memoryVehicles.find((v) => v._id.toString() === b.vehicleId.toString());

      return {
        ...b,
        customerId: cust ? { _id: cust._id, name: cust.name, email: cust.email } : b.customerId,
        vehicleId: veh ? { _id: veh._id, model: veh.model, type: veh.type } : b.vehicleId
      };
    })
    .reverse();
};

const findBookingById = async (id) => {
  if (mongoose.connection.readyState === 1) {
    return await Booking.findById(id);
  }
  return memoryBookings.find((b) => b._id.toString() === id.toString()) || null;
};

const updateBookingStatus = async (id, status) => {
  if (mongoose.connection.readyState === 1) {
    const updated = await Booking.findByIdAndUpdate(id, { status }, { new: true })
      .populate('customerId', 'name email')
      .populate('vehicleId', 'model type');

    // If cancelled or completed, release vehicle availability
    if (updated && (status === 'cancelled' || status === 'completed')) {
      await Vehicle.findByIdAndUpdate(updated.vehicleId?._id || updated.vehicleId, { available: true });
    }

    return updated;
  }

  const b = memoryBookings.find((item) => item._id.toString() === id.toString());
  if (b) {
    b.status = status;
    b.updatedAt = new Date();

    if (status === 'cancelled' || status === 'completed') {
      const veh = memoryVehicles.find((v) => v._id.toString() === b.vehicleId.toString());
      if (veh) veh.available = true;
    }

    const cust = memoryCustomers.find((c) => c._id.toString() === b.customerId.toString());
    const veh = memoryVehicles.find((v) => v._id.toString() === b.vehicleId.toString());

    return {
      ...b,
      customerId: cust ? { _id: cust._id, name: cust.name, email: cust.email } : b.customerId,
      vehicleId: veh ? { _id: veh._id, model: veh.model, type: veh.type } : b.vehicleId
    };
  }
  return null;
};

module.exports = {
  seedDatabaseIfConnected,
  findCustomerByEmail,
  findCustomerById,
  findVehicles,
  findVehicleById,
  updateVehicleAvailability,
  createBooking,
  findBookingsByCustomer,
  findBookingById,
  updateBookingStatus
};
