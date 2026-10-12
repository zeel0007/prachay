import mongoose from 'mongoose';
import { config } from './env.js';

export const connectDB = async (customUri) => {
  try {
    const uri = customUri || config.mongoUri;
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (config.nodeEnv !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};
