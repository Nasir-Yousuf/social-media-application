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
      console.warn(` Failed to connect to specified MONGODB_URI: ${err.message}`);
      console.log(`Attempting fallback to MongoMemoryServer...`);
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
