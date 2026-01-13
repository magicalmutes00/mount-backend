const express = require("express");
const router = express.Router();
const {
  createPrayer,
  getAllPrayers,
  deletePrayer,
} = require("../controllers/prayerController");

router.post("/", createPrayer);
router.get("/", getAllPrayers);
router.delete("/:id", deletePrayer);

module.exports = router;
