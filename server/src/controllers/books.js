const mongoose = require("mongoose");
const Book = require("../models/Book");
const { readSeedPromise } = require("../utils/seed");

async function getBooks(req, res) {
  try {
    const search = typeof req.query.search === "string"
      ? req.query.search.trim()
      : "";
    let filter = {};

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(escaped, "i");
      filter = { $or: [{ title: pattern }, { author: pattern }] };
    }

    const books = await Book.find(filter);
    res.json(books);
  } catch (error) {
    // works because function declarations are hoisted
    sendError(res, error);
  }
}

async function getBookById(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    sendError(res, error);
  }
}

async function createBook(req, res) {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (error) {
    sendError(res, error);
  }
}

async function updateBook(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    sendError(res, error);
  }
}

async function deleteBook(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
}

async function seedBooks(req, res) {
  try {
    const existing = await Book.countDocuments();
    if (existing > 0) {
      return res.status(409).json({
        message: "Books already exist; seed can only run once"
      });
    }

    const books = await readSeedPromise();
    const inserted = await Book.insertMany(books);
    res.status(201).json({ count: inserted.length });
  } catch (error) {
    sendError(res, error);
  }
}

function sendError(res, error) {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: error.message });
  }

  return res.status(500).json({ message: "Internal server error" });
}

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  seedBooks
};
