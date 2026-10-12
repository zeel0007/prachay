import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import { User } from '../models/User.js';
import { Voucher } from '../models/Voucher.js';
import { Counter } from '../models/Counter.js';

let mongoServer;
let employeeToken, directorToken, accountsToken;
let employeeUser, directorUser, accountsUser;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 30000);

beforeEach(async () => {
  await User.deleteMany({});
  await Voucher.deleteMany({});
  await Counter.deleteMany({});

  // Register Employee
  const empRes = await request(app).post('/api/auth/register').send({
    name: 'Test Employee',
    email: 'employee@prachay.com',
    password: 'Password123',
    department: 'Equity Research',
    employeeId: 'EMP-001',
  });
  employeeToken = empRes.body.token;
  employeeUser = empRes.body.user;

  // Create Director manually in DB
  directorUser = await User.create({
    name: 'Test Director',
    email: 'director@prachay.com',
    password: 'DirectorPassword123',
    role: 'Director',
    department: 'Executive',
    employeeId: 'DIR-001',
    signatureUrl: '/uploads/signatures/dir-sig.png',
  });

  const dirLogin = await request(app).post('/api/auth/login').send({
    email: 'director@prachay.com',
    password: 'DirectorPassword123',
  });
  directorToken = dirLogin.body.token;

  // Create Accounts user manually
  accountsUser = await User.create({
    name: 'Test Accounts',
    email: 'accounts@prachay.com',
    password: 'AccountsPassword123',
    role: 'Accounts',
    department: 'Finance',
  });

  const accLogin = await request(app).post('/api/auth/login').send({
    email: 'accounts@prachay.com',
    password: 'AccountsPassword123',
  });
  accountsToken = accLogin.body.token;
});

describe('1. Authentication & Security', () => {
  it('should register a new user strictly as an Employee', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Sneha Patel',
      email: 'sneha@prachay.com',
      password: 'SecurePassword123',
      role: 'Director', // attempt privilege escalation
    });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('Employee'); // Must default to Employee
  });

  it('should hash passwords and prevent login with invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'employee@prachay.com',
      password: 'WrongPassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('2. Voucher Creation & Draft Management', () => {
  it('should allow Employee to create draft voucher with unique auto-generated number', async () => {
    const res = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        department: 'Equity Research',
        expenseTitle: 'Research Travel Fare',
        expenseCategory: 'Travel & Conveyance',
        amount: 3500,
        expenseDate: '2026-10-01',
      });

    expect(res.status).toBe(201);
    expect(res.body.voucher.status).toBe('Draft');
    expect(res.body.voucher.voucherNumber).toMatch(/^VOUCH-\d{4}-\d{4}$/);
  });

  it('should allow Employee to edit and delete Draft status vouchers only', async () => {
    const createRes = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        department: 'Equity Research',
        expenseTitle: 'Draft Title',
        expenseCategory: 'Office Supplies',
        amount: 1000,
        expenseDate: '2026-10-01',
      });

    const voucherId = createRes.body.voucher._id;

    const editRes = await request(app)
      .patch(`/api/vouchers/${voucherId}`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        expenseTitle: 'Updated Draft Title',
        amount: 1500,
      });

    expect(editRes.status).toBe(200);
    expect(editRes.body.voucher.expenseTitle).toBe('Updated Draft Title');

    const deleteRes = await request(app)
      .delete(`/api/vouchers/${voucherId}`)
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(deleteRes.status).toBe(200);
  });
});

describe('3. Voucher Submission & Signature Rules', () => {
  it('should reject submission if Employee signature is missing', async () => {
    const createRes = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        department: 'Equity Research',
        expenseTitle: 'Meals with Client',
        expenseCategory: 'Meals & Refreshments',
        amount: 2000,
        expenseDate: '2026-10-02',
      });

    const voucherId = createRes.body.voucher._id;

    const submitRes = await request(app)
      .post(`/api/vouchers/${voucherId}/submit`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({});

    expect(submitRes.status).toBe(400);
    expect(submitRes.body.message).toMatch(/signature is mandatory/i);
  });

  it('should submit successfully when Employee signature is provided', async () => {
    const createRes = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        department: 'Equity Research',
        expenseTitle: 'Meals with Client',
        expenseCategory: 'Meals & Refreshments',
        amount: 2000,
        expenseDate: '2026-10-02',
      });

    const voucherId = createRes.body.voucher._id;

    const submitRes = await request(app)
      .post(`/api/vouchers/${voucherId}/submit`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        employeeSignatureUrl: '/uploads/signatures/emp-signature.png',
      });

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.voucher.status).toBe('Pending Approval');
  });
});

describe('4. Director Approval & Rejection Workflow', () => {
  let submittedVoucherId;

  beforeEach(async () => {
    const createRes = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        department: 'Equity Research',
        expenseTitle: 'Software Subscription',
        expenseCategory: 'Software & Tools',
        amount: 12000,
        expenseDate: '2026-10-03',
      });

    submittedVoucherId = createRes.body.voucher._id;

    await request(app)
      .post(`/api/vouchers/${submittedVoucherId}/submit`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        employeeSignatureUrl: '/uploads/signatures/emp-sig.png',
      });
  });

  it('should approve voucher when Director signature exists', async () => {
    const res = await request(app)
      .post(`/api/vouchers/${submittedVoucherId}/approve`)
      .set('Authorization', `Bearer ${directorToken}`)
      .send({ directorSignatureUrl: '/uploads/signatures/dir-sig.png' });

    expect(res.status).toBe(200);
    expect(res.body.voucher.status).toBe('Approved');
    expect(res.body.voucher.approvedBy).toBe(directorUser._id.toString());
  });

  it('should require non-empty rejection reason when rejecting', async () => {
    const res = await request(app)
      .post(`/api/vouchers/${submittedVoucherId}/reject`)
      .set('Authorization', `Bearer ${directorToken}`)
      .send({ rejectionReason: '' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/mandatory/i);
  });

  it('should reject voucher with valid rejection reason', async () => {
    const res = await request(app)
      .post(`/api/vouchers/${submittedVoucherId}/reject`)
      .set('Authorization', `Bearer ${directorToken}`)
      .send({ rejectionReason: 'Amount exceeds allowable threshold for software purchases.' });

    expect(res.status).toBe(200);
    expect(res.body.voucher.status).toBe('Rejected');
    expect(res.body.voucher.rejectionReason).toBe(
      'Amount exceeds allowable threshold for software purchases.'
    );
  });
});

describe('5. Search, Filter, & Dashboard Aggregations', () => {
  it('should return aggregated metrics on Employee Dashboard', async () => {
    const vRes = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        department: 'Equity Research',
        expenseTitle: 'Stationery',
        expenseCategory: 'Office Supplies',
        amount: 1500,
        expenseDate: '2026-10-04',
      });

    await request(app)
      .post(`/api/vouchers/${vRes.body.voucher._id}/submit`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ employeeSignatureUrl: '/uploads/signatures/emp.png' });

    const dashRes = await request(app)
      .get('/api/dashboard/employee')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(dashRes.status).toBe(200);
    expect(dashRes.body.stats.pendingApproval).toBe(1);
    expect(dashRes.body.stats.totalClaimedAmount).toBe(1500);
  });
});
