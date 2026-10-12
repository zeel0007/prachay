import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prachay_expense_db',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_key_prachay',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  directorEmail: process.env.DIRECTOR_EMAIL || 'director@prachay.com',
  directorPassword: process.env.DIRECTOR_PASSWORD || 'Director@123',
  accountsEmail: process.env.ACCOUNTS_EMAIL || 'accounts@prachay.com',
  accountsPassword: process.env.ACCOUNTS_PASSWORD || 'Accounts@123',
};
