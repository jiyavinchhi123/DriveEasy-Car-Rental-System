const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { Customer, Vehicle } = require('../models');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/driveeasy';

/**
 * Demo accounts data with environment-configurable or local default passwords
 */
const getDemoCustomers = async () => {
  const customerPwd = process.env.DEMO_CUSTOMER_PASSWORD || 'customer123';
  const managerPwd = process.env.DEMO_MANAGER_PASSWORD || 'manager123';
  const adminPwd = process.env.DEMO_ADMIN_PASSWORD || 'admin123';

  const [customerHash, managerHash, adminHash] = await Promise.all([
    bcrypt.hash(customerPwd, 10),
    bcrypt.hash(managerPwd, 10),
    bcrypt.hash(adminPwd, 10)
  ]);

  return [
    {
      name: 'Rahul Sharma (Customer)',
      email: 'customer@driveeasy.com',
      phone: '+91 9876543210',
      licenseNumber: 'DL-GJ06-20210001',
      passwordHash: customerHash,
      role: 'customer'
    },
    {
      name: 'Priya Patel (Fleet Manager)',
      email: 'manager@driveeasy.com',
      phone: '+91 9876543211',
      licenseNumber: 'DL-GJ06-20180002',
      passwordHash: managerHash,
      role: 'fleetManager'
    },
    {
      name: 'System Administrator',
      email: 'admin@driveeasy.com',
      phone: '+91 9876543212',
      licenseNumber: 'DL-GJ06-20150003',
      passwordHash: adminHash,
      role: 'admin'
    }
  ];
};

/**
 * Realistic demo vehicles across Hatchback, Sedan, and SUV types
 */
const DEMO_VEHICLES = [
  {
    model: 'Maruti Suzuki Swift',
    type: 'Hatchback',
    pricePerDay: 1800,
    available: true,
    registrationNumber: 'GJ-06-AB-1234'
  },
  {
    model: 'Hyundai i20 Asta',
    type: 'Hatchback',
    pricePerDay: 2000,
    available: true,
    registrationNumber: 'GJ-01-CD-5678'
  },
  {
    model: 'Honda City ZX',
    type: 'Sedan',
    pricePerDay: 2800,
    available: true,
    registrationNumber: 'GJ-23-EF-9012'
  },
  {
    model: 'Hyundai Verna SX',
    type: 'Sedan',
    pricePerDay: 2700,
    available: false,
    registrationNumber: 'GJ-06-GH-3456'
  },
  {
    model: 'Mahindra Scorpio-N',
    type: 'SUV',
    pricePerDay: 3500,
    available: true,
    registrationNumber: 'GJ-05-IJ-7890'
  },
  {
    model: 'Tata Harrier XZA',
    type: 'SUV',
    pricePerDay: 3800,
    available: true,
    registrationNumber: 'GJ-23-KL-2345'
  }
];

/**
 * Repeatable Seeding Function
 * Uses upsert operations to ensure execution never creates duplicate records
 */
const seedDatabase = async () => {
  // Safety rule: Never seed demo accounts automatically in production
  if (process.env.NODE_ENV === 'production') {
    console.error('[Seed Error] Database seeding is not permitted in production mode.');
    return;
  }

  try {
    console.log(`[Seed] Connecting to MongoDB: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected successfully.');

    // 1. Seed Demo Customers (Repeatable upsert by email)
    const demoCustomers = await getDemoCustomers();
    for (const cust of demoCustomers) {
      await Customer.findOneAndUpdate(
        { email: cust.email },
        { $set: cust },
        { upsert: true, new: true, runValidators: true }
      );
    }
    console.log(`[Seed] Successfully seeded ${demoCustomers.length} demonstration Customer accounts.`);

    // 2. Seed Demo Vehicles (Repeatable upsert by registrationNumber or model)
    for (const veh of DEMO_VEHICLES) {
      await Vehicle.findOneAndUpdate(
        { registrationNumber: veh.registrationNumber },
        { $set: veh },
        { upsert: true, new: true, runValidators: true }
      );
    }
    console.log(`[Seed] Successfully seeded ${DEMO_VEHICLES.length} fleet Vehicles.`);

    console.log('[Seed] Seeding completed successfully!');
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('[Seed] Database disconnected.');
  }
};

// Execute directly if run as a script
if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = seedDatabase;
