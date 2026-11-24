import { useEffect, useState } from "react";
import {
  borrowBook,
  getBooks,
  getBorrowed,
  getIdleMembers,
  getMembers,
  returnBook
} from "../services/api";

export default function BorrowedPage() {
  const [borrowed, setBorrowed] = useState([]);
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [idleMembers, setIdleMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("");

  async function loadData() {
    setError("");

    try {
      const [borrowedData, memberData, bookData, idleData] =
        await Promise.all([
          getBorrowed(),
          getMembers(),
          getBooks(),
          getIdleMembers()
        ]);
      setBorrowed(borrowedData);
      setMembers(memberData);
      setBooks(bookData);
      setIdleMembers(idleData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    Promise.all([
      getBorrowed(),
      getMembers(),
      getBooks(),
      getIdleMembers()
    ])
      .then(([borrowedData, memberData, bookData, idleData]) => {
        if (!active) return;
        setBorrowed(borrowedData);
        setMembers(memberData);
        setBooks(bookData);
        setIdleMembers(idleData);
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
  }, []);

  async function handleBorrow(event) {
    event.preventDefault();
    setError("");

    try {
      await borrowBook(Number(selectedMemberId), selectedBookId);
      await loadData();
      setSelectedMemberId("");
      setSelectedBookId("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleReturn(borrowId) {
    setError("");

    try {
      await returnBook(borrowId);
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (loading) return <p className="loading-text">Loading...</p>;

  return (
    <section className="page borrowed-page">
      <div className="page-heading">
        <h1>Borrowed</h1>
      </div>
      {error && <p className="error">{error}</p>}

      <form className="borrow-bar" onSubmit={handleBorrow}>
        <select
          value={selectedMemberId}
          onChange={(event) => setSelectedMemberId(event.target.value)}
          required
        >
          <option value="">Select member</option>
          {members.map((member) => (
            <option key={member.member_id} value={member.member_id}>
              {member.name}
            </option>
          ))}
        </select>

        <select
          value={selectedBookId}
          onChange={(event) => setSelectedBookId(event.target.value)}
          required
        >
          <option value="">Select book</option>
          {books.map((book) => (
            <option key={book._id} value={book._id}>
              {book.title}
            </option>
          ))}
        </select>

        <button className="button primary" type="submit">Borrow Book</button>
      </form>

      {borrowed.length === 0 ? (
        <p className="empty-text">No borrowings found.</p>
      ) : (
        <div className="table-card">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Book</th>
                  <th>Borrow date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {borrowed.map((row) => (
                  <tr key={row.borrow_id}>
                    <td>{row.name}</td>
                    <td>{row.title}</td>
                    <td>{row.borrow_date}</td>
                    <td>
                      <span className={`status-tag ${row.return_date ? "returned" : "borrowed"}`}>
                        {row.return_date ? "Returned" : "Borrowed"}
                      </span>
                    </td>
                    <td>
                      {row.return_date ? (
                        row.return_date
                      ) : (
                        <button
                          className="button secondary return-button"
                          type="button"
                          onClick={() => handleReturn(row.borrow_id)}
                        >
                          Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h2 className="idle-heading">Members with no borrowings</h2>
      {idleMembers.length === 0 ? (
        <p className="empty-text">All members have borrowings.</p>
      ) : (
        <ul className="idle-list">
          {idleMembers.map((member) => (
            <li key={member.member_id}>
              {member.name} - {member.email}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
