const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      default: "Open",
    },
    // isUrgent is set by backend based on priority or description
    isUrgent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Auto-detect urgent before saving
ticketSchema.pre("save", function (next) {
  const descriptionHasUrgent = this.description
    .toLowerCase()
    .includes("urgent");
  const isHighPriority = this.priority === "High";
  this.isUrgent = isHighPriority || descriptionHasUrgent;
  next();
});

module.exports = mongoose.model("Ticket", ticketSchema);
