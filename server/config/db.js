const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      console.log(`Connecting to specified MongoDB URI...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(` MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error(`❌ Failed to connect to specified MONGODB_URI: ${err.message}`);
      if (process.env.NODE_ENV === 'production') {
        console.error('❌ Fatal: In production, a valid MongoDB Atlas connection is required.');
        console.error('👉 Please check your MongoDB Atlas username, password, and ensure Network Access allows 0.0.0.0/0.');
        process.exit(1);
      }
      console.log(`Attempting fallback to MongoMemoryServer for local development...`);
    }
  }

  // Fallback or default embedded database
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create();
    const memoryUri = mongodInstance.getUri();
    console.log(` Starting embedded MongoDB instance...`);
    const conn = await mongoose.connect(memoryUri);
    console.log(` Embedded MongoDB active: ${conn.connection.host} (${memoryUri})`);
    return conn;
  } catch (err) {
    console.error(` Fatal: Could not connect to any MongoDB instance: ${err.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (err) {
    console.error('Error disconnecting database:', err);
  }
};

module.exports = { connectDB, disconnectDB };
