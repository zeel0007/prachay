import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Voucher } from '../models/Voucher.js';
import { Counter } from '../models/Counter.js';
import { config } from '../config/env.js';
import { connectDB } from '../config/db.js';

export const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Seeding database users and sample records...');

    // Clear existing data option if needed or check existing
    const directorExists = await User.findOne({ role: 'Director' });

    if (!directorExists) {
      // Create Director
      const director = await User.create({
        name: 'Rajesh Sharma (Director)',
        email: config.directorEmail,
        password: config.directorPassword,
        role: 'Director',
        department: 'Executive Management',
        employeeId: 'DIR-001',
      });
      console.log(`Director user created: ${director.email}`);
    } else {
      console.log('Director account already exists.');
    }

    const accountsExists = await User.findOne({ role: 'Accounts' });
    if (!accountsExists) {
      // Create Accounts user
      const accounts = await User.create({
        name: 'Anita Verma (Accounts Lead)',
        email: config.accountsEmail,
        password: config.accountsPassword,
        role: 'Accounts',
        department: 'Finance & Accounts',
        employeeId: 'ACC-001',
      });
      console.log(`Accounts user created: ${accounts.email}`);
    } else {
      console.log('Accounts user already exists.');
    }

    // Create sample Employee if none exists
    const employeeExists = await User.findOne({ role: 'Employee' });
    if (!employeeExists) {
      const emp1 = await User.create({
        name: 'Rahul Mehta',
        email: 'rahul.mehta@prachay.com',
        password: 'Employee@123',
        role: 'Employee',
        department: 'Equity Research',
        employeeId: 'EMP-101',
      });

      const emp2 = await User.create({
        name: 'Priya Nair',
        email: 'priya.nair@prachay.com',
        password: 'Employee@123',
        role: 'Employee',
        department: 'IT & Infrastructure',
        employeeId: 'EMP-102',
      });

      console.log('Sample employees created: rahul.mehta@prachay.com, priya.nair@prachay.com');

      // Create sample vouchers
      await Voucher.create([
        {
          voucherNumber: 'VOUCH-2026-0001',
          employee: emp1._id,
          employeeName: emp1.name,
          employeeId: emp1.employeeId,
          department: emp1.department,
          expenseTitle: 'Client Dinner & Advisory Meeting',
          expenseCategory: 'Meals & Refreshments',
          expenseDescription: 'Dinner with HNI clients for portfolio review.',
          amount: 4500,
          expenseDate: new Date('2026-10-01'),
          status: 'Approved',
          employeeSignatureUrl: '/uploads/signatures/sample-sig1.png',
          directorSignatureUrl: '/uploads/signatures/sample-dir-sig.png',
          approvedAt: new Date('2026-10-02'),
          submittedAt: new Date('2026-10-01'),
        },
        {
          voucherNumber: 'VOUCH-2026-0002',
          employee: emp1._id,
          employeeName: emp1.name,
          employeeId: emp1.employeeId,
          department: emp1.department,
          expenseTitle: 'Travel to NSE Regional Office',
          expenseCategory: 'Travel & Conveyance',
          expenseDescription: 'Cab fare for compliance verification.',
          amount: 1250,
          expenseDate: new Date('2026-10-05'),
          status: 'Pending Approval',
          employeeSignatureUrl: '/uploads/signatures/sample-sig1.png',
          submittedAt: new Date('2026-10-05'),
        },
        {
          voucherNumber: 'VOUCH-2026-0003',
          employee: emp2._id,
          employeeName: emp2.name,
          employeeId: emp2.employeeId,
          department: emp2.department,
          expenseTitle: 'Cloud Server Infrastructure Subscription',
          expenseCategory: 'Software & Tools',
          expenseDescription: 'Monthly AWS production server host charges.',
          amount: 18500,
          expenseDate: new Date('2026-10-08'),
          status: 'Approved',
          employeeSignatureUrl: '/uploads/signatures/sample-sig2.png',
          directorSignatureUrl: '/uploads/signatures/sample-dir-sig.png',
          approvedAt: new Date('2026-10-09'),
          submittedAt: new Date('2026-10-08'),
        },
        {
          voucherNumber: 'VOUCH-2026-0004',
          employee: emp2._id,
          employeeName: emp2.name,
          employeeId: emp2.employeeId,
          department: emp2.department,
          expenseTitle: 'Office Stationery Purchase',
          expenseCategory: 'Office Supplies',
          expenseDescription: 'Printer paper reams and ink cartridges.',
          amount: 3200,
          expenseDate: new Date('2026-10-10'),
          status: 'Draft',
        },
      ]);

      // Initialize Counter
      await Counter.findOneAndUpdate(
        { id: 'voucher_2026' },
        { seq: 4 },
        { upsert: true }
      );

      console.log('Sample vouchers seeded successfully.');
    }

    console.log('Database seeding process completed.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
      mongoose.connection.close();
      process.exit(0);
    }
  }
};

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase();
}
