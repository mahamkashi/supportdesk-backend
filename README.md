# SupportDesk — Mini Customer Support Ticket System

A full-stack web application that allows a company to create, organize, and manage customer support tickets. Built as part of a Software Engineering Internship Challenge.

---

## Project Overview

SupportDesk helps support teams manage customer complaints efficiently. Team members can create tickets, track their status, search and filter them, and identify urgent issues — all from a clean and simple interface.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose ODM |
| API Communication | Axios |
| Testing | Jest |
| Routing (Frontend) | React Router v6 |

---

## Project Structure

```
supportdesk-backend/               supportdesk-frontend/
├── models/                        ├── src/
│   └── Ticket.js                  │   ├── api/
├── routes/                        │   │   └── tickets.js
│   ├── tickets.js                 │   ├── pages/
│   └── dashboard.js               │   │   ├── Dashboard.jsx
├── middleware/                    │   │   ├── TicketList.jsx
│   └── validate.js                │   │   ├── CreateTicket.jsx
├── tests/                         │   │   └── TicketDetail.jsx
│   └── ticket.test.js             │   ├── App.jsx
├── server.js                      │   ├── main.jsx
├── .env.example                   │   └── index.css
└── README.md                      ├── index.html
                                   └── package.json
```

---

## Setup Instructions

### Prerequisites

- Node.js v18 or higher
- MongoDB (local) or a MongoDB Atlas account (free)

---

## Database Setup

### Option A — MongoDB Atlas (Recommended, Free)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account
2. Create a free **M0** cluster
3. Create a database user with a username and password
4. Allow your IP address under **Network Access**
5. Click **Connect → Drivers** and copy the connection string
6. It will look like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
   ```

### Option B — Local MongoDB

Install MongoDB Community Edition from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community) and run it locally.

---

## Backend — Setup & Run

```bash
# 1. Go into the backend folder
cd supportdesk-backend

# 2. Install dependencies
npm install

# 3. Create the environment file
cp .env.example .env
```

Open `.env` and fill in your values:

```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/supportdesk?retryWrites=true&w=majority
```

```bash
# 4. Start the backend server
npm run dev
```

You should see:
```
Connected to MongoDB
Server running on port 5000
```

---

## Frontend — Setup & Run

```bash
# 1. Go into the frontend folder
cd supportdesk-frontend

# 2. Install dependencies
npm install

# 3. Start the frontend
npm run dev
```

Open your browser at: **http://localhost:3000**

> Make sure the backend is running first on port 5000.

---

## How to Run Tests

```bash
cd supportdesk-backend
npm test
```

Expected output:
```
✓ Ticket with High priority should be marked urgent
✓ Ticket with 'urgent' in description should be marked urgent
✓ Ticket with Low priority should NOT be urgent
✓ Ticket status should only accept valid values
✓ Ticket status should update successfully to In Progress
✓ Ticket with short description should fail

Test Suites: 1 passed
Tests:       6 passed
```

> Note: Tests require a local MongoDB instance running at `mongodb://localhost:27017`. They use a separate test database (`supportdesk_test`) and clean up after themselves.

---

## API Endpoint Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/api/tickets` | Create a new ticket |
| GET | `/api/tickets` | Get all tickets (supports search, filter, sort) |
| GET | `/api/tickets/:id` | Get a single ticket by ID |
| PATCH | `/api/tickets/:id` | Update ticket details |
| PATCH | `/api/tickets/:id/status` | Update ticket status only |
| GET | `/api/dashboard` | Get ticket statistics |

### Query Parameters — GET /api/tickets

| Parameter | Example | Description |
|-----------|---------|-------------|
| `search` | `?search=Ali` | Search by name, email, or subject |
| `priority` | `?priority=High` | Filter by priority |
| `status` | `?status=Open` | Filter by status |
| `sort` | `?sort=oldest` | Sort by date (newest or oldest) |

### Example Requests

```bash
# Create a ticket
POST http://localhost:5000/api/tickets
Content-Type: application/json

{
  "customerName": "Ali Khan",
  "customerEmail": "ali@example.com",
  "subject": "Cannot log in",
  "description": "I am unable to log in to my account since yesterday.",
  "priority": "High"
}

# Update status
PATCH http://localhost:5000/api/tickets/:id/status
Content-Type: application/json

{ "status": "In Progress" }
```

---

## Assumptions Made

1. **No authentication required** — The challenge spec confirmed this. In a real system, there would be admin and customer roles.
2. **MongoDB ObjectId as Ticket ID** — MongoDB's built-in `_id` is used as the unique ticket identifier. The last 6–8 characters are shown in the UI as a short reference number.
3. **Timestamps auto-managed** — `createdAt` and `updatedAt` are handled automatically by Mongoose using `{ timestamps: true }`.
4. **Urgent detection on every save** — The `isUrgent` field is recalculated every time a ticket is saved, so updating the description or priority will re-evaluate urgency automatically.
5. **No pagination** — All tickets are returned at once. This is acceptable for a small dataset.

---

## Duplicate Email Decision

**Decision: Allow the ticket but warn the user.**

When a new ticket is submitted with an email that already exists in the system:
1. The ticket is **still created** — it is NOT blocked
2. The API returns a `warning` message with the count of previous tickets for that email
3. The frontend displays this warning to the user
4. The ticket detail page also shows all other tickets from the same customer

**Why this approach?**

A customer can have multiple separate issues. Blocking a new ticket just because they submitted one previously would hurt usability — imagine a customer whose payment fails AND their account gets locked on the same day.

**Trade-offs:**
- ✅ Better usability — no unnecessary blocking
- ✅ Context is still visible (previous tickets shown on detail page)
- ❌ Could allow ticket spam from the same email
- ❌ No rate limiting — a determined user could flood the system

**What I would add next:** Rate limiting per email (max 5 tickets per hour) to prevent abuse.

---

## Initiative Feature — Customer Ticket History

On the ticket detail page, the system automatically shows **all other tickets from the same customer email** at the bottom of the page.

**What it does:**
A support agent viewing any ticket can instantly see if that customer has had previous issues — without leaving the current page or doing a manual search.

**Why I chose this:**
This solves a real problem: support agents waste time manually searching for a customer's history while the customer is waiting. By surfacing this automatically, agents have full context in seconds.

**How it works:**
The `GET /api/tickets/:id` endpoint returns both the ticket AND a `previousTickets` array — fetched in a single database query using `customerEmail` as the key.

**What I would improve further:**
- A dedicated customer profile page showing full history
- Ability to link or merge related tickets
- Internal notes/comments per ticket

---

## Known Limitations

- No user authentication or role-based access
- No pagination (all tickets loaded at once)
- No email notifications when status changes
- Tests require a local MongoDB instance (not an in-memory mock)
- No rate limiting on ticket submission

---

## What I Would Build Next

1. **Authentication** — Admin login and customer portal with separate access levels
2. **Pagination** — Load tickets in pages for large datasets
3. **Email notifications** — Notify customer when their ticket status changes
4. **Ticket assignment** — Assign tickets to specific team members
5. **Comments/notes** — Internal comments on tickets for team collaboration
6. **CSV export** — Download ticket data as a spreadsheet
7. **Docker setup** — Containerize the app for easier deployment

---

## Time Log

| Task | Time |
|------|------|
| Planning and reading the spec | 30 min |
| Backend setup and database | 1 hr 30 min |
| Route handlers and validation | 1 hr |
| Frontend (React + Tailwind) | 2 hr |
| Testing | 45 min |
| README and documentation | 45 min |
| **Total** | **6 hr 30 min** |

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
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
