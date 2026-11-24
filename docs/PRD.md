# Libman Product Requirements Document

## 1. Product Summary

Libman is a local library manager for cataloging books, managing members, and recording borrowing and return activity.

## 2. Goals

- Maintain a searchable digital book catalog.
- Record member details.
- Prevent duplicate active borrowing of the same book.
- Show borrowing history and members with no borrowing activity.
- Provide clear feedback for validation and conflicts.

## 3. Target Users

- Librarian or library administrator
- Staff member adding or editing catalog records
- Staff member issuing or returning books

## 4. Functional Requirements

### FR-1 Book catalog

The user can create, view, edit, delete, search, and seed books.

Acceptance criteria:

- Title and author are required.
- Search matches title or author case-insensitively.
- Search requests run after 300 ms of inactivity.
- Empty book search can offer sample-book seeding.
- Seeding returns 201 once and 409 after books already exist.

### FR-2 Book details and reviews

The user can view and edit a book and add embedded reviews.

Acceptance criteria:

- Reviews show a user, rating, and comment.
- Adding a review sends the complete updated review array.
- Invalid ObjectIds receive a 400 response.
- Missing books receive a 404 response.

### FR-3 Members

The user can create, view, edit, and delete members.

Acceptance criteria:

- Name and email are required.
- Duplicate emails receive 409.
- Missing members receive 404.
- Members with borrowing records cannot be deleted and receive 409.

### FR-4 Borrowing

The user can issue a book to a member and mark a borrowing returned.

Acceptance criteria:

- Member and book must exist.
- Invalid or fake book IDs receive clear 400/404 responses.
- A book cannot have a second active borrowing.
- Borrow dates use `YYYY-MM-DD`.
- Returning twice receives 409.

### FR-5 Borrowing overview

The user can see member, title, borrow date, and return status for all borrowings.

Acceptance criteria:

- Returned records show `Returned`.
- Active records show `Borrowed`.
- The idle-member section excludes members with borrowing rows.
- Deleted MongoDB books display `"Unknown book"`.

## 5. User Stories

| Actor | Story | Outcome |
|---|---|---|
| Librarian | Add a book | Book appears in the catalog |
| Librarian | Search for an author | Matching books appear after debounce |
| Librarian | Edit a book | Updated details persist |
| Librarian | Add a review | Review appears in book details |
| Librarian | Add a member | Member becomes available in borrowing forms |
| Librarian | Borrow a book | Active borrowing is recorded |
| Librarian | Return a book | Borrowing gets today's return date |
| Librarian | View idle members | Members without borrowings are listed |

## 6. UI Requirements

- Sticky navbar with Libman branding and active route states.
- Consistent cards, borders, hard shadows, and button states.
- Primary, secondary, and danger button variants.
- Visible input focus styles.
- Responsive layouts down to 360 px.
- Loading, empty, and error states.

## 7. Non-Functional Requirements

- The UI and API run on separate local development servers.
- API errors use meaningful JSON messages.
- SQLite foreign keys are enabled.
- MongoDB and SQLite startup dependencies are checked.
- No third-party UI component library is used.

## 8. Out of Scope

- Authentication and authorization
- Payments or overdue fees
- Email notifications
- Production hosting
- PostgreSQL/MySQL support
- React concepts demo page

## 9. Success Metrics

- All CRUD flows complete without a page refresh.
- Search updates after the debounce period.
- Duplicate, missing, and invalid operations receive intended status codes.
- The interface remains usable at 360 px width.
