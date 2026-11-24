const mongoose = require("mongoose");
const Book = require("../models/Book");
const sqlite = require("../config/sqlite");

async function borrowBook(req, res) {
  const { member_id, book_id } = req.body;

  try {
    const db = sqlite.getDb();
    const member = db.prepare(
      "SELECT member_id FROM members WHERE member_id = ?"
    ).get(member_id);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (!mongoose.isValidObjectId(book_id)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const book = await Book.findById(book_id).lean();
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const activeBorrowing = db.prepare(
      "SELECT borrow_id FROM borrowings WHERE book_id = ? AND return_date IS NULL"
    ).get(book_id);

    if (activeBorrowing) {
      return res.status(409).json({ message: "Book is already borrowed" });
    }

    const date = today();
    const result = db.prepare(`
      INSERT INTO borrowings (member_id, book_id, borrow_date, return_date)
      VALUES (?, ?, ?, NULL)
    `).run(member_id, book_id, date);

    res.status(201).json({
      borrow_id: result.lastInsertRowid,
      member_id,
      book_id,
      borrow_date: date,
      return_date: null
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

function returnBook(req, res) {
  try {
    const db = sqlite.getDb();
    const borrowing = db.prepare(
      "SELECT borrow_id, return_date FROM borrowings WHERE borrow_id = ?"
    ).get(req.params.id);

    if (!borrowing) {
      return res.status(404).json({ message: "Borrowing not found" });
    }

    if (borrowing.return_date) {
      return res.status(409).json({ message: "Book is already returned" });
    }

    const date = today();
    db.prepare(
      "UPDATE borrowings SET return_date = ? WHERE borrow_id = ?"
    ).run(date, req.params.id);

    res.json({
      borrow_id: Number(req.params.id),
      return_date: date
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// works because function declarations are hoisted
function today() {
  return new Date().toISOString().slice(0, 10);
}

module.exports = { borrowBook, returnBook };
