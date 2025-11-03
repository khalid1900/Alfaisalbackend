import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import { adminRoutes, eventsRoutes } from "./routes/routes.js";
import multer from "multer";
import errorHandler from "./middleware/errorHandler.js";
import cors from "cors";

const PORT = process.env.PORT || 5009;

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(multer().any());
app.use(cors());

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB connected!`);
  } catch (error) {
    console.log(`❌ MongoDB connection error:`, error);
    process.exit(1);
  }
};

// Routes
app.get("/", (_, res) => res.send("API is running"));
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventsRoutes);

// 404 Route
app.use((req, res) => res.status(404).send("Route not found"));

// Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  await connectDB();
});