const express = require("express");
const router = express.Router();
const MassBookingModel = require("../models/massBookingModel");
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

// Get all mass bookings (admin)
router.get("/", async (req, res) => {
  try {
    const bookings = await MassBookingModel.getAllBookings();
    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching mass bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch mass bookings",
      error: error.message,
    });
  }
});

// Create new mass booking
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      startDate,
      preferredTime,
      intentionType,
      intentionDescription,
      numberOfDays,
      totalAmount,
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !startDate || !preferredTime || !intentionType || !intentionDescription || !numberOfDays || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check for Sunday 7:00 AM restriction
    const selectedDate = new Date(startDate);
    if (selectedDate.getDay() === 0 && preferredTime === "07:00") {
      return res.status(400).json({
        success: false,
        message: "Mass booking is not allowed for Sunday 7:00 AM. Please select another date or time.",
      });
    }

    const bookingId = await MassBookingModel.createBooking({
      name,
      email,
      phone,
      startDate,
      preferredTime,
      intentionType,
      intentionDescription,
      numberOfDays,
      totalAmount,
    });

    res.status(201).json({
      success: true,
      message: "Mass booking created successfully",
      data: { id: bookingId },
    });
  } catch (error) {
    console.error("Error creating mass booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create mass booking",
      error: error.message,
    });
  }
});

// Update booking status (admin)
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["unread", "read"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be unread or read",
      });
    }

    await MassBookingModel.updateBookingStatus(id, status);

    res.json({
      success: true,
      message: "Booking status updated successfully",
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking status",
      error: error.message,
    });
  }
});

// Submit payment details
router.post("/payment", upload.single("screenshot"), async (req, res) => {
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

    const paymentId = await MassBookingModel.submitPayment({
      name,
      email,
      phone,
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
router.get("/payments", async (req, res) => {
  try {
    const payments = await MassBookingModel.getAllPayments();
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
router.patch("/payments/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["unread", "read"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be unread or read",
      });
    }

    await MassBookingModel.updatePaymentStatus(id, status);

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

// Delete payment (admin)
router.delete("/payments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get payment details first to delete the file
    const payment = await MassBookingModel.getPaymentById(id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Delete the payment from database
    await MassBookingModel.deletePayment(id);

    // Try to delete the screenshot file
    const fs = require('fs');
    if (payment.screenshot_path && fs.existsSync(payment.screenshot_path)) {
      try {
        fs.unlinkSync(payment.screenshot_path);
      } catch (fileError) {
        console.error("Error deleting screenshot file:", fileError);
        // Continue even if file deletion fails
      }
    }

    res.json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete payment",
      error: error.message,
    });
  }
});

// Delete booking (admin)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get booking details first
    const booking = await MassBookingModel.getBookingById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Delete the booking from database
    await MassBookingModel.deleteBooking(id);

    res.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete booking",
      error: error.message,
    });
  }
});

module.exports = router;