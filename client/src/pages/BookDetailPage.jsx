import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBook, updateBook } from "../services/api";

export default function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [user, setUser] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");

  useEffect(() => {
    let active = true;

    getBook(id)
      .then((data) => {
        if (!active) return;
        setBook(data);
        setTitle(data.title);
        setAuthor(data.author);
        setGenre(data.genre || "");
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  async function handleSave(event) {
    event.preventDefault();
    setError("");

    try {
      const updated = await updateBook(id, {
        title,
        author,
        genre,
        reviews: book.reviews || []
      });
      setBook(updated);
      setEditing(false);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleReview(event) {
    event.preventDefault();
    setError("");

    try {
      const updatedReviews = [
        ...(book.reviews || []),
        {
          user,
          rating: Number(rating),
          comment
        }
      ];

      const updated = await updateBook(id, {
        title: book.title,
        author: book.author,
        genre: book.genre,
        reviews: updatedReviews
      });

      setBook(updated);
      setUser("");
      setRating("5");
      setComment("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (loading) return <p className="loading-text">Loading...</p>;
  if (error === "Book not found") {
    return (
      <section className="detail-page">
        <article className="detail-card">
          <p>Book not found</p>
          <Link className="button secondary" to="/books">Back to books</Link>
        </article>
      </section>
    );
  }
  if (error) return <p className="error">{error}</p>;
  if (!book) return null;

  return (
    <section className="detail-page">
      <article className="detail-card">
        <Link className="back-link" to="/books">← Back to books</Link>

        {editing ? (
          <form className="detail-edit-form" onSubmit={handleSave}>
            <h1>Edit Book</h1>
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
            <div className="form-actions">
              <button className="button primary" type="submit">Save</button>
              <button
                className="button secondary"
                type="button"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="book-info">
            <h1>{book.title}</h1>
            <p><strong>Author:</strong> {book.author}</p>
            {book.genre && <span className="genre-tag">{book.genre}</span>}
            <button
              className="button secondary"
              type="button"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
          </div>
        )}

        <h2>Reviews</h2>
        {!book.reviews || book.reviews.length === 0 ? (
          <p className="empty-text">No reviews yet.</p>
        ) : (
          <div className="review-grid">
            {book.reviews.map((review, index) => (
              <article className="review-card" key={`${review.user}-${index}`}>
                <strong>{review.user}</strong>
                <span className="rating">{"★".repeat(review.rating)}</span>
                {review.comment && <p>{review.comment}</p>}
              </article>
            ))}
          </div>
        )}

        <form className="review-form" onSubmit={handleReview}>
          <h2>Add Review</h2>
          <input
            value={user}
            onChange={(event) => setUser(event.target.value)}
            placeholder="User"
            required
          />
          <select value={rating} onChange={(event) => setRating(event.target.value)}>
            <option value="1">1 ★</option>
            <option value="2">2 ★★</option>
            <option value="3">3 ★★★</option>
            <option value="4">4 ★★★★</option>
            <option value="5">5 ★★★★★</option>
          </select>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Comment"
          />
          <button className="button primary" type="submit">Add Review</button>
        </form>
      </article>
    </section>
  );
}
