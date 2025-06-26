import mongoose from "mongoose";

// Global variable to track connection promise
let isConnecting = false;

const MongoConnect = async () => {
  const uri = process.env.NEXT_MONGOOSE_URL;

  if (!uri) {
    throw new Error("Environment variable NEXT_MONGOOSE_URL is not set");
  }

  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // If currently connecting, wait for it to complete
  if (isConnecting) {
    while (mongoose.connection.readyState === 2) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return;
  }

  try {
    isConnecting = true;

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      connectTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 30000, // 30 seconds
      maxPoolSize: 10, // Maximum number of connections
      retryWrites: true,
      w: "majority",
      authSource: "admin", // Specify auth database
      bufferCommands: true, // Enable command buffering
    });

    console.log("MongoDB connected successfully");

    // Handle connection events
    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      isConnecting = false;
    });

    isConnecting = false;
  } catch (error) {
    isConnecting = false;
    console.error("MongoDB connection error:", error);
    throw error; // Re-throw to handle in calling function
  }
};

export default MongoConnect;
