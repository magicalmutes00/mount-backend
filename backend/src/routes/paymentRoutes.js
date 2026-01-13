const express = require("express");
const router = express.Router();
const PaymentModel = require("../models/paymentModel");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/payments"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "payment-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Submit payment details (for both donations and mass bookings)
router.post("/submit", upload.single("screenshot"), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      amount,
      purpose,
      utrNumber,
      massDetails,
    } = req.body;

    // Validate required fields
    if (!name || !amount || !purpose || !utrNumber) {
      return res.status(400).json({
        success: false,
        message: "Name, amount, purpose, and UTR number are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Payment screenshot is required",
      });
    }

    // Parse mass details if provided
    let parsedMassDetails = null;
    if (massDetails) {
      try {
        parsedMassDetails = JSON.parse(massDetails);
      } catch (e) {
        console.error("Error parsing mass details:", e);
      }
    }

    const paymentId = await PaymentModel.submitPayment({
      name,
      email: email || null,
      phone: phone || null,
      amount: parseFloat(amount),
      purpose,
      utrNumber,
      screenshotPath: req.file.path,
      screenshotName: req.file.filename,
      massDetails: parsedMassDetails,
    });

    res.status(201).json({
      success: true,
      message: "Payment details submitted successfully",
      data: { id: paymentId },
    });
  } catch (error) {
    console.error("Error submitting payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit payment details",
      error: error.message,
    });
  }
});

// Get all payments (admin)
router.get("/", async (req, res) => {
  try {
    const payments = await PaymentModel.getAllPayments();
    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
});

// Update payment status (admin)
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "verified", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be pending, verified, or rejected",
      });
    }

    await PaymentModel.updatePaymentStatus(id, status);

    res.json({
      success: true,
      message: "Payment status updated successfully",
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message,
    });
  }
});

// Get payment by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await PaymentModel.getPaymentById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment",
      error: error.message,
    });
  }
});

module.exports = router;