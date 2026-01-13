const express = require("express");
const router = express.Router();
const {
  createTestimony,
  getApprovedTestimonies,
  getAllTestimonies,
  getPendingTestimonies,
  updateTestimonyStatus,
  deleteTestimony,
} = require("../controllers/testimonyController");

// Public routes
router.post("/", createTestimony);
router.get("/approved", getApprovedTestimonies);

// Admin routes
router.get("/admin", getAllTestimonies);
router.get("/pending", getPendingTestimonies);
router.put("/:id", updateTestimonyStatus);
router.delete("/:id", deleteTestimony);

module.exports = router;
