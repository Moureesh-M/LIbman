const Book = require("../models/Book");
const sqlite = require("../config/sqlite");

async function getBorrowed(req, res) {
  try {
    // INNER JOIN combines each borrowing with its member.
    const rows = sqlite.getDb().prepare(`
      SELECT
        borrowings.borrow_id,
        borrowings.member_id,
        members.name,
        borrowings.book_id,
        borrowings.borrow_date,
        borrowings.return_date
      FROM borrowings
      INNER JOIN members ON members.member_id = borrowings.member_id
      ORDER BY borrowings.borrow_id DESC
    `).all();

    const ids = [...new Set(rows.map((row) => row.book_id))];
    const books = ids.length
      ? await Book.find({ _id: { $in: ids } }).select("_id title").lean()
      : [];

    const titles = new Map(
      books.map((book) => [book._id.toString(), book.title])
    );

    res.json(rows.map((row) => ({
      ...row,
      title: titles.get(row.book_id) || "Unknown book"
    })));
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

function getIdleMembers(req, res) {
  try {
    // LEFT JOIN keeps members even when there is no borrowing row.
    const members = sqlite.getDb().prepare(`
      SELECT
        members.member_id,
        members.name,
        members.email
      FROM members
      LEFT JOIN borrowings ON borrowings.member_id = members.member_id
      WHERE borrowings.borrow_id IS NULL
      ORDER BY members.member_id
    `).all();

    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { getBorrowed, getIdleMembers };
