// Simple validation middleware for ticket creation

function validateTicket(req, res, next) {
  const { customerName, customerEmail, subject, description, priority } =
    req.body;

  const errors = [];

  if (!customerName || customerName.trim() === "") {
    errors.push("Customer name is required.");
  }

  if (!customerEmail || customerEmail.trim() === "") {
    errors.push("Customer email is required.");
  } else {
    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      errors.push("Customer email must be a valid email address.");
    }
  }

  if (!subject || subject.trim() === "") {
    errors.push("Subject is required.");
  }

  if (!description || description.trim().length < 10) {
    errors.push("Description must be at least 10 characters long.");
  }

  const validPriorities = ["Low", "Medium", "High"];
  if (!priority || !validPriorities.includes(priority)) {
    errors.push("Priority must be Low, Medium, or High.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}

module.exports = { validateTicket };
