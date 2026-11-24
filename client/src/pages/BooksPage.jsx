import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createBook, deleteBook, getBooks, seedBooks } from "../services/api";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [search, setSearch] = useState("");
  const [seedLoading, setSeedLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    // Sync code -> Promise callbacks (microtasks) -> setTimeout (macrotask).
    // Fetch finishes later, so its result is handled after current code.
    const timer = setTimeout(() => {
      getBooks(search)
      .then((data) => {
        if (active) setBooks(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search]);

  async function handleAdd(event) {
    event.preventDefault();
    setError("");

    try {
      const created = await createBook({ title, author, genre, reviews: [] });
      setBooks((current) => [...current, created]);
      setTitle("");
      setAuthor("");
      setGenre("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleDelete(id) {
    setError("");

    try {
      await deleteBook(id);
      setBooks((current) => current.filter((book) => book._id !== id));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleSeed() {
    setError("");
    setSeedLoading(true);

    try {
      await seedBooks();
      const data = await getBooks(search);
      setBooks(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSeedLoading(false);
    }
  }

  if (loading) return <p className="loading-text">Loading...</p>;

  return (
    <section className="page books-page">
      <div className="page-heading">
        <h1>Books</h1>
      </div>
      {error && <p className="error">{error}</p>}

      <div className="search-wrap">
        <input
          className="search-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search title or author"
          aria-label="Search books"
        />
      </div>

      <form className="add-book-card" onSubmit={handleAdd}>
        <h2>Add a book</h2>
        <div className="form-grid">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title"
            required
          />
          <input
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            placeholder="Author"
            required
          />
          <input
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
            placeholder="Genre"
          />
          <button className="button primary" type="submit">Add Book</button>
        </div>
      </form>

      {books.length === 0 ? (
        <div className="empty-state">
          <p>No books found.</p>
          <button
            className="button primary"
            type="button"
            onClick={handleSeed}
            disabled={seedLoading}
          >
            {seedLoading ? "Loading samples..." : "Load sample books"}
          </button>
        </div>
      ) : (
        <div className="book-grid">
          {books.map((book) => (
            <article className="book-card" key={book._id}>
              <div>
                <h2>{book.title}</h2>
                <p className="book-author">by {book.author}</p>
                {book.genre && <span className="genre-tag">{book.genre}</span>}
              </div>
              <div className="card-actions">
                <Link className="button secondary" to={`/books/${book._id}`}>
                  Open
                </Link>
                <button
                  className="button danger"
                  type="button"
                  onClick={() => handleDelete(book._id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
