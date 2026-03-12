import { useEffect, useState } from "react"
import axios from "axios"
import "./App.css"

function App() {

  const API = "http://localhost:5000/api"

  const [books, setBooks] = useState([])

  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    genre: "",
    publisher: "",
    publicationYear: "",
    totalCopies: "",
    shelfLocation: "",
    bookType: "Circulating"
  })

  const [search, setSearch] = useState("")

  const fetchBooks = async () => {
    const res = await axios.get(`${API}/books`)
    setBooks(res.data)
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const addBook = async () => {

    if (!form.title || !form.author || !form.isbn) return

    await axios.post(`${API}/books`, {
      ...form,
      availableCopies: form.totalCopies
    })

    setForm({
      title: "",
      author: "",
      isbn: "",
      genre: "",
      publisher: "",
      publicationYear: "",
      totalCopies: "",
      shelfLocation: "",
      bookType: "Circulating"
    })

    fetchBooks()
  }

  const deleteBook = async (id) => {
    await axios.delete(`${API}/books/${id}`)
    fetchBooks()
  }

  const searchBook = async () => {
    const res = await axios.get(`${API}/books/search?title=${search}`)
    setBooks(res.data)
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  return (
    <div className="container">

      <h1>Library Management System</h1>

      <div className="section">
        <div className="section-title">Add Book</div>

        <div className="form-row">
          <input name="title" placeholder="Title" value={form.title} onChange={handleChange} />
          <input name="author" placeholder="Author" value={form.author} onChange={handleChange} />
          <input name="isbn" placeholder="ISBN" value={form.isbn} onChange={handleChange} />
          <input name="genre" placeholder="Genre" value={form.genre} onChange={handleChange} />
          <input name="publisher" placeholder="Publisher" value={form.publisher} onChange={handleChange} />
          <input name="publicationYear" placeholder="Year" value={form.publicationYear} onChange={handleChange} />
          <input name="totalCopies" placeholder="Total Copies" value={form.totalCopies} onChange={handleChange} />
          <input name="shelfLocation" placeholder="Shelf Location" value={form.shelfLocation} onChange={handleChange} />

          <select name="bookType" value={form.bookType} onChange={handleChange}>
            <option value="Reference">Reference</option>
            <option value="Circulating">Circulating</option>
          </select>
        </div>

        <button className="add-btn" onClick={addBook}>Add Book</button>

      </div>


      <div className="section">

<div className="section-title">Search Book</div>

<input
placeholder="Search by title"
value={search}
onChange={(e)=>setSearch(e.target.value)}
/>

<button className="search-btn" onClick={searchBook}>
Search
</button>

</div>


      <h2>Books</h2>

      <div className="books-grid">

{books.map(book => (

<div className="book-card" key={book._id}>

<div className="book-title">{book.title}</div>

<div className="book-meta">Author: {book.author}</div>
<div className="book-meta">Genre: {book.genre}</div>
<div className="book-meta">Publisher: {book.publisher}</div>
<div className="book-meta">ISBN: {book.isbn}</div>
<div className="book-meta">Copies: {book.availableCopies}/{book.totalCopies}</div>

<button
className="delete-btn"
onClick={()=>deleteBook(book._id)}
>
Delete
</button>

</div>

))}

</div>

    </div>
  )
}

export default App