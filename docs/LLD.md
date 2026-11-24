# Libman Low-Level Design

## 1. MongoDB Book Model

```text
Book
- _id: ObjectId
- title: String, required
- author: String, required
- genre: String
- reviews: EmbeddedReview[]
- createdAt: Date
- updatedAt: Date
```

```text
EmbeddedReview
- user: String, required
- rating: Number, required, 1-5
- comment: String
```

## 2. SQLite Schema

```sql
members (
  member_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
)

borrowings (
  borrow_id INTEGER PRIMARY KEY,
  member_id INTEGER NOT NULL,
  book_id TEXT NOT NULL,
  borrow_date TEXT NOT NULL,
  return_date TEXT,
  FOREIGN KEY (member_id) REFERENCES members(member_id)
)
```

`book_id` is application-managed text containing a MongoDB ObjectId.

## 3. REST API Contracts

| Method | Route | Success | Conflict / Missing |
|---|---|---:|---|
| GET | `/api/books?search=` | 200 book array | 500 |
| GET | `/api/books/:id` | 200 book | 400 invalid ID, 404 missing |
| POST | `/api/books` | 201 book | 400 invalid input |
| PUT | `/api/books/:id` | 200 book | 400 invalid input/ID, 404 missing |
| DELETE | `/api/books/:id` | 204 | 400 invalid ID, 404 missing |
| POST | `/api/books/seed` | 201 `{ count }` | 409 if books exist |
| GET | `/api/members` | 200 member array | 500 |
| GET | `/api/members/:id` | 200 member | 404 missing |
| POST | `/api/members` | 201 member | 400 invalid, 409 duplicate email |
| PUT | `/api/members/:id` | 200 member | 400 invalid, 404 missing, 409 duplicate email |
| DELETE | `/api/members/:id` | 204 | 404 missing, 409 active history |
| POST | `/api/borrowings` | 201 borrowing | 400 invalid book ID, 404 member/book, 409 already borrowed |
| PATCH | `/api/borrowings/:id/return` | 200 returned date | 404 missing, 409 already returned |
| GET | `/api/borrowed` | 200 joined rows with title | 500 |
| GET | `/api/borrowed/idle-members` | 200 idle member array | 500 |

## 4. Server Modules

| Module | Main responsibility |
|---|---|
| `server.js` | Load environment variables, connect MongoDB/SQLite, listen |
| `src/app.js` | Configure CORS/JSON middleware and mount routers |
| `src/config/mongo.js` | Open Mongoose connection |
| `src/config/sqlite.js` | Open SQLite, enable foreign keys, create tables |
| `src/models/Book.js` | Define Book and embedded review schemas |
| `src/controllers/books.js` | Book CRUD and sample seeding |
| `src/controllers/members.js` | Member CRUD and validation |
| `src/controllers/borrowings.js` | Borrow and return operations |
| `src/controllers/borrowed.js` | SQLite joins and MongoDB title enrichment |
| `src/utils/seed.js` | Callback and Promise-based seed file readers |

## 5. Important Queries

### Member deletion guard

```sql
SELECT borrow_id
FROM borrowings
WHERE member_id = ?
LIMIT 1;
```

### Active duplicate guard

```sql
SELECT borrow_id
FROM borrowings
WHERE book_id = ? AND return_date IS NULL;
```

### Borrowed inner join

```sql
SELECT borrowings.borrow_id,
       borrowings.member_id,
       members.name,
       borrowings.book_id,
       borrowings.borrow_date,
       borrowings.return_date
FROM borrowings
INNER JOIN members ON members.member_id = borrowings.member_id;
```

### Idle-member left join

```sql
SELECT members.member_id, members.name, members.email
FROM members
LEFT JOIN borrowings ON borrowings.member_id = members.member_id
WHERE borrowings.borrow_id IS NULL;
```

## 6. Client Modules

| Module | Responsibility |
|---|---|
| `main.jsx` | Mount React under BrowserRouter |
| `App.jsx` | Navbar and page routes |
| `services/api.js` | Fetch wrapper and API functions |
| `pages/BooksPage.jsx` | Search, add, list, delete, seed |
| `pages/BookDetailPage.jsx` | Book details, edit, and reviews |
| `pages/MembersPage.jsx` | Member add, edit, list, delete |
| `pages/BorrowedPage.jsx` | Borrow form, borrowing table, idle members |
| `index.css` | Design tokens and responsive styles |

## 7. Error Handling

The fetch wrapper reads the server JSON message for non-success responses and throws an `Error`. Pages store the message in `error` state and show a consistent banner.

## 8. Concurrency and Consistency

SQLite guards active duplicate borrowing by checking `return_date IS NULL`. MongoDB book existence is checked before insertion. The two databases are not transactionally atomic across borrow operations, so API handlers validate all cross-database inputs before writing SQLite.
