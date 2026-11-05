import mongoose from 'mongoose';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/';

  try {
    console.log(`[Database] Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3500,
    });
    console.log('[Database] MongoDB connected successfully');
  } catch (err) {
    console.warn(`[Database] Standard MongoDB connection failed: ${err.message}`);
    console.log('[Database] Falling back to In-Memory MongoDB for seamless local development...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Connected to In-Memory MongoDB instance at ${memoryUri}`);
    } catch (memErr) {
      console.error('[Database] Fatal: Unable to initialize fallback database:', memErr.message);
      throw err;
    }
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (err) {
    console.error('[Database] Error closing connection:', err.message);
  }
};

