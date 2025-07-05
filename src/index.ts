import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/user.routes";
import contentRoutes from "./routes/content.routes";
import brainRoutes from "./routes/brain.routes";
import tagRoutes from  "./routes/tag.routes"
import cors from "cors";
import previewRoutes from "./routes/preview.routes";

// Load environment variables
dotenv.config({
  path: "./.env",
});

if (!process.env.JWT_ACCESS_KEY) {
  console.error(
    "Fatal Error: JWT_ACCESS_KEY environment variable is not defined."
  );
  process.exit(1);
}
if (!process.env.JWT_ACCESS_EXPIRY) {
  console.error(
    "Fatal Error: JWT_ACCESS_EXPIRY environment variable is not defined."
  );
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error(
    "Fatal Error: MONGODB_URI environment variable is not defined."
  );
  process.exit(1);
}

if (!process.env.CORS_ORIGIN) {
  console.error(
    "Fatal Error: CORS_ORIGIN environment variable is not defined."
  );
  process.exit(1);
}


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN, 
  credentials: true, 
}));

//routes
app.use("/api/v1", userRoutes);
app.use("/api/v1", contentRoutes);
app.use("/api/v1", brainRoutes);
app.use("/api/v1", tagRoutes);
app.use("/api/v1", previewRoutes);


// test route
app.get("/", (req, res) => {
  res.send("API is running!");
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log("MongoDB connected successfully!");
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
