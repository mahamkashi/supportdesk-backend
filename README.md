# SupportDesk — Mini Customer Support Ticket System

A full-stack application to create, view, search, and manage customer support tickets.

---

## Technology Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose ODM
- **Validation:** Custom middleware (no third-party validation library)
- **Testing:** Jest + Supertest

---

## Project Structure

```
supportdesk-backend/
├── models/
│   └── Ticket.js          # MongoDB schema and urgent-ticket logic
├── routes/
│   ├── tickets.js         # All ticket CRUD routes
│   └── dashboard.js       # Dashboard statistics route
├── middleware/
│   └── validate.js        # Input validation middleware
├── tests/
│   └── ticket.test.js     # Automated tests
├── server.js              # App entry point
├── .env.example           # Environment variable template
└── README.md
```

---

## Setup Instructions

### 1. Prerequisites

- Node.js (v18+)
- MongoDB running locally (or a MongoDB Atlas connection string)

### 2. Install dependencies

```bash
cd supportdesk-backend
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and set your MongoDB connection string:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/supportdesk
```

### 4. Run the backend

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5000`.

---

## API Endpoint Summary

| Method | Endpoint                   | Description                        |
|--------|----------------------------|------------------------------------|
| GET    | /                          | Health check                       |
| POST   | /api/tickets               | Create a new ticket                |
| GET    | /api/tickets               | Get all tickets (search/filter)    |
| GET    | /api/tickets/:id           | Get a single ticket by ID          |
| PATCH  | /api/tickets/:id           | Update ticket details              |
| PATCH  | /api/tickets/:id/status    | Update only the ticket status      |
| GET    | /api/dashboard             | Get ticket statistics              |

### Query Parameters for GET /api/tickets

| Param    | Example          | Description                        |
|----------|------------------|------------------------------------|
| search   | ?search=Ali      | Search by name, email, or subject  |
| priority | ?priority=High   | Filter by priority                 |
| status   | ?status=Open     | Filter by status                   |
| sort     | ?sort=oldest     | Sort by date (newest or oldest)    |

---

## How to Run Tests

```bash
npm test
```

Tests cover:
- Urgent ticket detection (High priority)
- Urgent ticket detection (description contains "urgent")
- Non-urgent ticket
- Invalid status rejection
- Valid status update
- Short description rejection

> Note: Tests connect to `mongodb://localhost:27017/supportdesk_test` and clean up after themselves.

---

## Assumptions Made

1. **Authentication is not required** — the challenge spec confirms this.
2. **Ticket IDs** use MongoDB's default `_id` (ObjectId). The last 6 characters are shown in the UI as a short reference.
3. **Timestamps** (`createdAt`, `updatedAt`) are handled automatically by Mongoose using the `{ timestamps: true }` option.

---

## Duplicate Email Decision

**Decision: Allow the ticket but warn the user.**

When a new ticket is submitted with an email that already exists in the system, the API:
1. Still creates the ticket (does NOT block it).
2. Returns a `warning` field in the response with the count of previous tickets for that email.
3. The frontend displays this warning message to the user.
4. The ticket detail page also shows other tickets from the same customer.

**Why allow it?**
- A customer can have multiple separate issues. Blocking all of them because they reported one issue before would hurt usability.
- Linking tickets by email (showing previous tickets on the detail page) gives the support team the context they need without restricting submission.

**Downsides of this approach:**
- The database can grow if the same customer repeatedly submits tickets.
- A stricter system might want rate limiting per email.

---

## Initiative Feature: Customer Ticket History

On the ticket detail page, the system shows **all other tickets from the same customer email**. This means a support agent can immediately see if this customer has had previous issues, without leaving the current ticket.

**Why I chose this:**
- It directly solves a real problem: support agents waste time searching for a customer's history.
- It required no extra endpoints — the GET `/api/tickets/:id` route returns `previousTickets` alongside the ticket.

**What I would improve next:**
- Add a dedicated `/api/customers/:email/tickets` endpoint for a full customer history view.
- Add ticket tagging or notes so agents can leave internal comments.

---

## Known Limitations

- No pagination (all tickets are returned at once — fine for small datasets).
- No authentication or user roles.
- Tests require a local MongoDB instance running.

---

## What I Would Build Next

1. Pagination for the ticket list
2. Assign tickets to team members
3. Internal comments on tickets
4. Export tickets to CSV
5. Docker setup for easier local development

---

## Time Log

| Task                          | Time       |
|-------------------------------|------------|
| Planning and reading spec     | 30 min     |
| Backend setup + database      | 1 hr 30 min|
| Route handlers + validation   | 1 hr       |
| Frontend (React + Tailwind)   | 2 hr       |
| Testing                       | 45 min     |
| README + documentation        | 45 min     |
| **Total**                     | **6 hr 30 min** |

---

## Declaration

I confirm that I completed this challenge without using generative AI, an AI coding assistant, or an AI-enabled editor. I understand the submitted code and can explain and modify it.

---

## External References

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
