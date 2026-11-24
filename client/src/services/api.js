const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Keep the default message when the server has no JSON body.
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getBooks(search = "") {
  const query = search.trim()
    ? `?search=${encodeURIComponent(search.trim())}`
    : "";
  return request(`/books${query}`);
}

export function getBook(id) {
  return request(`/books/${id}`);
}

export function createBook(book) {
  return request("/books", {
    method: "POST",
    body: JSON.stringify(book)
  });
}

export function updateBook(id, book) {
  return request(`/books/${id}`, {
    method: "PUT",
    body: JSON.stringify(book)
  });
}

export function deleteBook(id) {
  return request(`/books/${id}`, {
    method: "DELETE"
  });
}

export function seedBooks() {
  return request("/books/seed", {
    method: "POST"
  });
}

export function getMembers() {
  return request("/members");
}

export function createMember(member) {
  return request("/members", {
    method: "POST",
    body: JSON.stringify(member)
  });
}

export function updateMember(id, member) {
  return request(`/members/${id}`, {
    method: "PUT",
    body: JSON.stringify(member)
  });
}

export function deleteMember(id) {
  return request(`/members/${id}`, {
    method: "DELETE"
  });
}

export function borrowBook(memberId, bookId) {
  return request("/borrowings", {
    method: "POST",
    body: JSON.stringify({
      member_id: memberId,
      book_id: bookId
    })
  });
}

export function returnBook(borrowId) {
  return request(`/borrowings/${borrowId}/return`, {
    method: "PATCH"
  });
}

export function getBorrowed() {
  return request("/borrowed");
}

export function getIdleMembers() {
  return request("/borrowed/idle-members");
}
