const mongoose = require("mongoose");
const Ticket = require("../models/Ticket");

// We use an in-memory approach — no real DB needed for these unit tests

beforeAll(async () => {
  await mongoose.connect("mongodb://localhost:27017/supportdesk_test");
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await Ticket.deleteMany();
});

// Test 1: Urgent ticket detection — High priority
test("Ticket with High priority should be marked urgent", async () => {
  const ticket = new Ticket({
    customerName: "Ali Khan",
    customerEmail: "ali@example.com",
    subject: "Login issue",
    description: "I cannot log in to my account at all.",
    priority: "High",
  });

  await ticket.save();
  expect(ticket.isUrgent).toBe(true);
});

// Test 2: Urgent ticket detection — description contains "urgent"
test("Ticket with 'urgent' in description should be marked urgent", async () => {
  const ticket = new Ticket({
    customerName: "Sara Ahmed",
    customerEmail: "sara@example.com",
    subject: "Payment failure",
    description: "This is URGENT! My payment failed and I need help now.",
    priority: "Low",
  });

  await ticket.save();
  expect(ticket.isUrgent).toBe(true);
});

// Test 3: Non-urgent ticket
test("Ticket with Low priority and no 'urgent' keyword should NOT be urgent", async () => {
  const ticket = new Ticket({
    customerName: "John Doe",
    customerEmail: "john@example.com",
    subject: "Feature request",
    description: "I would like to see a dark mode option in the app.",
    priority: "Low",
  });

  await ticket.save();
  expect(ticket.isUrgent).toBe(false);
});

// Test 4: Status update — only valid statuses allowed
test("Ticket status should only accept valid values", async () => {
  const ticket = new Ticket({
    customerName: "Zara Malik",
    customerEmail: "zara@example.com",
    subject: "Bug report",
    description: "The dashboard crashes when I click on a ticket.",
    priority: "Medium",
    status: "InvalidStatus", // invalid value
  });

  await expect(ticket.save()).rejects.toThrow();
});

// Test 5: Status update to valid value
test("Ticket status should update successfully to In Progress", async () => {
  const ticket = new Ticket({
    customerName: "Hamza Raza",
    customerEmail: "hamza@example.com",
    subject: "Slow loading",
    description: "The application is loading very slowly on my machine.",
    priority: "Medium",
  });

  await ticket.save();
  ticket.status = "In Progress";
  await ticket.save();

  expect(ticket.status).toBe("In Progress");
});

// Test 6: Input validation — description too short
test("Ticket with description shorter than 10 characters should fail", async () => {
  const ticket = new Ticket({
    customerName: "Omar Sheikh",
    customerEmail: "omar@example.com",
    subject: "Issue",
    description: "Short", // less than 10 characters
    priority: "Low",
  });

  await expect(ticket.save()).rejects.toThrow();
});
