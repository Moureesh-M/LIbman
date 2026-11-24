import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import BooksPage from "./pages/BooksPage";
import BookDetailPage from "./pages/BookDetailPage";
import MembersPage from "./pages/MembersPage";
import BorrowedPage from "./pages/BorrowedPage";

export default function App() {
  return (
    <>
      <nav className="navbar">
        <NavLink className="brand" to="/books">Libman</NavLink>
        <div className="nav-links">
          <NavLink
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            to="/books"
          >
            Books
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            to="/members"
          >
            Members
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            to="/borrowed"
          >
            Borrowed
          </NavLink>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/books" replace />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/borrowed" element={<BorrowedPage />} />
        </Routes>
      </main>
    </>
  );
}
