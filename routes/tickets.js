const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const { validateTicket } = require("../middleware/validate");

// POST /api/tickets — Create a new ticket
router.post("/", validateTicket, async (req, res) => {
  try {
    const { customerName, customerEmail, subject, description, priority } =
      req.body;

    // Check how many tickets already exist for this email (duplicate email decision)
    // Decision: We ALLOW duplicate emails but warn the frontend how many previous tickets exist.
    // Reason: A customer can have multiple issues. Blocking would hurt usability.
    const existingCount = await Ticket.countDocuments({
      customerEmail: customerEmail.toLowerCase(),
    });

    const ticket = new Ticket({
      customerName,
      customerEmail,
      subject,
      description,
      priority,
    });

    await ticket.save();

    res.status(201).json({
      ticket,
      warning:
        existingCount > 0
          ? `This email already has ${existingCount} existing ticket(s).`
          : null,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error while creating ticket." });
  }
});

// GET /api/tickets — Get all tickets with search, filter, sort
router.get("/", async (req, res) => {
  try {
    const { search, priority, status, sort } = req.query;

    // Build filter object
    const filter = {};

    if (priority) filter.priority = priority;
    if (status) filter.status = status;

    // Search by name, email, or subject
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    // Sort: newest first by default
    const sortOrder = sort === "oldest" ? 1 : -1;

    const tickets = await Ticket.find(filter).sort({ createdAt: sortOrder });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching tickets." });
  }
});

// GET /api/tickets/:id — Get a single ticket by ID
router.get("/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    // Also return previous tickets for the same email
    const previousTickets = await Ticket.find({
      customerEmail: ticket.customerEmail,
      _id: { $ne: ticket._id },
    }).select("subject status createdAt");

    res.json({ ticket, previousTickets });
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching ticket." });
  }
});

// PATCH /api/tickets/:id — Update full ticket details
router.patch("/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found." });

    const allowed = [
      "customerName",
      "customerEmail",
      "subject",
      "description",
      "priority",
      "status",
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) ticket[field] = req.body[field];
    });

    await ticket.save(); // pre-save hook re-checks isUrgent

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: "Server error while updating ticket." });
  }
});

// PATCH /api/tickets/:id/status — Update only the status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Open", "In Progress", "Resolved"];

    if (!status || !validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ error: "Status must be Open, In Progress, or Resolved." });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found." });

    ticket.status = status;
    await ticket.save(); // updatedAt is handled by mongoose timestamps

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: "Server error while updating status." });
  }
});

module.exports = router;
