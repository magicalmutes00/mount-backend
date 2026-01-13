const express = require("express");
const router = express.Router();
const DonationModel = require("../models/donationModel");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/donations"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "donation-" + uniqueSuffix + path.extname(file.originalname));
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

// Get donation purposes
router.get("/purposes", async (req, res) => {
  try {
    const purposes = await DonationModel.getDonationPurposes();
    res.json({
      success: true,
      data: purposes,
    });
  } catch (error) {
    console.error("Error fetching donation purposes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch donation purposes",
      error: error.message,
    });
  }
});

// Submit donation
router.post("/submit", upload.single("screenshot"), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      amount,
      purpose,
      utrNumber,
      notes,
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

    const donationId = await DonationModel.submitDonation({
      donorName: name,
      email: email || null,
      phone: phone || null,
      amount: parseFloat(amount),
      purpose,
      utrNumber,
      screenshotPath: req.file.path,
      screenshotName: req.file.filename,
      notes: notes || null,
    });

    res.status(201).json({
      success: true,
      message: "Donation submitted successfully",
      data: { id: donationId },
    });
  } catch (error) {
    console.error("Error submitting donation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit donation",
      error: error.message,
    });
  }
});

// Get all donations (admin)
router.get("/", async (req, res) => {
  try {
    const donations = await DonationModel.getAllDonations();
    res.json({
      success: true,
      data: donations,
    });
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch donations",
      error: error.message,
    });
  }
});

// Get donation statistics (admin)
router.get("/stats", async (req, res) => {
  try {
    const stats = await DonationModel.getDonationStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching donation statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch donation statistics",
      error: error.message,
    });
  }
});

// Update donation status (admin)
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "verified"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be pending or verified",
      });
    }

    await DonationModel.updateDonationStatus(id, status);

    res.json({
      success: true,
      message: "Donation status updated successfully",
    });
  } catch (error) {
    console.error("Error updating donation status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update donation status",
      error: error.message,
    });
  }
});

// Get donation by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const donation = await DonationModel.getDonationById(id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    res.json({
      success: true,
      data: donation,
    });
  } catch (error) {
    console.error("Error fetching donation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch donation",
      error: error.message,
    });
  }
});

// Delete donation (admin)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get donation details first to delete the file
    const donation = await DonationModel.getDonationById(id);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    // Delete the donation from database
    await DonationModel.deleteDonation(id);

    // Try to delete the screenshot file
    const fs = require('fs');
    if (donation.screenshot_path && fs.existsSync(donation.screenshot_path)) {
      try {
        fs.unlinkSync(donation.screenshot_path);
      } catch (fileError) {
        console.error("Error deleting screenshot file:", fileError);
        // Continue even if file deletion fails
      }
    }

    res.json({
      success: true,
      message: "Donation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting donation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete donation",
      error: error.message,
    });
  }
});

module.exports = router;