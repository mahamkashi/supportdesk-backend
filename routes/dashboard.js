const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");

// GET /api/dashboard — Get ticket statistics
router.get("/", async (req, res) => {
  try {
    const total = await Ticket.countDocuments();
    const open = await Ticket.countDocuments({ status: "Open" });
    const inProgress = await Ticket.countDocuments({ status: "In Progress" });
    const resolved = await Ticket.countDocuments({ status: "Resolved" });
    const urgent = await Ticket.countDocuments({ isUrgent: true });

    res.json({ total, open, inProgress, resolved, urgent });
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching stats." });
  }
});

module.exports = router;
