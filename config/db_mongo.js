const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // If already connected, do nothing (Vercel optimization)
    if (mongoose.connection.readyState === 1) {
      return;
    }

    // We retrieve the URI from the environment variables
    const uri = process.env.MONGO_URI;
    
    if (!uri) {
        throw new Error("The MONGO_URI variable is missing!");
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Quick timeout (5s)
      socketTimeoutMS: 45000,
    });

    console.log("MongoDB successfully connected!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

module.exports = connectDB;