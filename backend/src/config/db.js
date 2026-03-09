const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_CONNECT);

    console.log(`✅ MongoDB Connected`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    throw error; // Let index.js handle it
  }
};

module.exports = connectDB;