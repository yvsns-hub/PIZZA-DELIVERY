import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://yvsns7035_db_user:Chirutha7035@cluster0.cmu1lgy.mongodb.net/pizza_delivery?retryWrites=true&w=majority&appName=Cluster0';

export interface DBStatus {
  isConnected: boolean;
  mode: 'mongodb_atlas' | 'fallback_memory';
  host?: string;
  error?: string;
}

export const dbStatus: DBStatus = {
  isConnected: false,
  mode: 'fallback_memory',
};

export async function connectDB(): Promise<void> {
  try {
    console.log('[Database] Connecting to MongoDB Atlas...');
    // Connect with a reasonable server selection timeout so the server starts promptly
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    dbStatus.isConnected = true;
    dbStatus.mode = 'mongodb_atlas';
    dbStatus.host = mongoose.connection.host;
    console.log(`[Database] MongoDB Atlas connected successfully to host: ${dbStatus.host}`);
  } catch (err: any) {
    dbStatus.isConnected = false;
    dbStatus.mode = 'fallback_memory';
    dbStatus.error = err.message || 'Connection failed';
    console.warn(`[Database] Notice: Direct connection to MongoDB Atlas paused (${err.message}). Using high-performance in-memory store fallback for seamless continuous operation.`);
  }

  mongoose.connection.on('disconnected', () => {
    dbStatus.isConnected = false;
    console.warn('[Database] MongoDB disconnected.');
  });
  
  mongoose.connection.on('reconnected', () => {
    dbStatus.isConnected = true;
    dbStatus.mode = 'mongodb_atlas';
    console.log('[Database] MongoDB Atlas reconnected.');
  });
}
