import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import "./App.css"

/* ─── Icons (inline SVG, no dep) ─── */
const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
)

const GridIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
)

/* ─── Toast Component ─── */
function Toast({ message, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className={`toast ${type}`}>
      <span className="toast-dot" />
      {message}
    </div>
  )
}

/* ─── Book Card ─── */
function BookCard({ book, onDelete }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(book._id)
  }

  const available = book.availableCopies ?? 0
  const total = book.totalCopies ?? 1
  const pct = Math.min(100, Math.round((available / total) * 100))
  const typeClass = (book.bookType || "Circulating").toLowerCase()

  return (
    <div className={`book-card ${deleting ? "book-card--deleting" : ""}`}
      style={deleting ? { opacity: 0.4, transform: "scale(0.96)", transition: "all 0.25s ease", pointerEvents: "none" } : {}}>

      <div className="book-top">
        <div>
          <div className="book-title">{book.title}</div>
          <div className="book-author">{book.author}</div>
        </div>
        <span className={`book-type-badge ${typeClass}`}>
          {book.bookType || "Circulating"}
        </span>
      </div>

      <div className="book-meta-grid">
        {book.genre && (
          <div className="book-meta">
            <span className="book-meta-label">Genre</span>
            <span className="book-meta-value">{book.genre}</span>
          </div>
        )}
        {book.isbn && (
          <div className="book-meta">
            <span className="book-meta-label">ISBN</span>
            <span className="book-meta-value">{book.isbn}</span>
          </div>
        )}
        {book.publisher && (
          <div className="book-meta">
            <span className="book-meta-label">Publisher</span>
            <span className="book-meta-value">{book.publisher}</span>
          </div>
        )}
        {book.shelfLocation && (
          <div className="book-meta">
            <span className="book-meta-label">Shelf</span>
            <span className="book-meta-value">{book.shelfLocation}</span>
          </div>
        )}
        {book.publicationYear && (
          <div className="book-meta">
            <span className="book-meta-label">Year</span>
            <span className="book-meta-value">{book.publicationYear}</span>
          </div>
        )}
      </div>

      <div className="copies-row">
        <span className="copies-label">Available</span>
        <div className="copies-bar-wrap">
          <div className="copies-bar" style={{ width: `${pct}%` }} />
        </div>
        <span className="copies-text">{available}/{total}</span>
      </div>

      <div className="card-footer">
        <button className="delete-btn" onClick={handleDelete}>
          <TrashIcon /> Remove
        </button>
      </div>
    </div>
  )
}

/* ─── Main App ─── */
const EMPTY_FORM = {
  title: "", author: "", isbn: "", genre: "",
  publisher: "", publicationYear: "", totalCopies: "",
  shelfLocation: "", bookType: "Circulating"
}

const API = "https://library-api-fh0f.onrender.com/api"

export default function App() {
  const [books, setBooks]   = useState([])
  const [form, setForm]     = useState(EMPTY_FORM)
  const [search, setSearch] = useState("")
  const [toast, setToast]   = useState(null)

  const showToast = (message, type = "success") =>
    setToast({ message, type, key: Date.now() })

  const fetchBooks = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/books`)
      setBooks(res.data)
    } catch {
      showToast("Failed to load books", "error")
    }
  }, [])

  useEffect(() => { fetchBooks() }, [fetchBooks])

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const addBook = async () => {
    if (!form.title || !form.author || !form.isbn) {
      showToast("Title, Author & ISBN are required", "error")
      return
    }
    try {
      await axios.post(`${API}/books`, { ...form, availableCopies: form.totalCopies })
      setForm(EMPTY_FORM)
      await fetchBooks()
      showToast(`"${form.title}" added successfully`)
    } catch {
      showToast("Failed to add book", "error")
    }
  }

  const deleteBook = async (id) => {
    try {
      await axios.delete(`${API}/books/${id}`)
      await fetchBooks()
      showToast("Book removed")
    } catch {
      showToast("Failed to delete book", "error")
    }
  }

  const searchBook = async () => {
    if (!search.trim()) { fetchBooks(); return }
    try {
      const res = await axios.get(`${API}/books/search?title=${search}`)
      setBooks(res.data)
    } catch {
      showToast("Search failed", "error")
    }
  }

  const handleSearchKey = (e) => {
    if (e.key === "Enter") searchBook()
  }

  return (
    <div className="container">

      {/* ─── Header ─── */}
      <div className="header">
        <div className="header-inner">
          <div className="header-left">
            <div className="header-icon"><BookIcon /></div>
            <div>
              <h1 className="header-title">Library Management</h1>
              <div className="header-sub">Catalog, search and manage your collection</div>
            </div>
          </div>
          <div className="header-badge">
            <span className="badge-dot" />
            {books.length} {books.length === 1 ? "Book" : "Books"}
          </div>
        </div>
        <div className="divider" style={{ marginTop: 28 }} />
      </div>

      {/* ─── Add Book ─── */}
      <div className="section">
        <div className="section-header">
          <div className="section-title">Add New Book</div>
        </div>

        <div className="form-row">
          <input name="title"           placeholder="Title *"        value={form.title}           onChange={handleChange} />
          <input name="author"          placeholder="Author *"       value={form.author}          onChange={handleChange} />
          <input name="isbn"            placeholder="ISBN *"         value={form.isbn}            onChange={handleChange} />
          <input name="genre"           placeholder="Genre"          value={form.genre}           onChange={handleChange} />
          <input name="publisher"       placeholder="Publisher"      value={form.publisher}       onChange={handleChange} />
          <input name="publicationYear" placeholder="Year"           value={form.publicationYear} onChange={handleChange} />
          <input name="totalCopies"     placeholder="Total Copies"   value={form.totalCopies}     onChange={handleChange} type="number" min="1" />
          <input name="shelfLocation"   placeholder="Shelf Location" value={form.shelfLocation}   onChange={handleChange} />
          <select name="bookType" value={form.bookType} onChange={handleChange}>
            <option value="Circulating">Circulating</option>
            <option value="Reference">Reference</option>
          </select>
        </div>

        <button className="add-btn" onClick={addBook}>
          <PlusIcon /> Add Book
        </button>
      </div>

      {/* ─── Search ─── */}
      <div className="section">
        <div className="section-header">
          <div className="section-title">Search</div>
        </div>
        <div className="search-row">
          <input
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKey}
          />
          <button className="search-btn" onClick={searchBook}>
            <SearchIcon /> Search
          </button>
          {search && (
            <button className="search-btn" onClick={() => { setSearch(""); fetchBooks() }}
              style={{ opacity: 0.7, padding: "9px 12px" }}>
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* ─── Books Grid ─── */}
      <div className="books-header">
        <div className="section-title" style={{ margin: 0 }}>
          <GridIcon /> Collection
        </div>
        <span className="books-count">{books.length} result{books.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="books-grid">
        {books.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><BookIcon /></div>
            <div className="empty-title">No books found</div>
            <div className="empty-sub">Add your first book using the form above</div>
          </div>
        ) : (
          books.map(book => (
            <BookCard key={book._id} book={book} onDelete={deleteBook} />
          ))
        )}
      </div>

      {/* ─── Toast ─── */}
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  )
}