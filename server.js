import express from "express";
import mongoose from "mongoose";
import { adminRoutes, eventsRoutes } from "./routes/routes.js";
import multer from "multer";
import errorHandler from "./middleware/errorHandler.js";
import cors from "cors";

const PORT = process.env.PORT || 5009;

// ✅ MongoDB connection string defined directly
const MONGO_URI = "mongodb+srv://khankkhalid25:YhMIHYskJsqg2l9x@cluster0.69m2s.mongodb.net/myDB?retryWrites=true&w=majority";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(multer().any());
app.use(cors());

// ✅ Database Connection Function
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected!");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// ✅ Connect to DB first, then start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to start server due to DB error:", err);
  });

// Routes
app.get("/", (_, res) => res.send("API is running"));
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventsRoutes);

// 404 Route
app.use((req, res) => res.status(404).send("Route not found"));

// Error Handler
app.use(errorHandler);
