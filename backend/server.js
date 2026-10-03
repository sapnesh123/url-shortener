const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const urlRoutes = require("./routes/urlRoutes");

dotenv.config();

const app = express();

// Middleware


app.use(cors());
app.use(express.json());


// API Check


app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "URL Shortener API is running",
  });
});

// Routes

app.use("/", urlRoutes);

// 404 Handler

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global Error Handler

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  const status = err.status || err.statusCode || 500;

  res.status(status).json({
    success: false,
    message: status < 500 ? err.message : "Internal server error",
  });
});

// Start Server

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();