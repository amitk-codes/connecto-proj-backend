import express from "express";

const router = express.Router();

// API Service Health Route
router.get('/', async (req, res) => {
  res.status(200).json({
    status: "Up",
    message: "API Service is running healthy",
    timestamp: new Date().toISOString(),
  });
})

export default router;