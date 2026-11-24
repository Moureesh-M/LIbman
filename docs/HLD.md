# Libman High-Level Design

## 1. Overview

Libman is a full-stack library management application with a React single-page client and an Express API. MongoDB stores books and embedded reviews. SQLite stores members and borrowing records.

## 2. System Context

```text
Browser
  |
  | HTTP/JSON
  v
React Client
  |
  | REST API
  v
Express API
  |               |
  | Mongoose      | better-sqlite3
  v               v
MongoDB         SQLite
```

## 3. Components

| Component | Responsibility |
|---|---|
| React Client | Routes, forms, cards, debounced search, API calls |
| Express API | Validation, routing, HTTP responses, service coordination |
| MongoDB | Book CRUD and embedded review storage |
| SQLite | Member CRUD and borrowing state |
| Join Endpoint | Combines member and borrowing rows, then enriches rows with MongoDB titles |

## 4. Data Ownership

- MongoDB owns books and reviews.
- SQLite owns members and borrowings.
- `borrowings.book_id` stores a MongoDB ObjectId as text.
- The API performs application-level book validation because SQLite cannot enforce a MongoDB foreign key.

## 5. Core Flows

### Search books

1. React waits 300 ms after the latest search input.
2. Express receives `GET /api/books?search=`.
3. MongoDB applies an escaped, case-insensitive title/author filter.
4. React replaces its book list.

### Borrow a book

1. React submits member and book IDs.
2. Express validates the member in SQLite.
3. Express validates the book ID and looks up the book in MongoDB.
4. SQLite rejects an active duplicate borrowing.
5. SQLite creates the borrowing with today's date.

### Return a book

1. Express finds the borrowing in SQLite.
2. It rejects missing or already-returned records.
3. It sets `return_date` to today's date.

### Build borrowed view

1. SQLite inner joins borrowings to members.
2. Express collects unique book IDs.
3. MongoDB returns matching book titles in one query.
4. Express adds `"Unknown book"` for deleted books.

## 6. Design Decisions

- React uses native hooks and fetch rather than Redux or UI libraries.
- Reviews are embedded in books because they are normally read and updated with their parent book.
- SQLite uses foreign-key enforcement for member relationships.
- The API uses controlled status codes: 400 for bad input, 404 for missing records, 409 for conflicts, and 500 for server failures.
- CORS is enabled for the local Vite client.

## 7. Non-Functional Requirements

- Support desktop and mobile layouts down to 360 px.
- Search remains responsive through request debounce.
- Seed data can only be inserted once.
- API responses use JSON.
- Database and server startup failures are reported clearly.
- UI loading and error states are visible.

## 8. Deployment View

Development deployment uses Vite on port 5173 and Express on port 5000. MongoDB runs locally, while SQLite uses `data/library.db`.
