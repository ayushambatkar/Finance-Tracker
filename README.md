# Expense Tracker

Simple full stack app to track personal expenses. Built with focus on correctness, real world behavior, and clean structure.

---

## Tech Stack

Backend
- Node.js + Express (TypeScript)
- Prisma ORM
- SQLite

Frontend
- React (simple UI, clean UX)

---

## Features

- Add expense (amount, category, description, date)
- View all expenses
- Filter by category
- Sort by date (newest first)
- Delete expense
- Total of visible expenses
- Summary per category

---

## Key Decisions

### 1. Money handling
Amounts are stored as integer (paise), not float.

Reason  
Floating point causes precision issues. Integer keeps totals correct.

---

### 2. Idempotency (very important)
Each create request uses an Idempotency-Key.

Reason  
Prevents duplicate entries when:
- user double clicks
- network retries
- page refresh happens after submit

Handled using:
- unique constraint in DB
- return existing record if key repeats

---

### 3. Database choice (SQLite)
Used SQLite with Prisma.

Reason  
- simple setup
- no external dependency
- enough for this scope
- easy to migrate later

---

### 4. Category as relation
Category stored as separate table, not string.

Reason  
- avoids duplication
- enables future features (analytics, grouping)
- better data consistency

---

### 5. Backend architecture

Structure:
- routes → HTTP layer
- controllers → request/response handling
- services → business logic
- repositories → database access

Reason  
- separation of concerns
- easier to maintain and extend
- follows clean architecture ideas

---

### 6. Sorting and filtering
Done at database level.

Reason  
- correct results
- avoids frontend inconsistencies
- scalable approach

---

### 7. Delete API
User can delete any expense.

Reason  
If user sees incorrect transaction, they should be able to remove it.

Delete is safe and idempotent.

---

## Real World Cases Handled

### Duplicate submissions
Handled using idempotency key and DB constraint.

---

### Network retries
Same request does not create duplicate data.

---

### Refresh after submit
Data persists, no duplicate insert.

---

### Validation
Backend enforces:
- amount must be > 0
- date required and valid
- category required

Frontend also validates for better UX.

---

### Concurrency
Handled via database constraints, not in-memory logic.

---

### Sorting correctness
Uses proper DateTime type and DB sorting.

---

### Category consistency
Categories normalized and stored via relation.

---

### Loading and error states (UI)
- disable submit during request
- show loading indicators
- show error messages
- allow retry

---

## Tests

Basic tests included:
- create expense with idempotency
- validation (invalid input fails)
- filtering and sorting

---

## Tradeoffs

- No authentication
- No pagination
- Total calculated on frontend (simpler)
- SQLite instead of production DB

Chosen to keep system simple and focused.

---

## What can be improved

- add user accounts
- pagination for large data
- backend aggregation for totals
- caching layer
- better analytics

---

## Setup

Install
npm install

Run migrations
npx prisma migrate dev

Seed data
npx prisma db seed

Start backend
npm run dev

Start frontend
npm run dev

---

## Note

Ensure compatibility with Prisma v7—account for breaking changes in client initialization, connection handling, and middleware usage when integrating with Express.