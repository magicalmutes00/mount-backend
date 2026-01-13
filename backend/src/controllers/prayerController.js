const pool = require("../db/db");

// CREATE prayer request
exports.createPrayer = async (req, res) => {
  try {
    const { name, email, prayer } = req.body;

    if (!name || !prayer) {
      return res.status(400).json({ message: "Name and prayer are required" });
    }

    const result = await pool.query(
      `INSERT INTO prayer_requests (name, email, prayer)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, email, prayer]
    );

    res.status(201).json({
      message: "Prayer request submitted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET all prayer requests (Admin)
exports.getAllPrayers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM prayer_requests ORDER BY created_at DESC"
    );

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE prayer request
exports.deletePrayer = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM prayer_requests WHERE id = $1", [id]);

    res.status(200).json({ message: "Prayer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
