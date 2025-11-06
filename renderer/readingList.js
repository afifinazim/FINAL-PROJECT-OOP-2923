// readingList.js - Reading Tracker (Reading List Window)
const { ipcRenderer } = require('electron');

let selectedAuthor = ''; // To store the author name
let editingBookId = null; // To track if user is editing a book

// Receive author name from main window
ipcRenderer.on('author-selected', (event, author) => {
    selectedAuthor = author;
    document.getElementById('title').textContent = `Create reading summary for ${author}`;
    loadBooks(); // Load existing books when window opens
});

// ========== CREATE FUNCTION ==========
document.getElementById('saveBtn').addEventListener('click', () => {
    // Get values from input boxes
    const title = document.getElementById('titleInput').value.trim();
    const edition = document.getElementById('editionInput').value.trim();
    const year = document.getElementById('yearInput').value.trim();
    const ebook = document.getElementById('ebookInput').value.trim();

    // Make sure all boxes are filled
    if (!title || !edition || !year || !ebook) {
        alert('Please fill in all fields before saving.');
        return;
    }

    // If editingBookId is null → add new book
    if (editingBookId === null) {
        const newBook = {
            id: Date.now(), // unique ID
            author: selectedAuthor,
            title: title,
            edition: edition,
            year: year,
            ebook: ebook
        };
        ipcRenderer.send('save-list', newBook);
        alert('Book added successfully!');
    } else {
        // If editing → update existing book
        const updatedBook = {
            id: editingBookId,
            author: selectedAuthor,
            title: title,
            edition: edition,
            year: year,
            ebook: ebook
        };
        ipcRenderer.send('update-book', updatedBook);
        alert('Book updated successfully!');
        editingBookId = null; // Reset editing mode
    }

    // Clear input fields
    document.getElementById('titleInput').value = '';
    document.getElementById('editionInput').value = '';
    document.getElementById('yearInput').value = '';
    document.getElementById('ebookInput').value = '';

    // Reload the list
    loadBooks();
});

// ========== READ FUNCTION ==========
async function loadBooks() {
    const books = await ipcRenderer.invoke('load-books');
    const bookListDiv = document.getElementById('bookList');
    bookListDiv.innerHTML = ''; // clear old data

    // If no books found
    if (!books || books.length === 0) {
        bookListDiv.innerHTML = '<p>No books in your reading list yet.</p>';
        return;
    }

    // Display each book
    books.forEach(book => {
        const div = document.createElement('div');
        div.classList.add('book-box');
        div.innerHTML = `
            <h3>${book.title}</h3>
            <p><b>Author:</b> ${book.author}</p>
            <p><b>Edition:</b> ${book.edition}</p>
            <p><b>Year Published:</b> ${book.year}</p>
            <p><b>E-Book:</b> ${book.ebook}</p>
            <button class="editBtn">Edit</button>
            <button class="deleteBtn">Delete</button>
        `;

        // Edit button
        div.querySelector('.editBtn').addEventListener('click', () => {
            document.getElementById('titleInput').value = book.title;
            document.getElementById('editionInput').value = book.edition;
            document.getElementById('yearInput').value = book.year;
            document.getElementById('ebookInput').value = book.ebook;
            editingBookId = book.id;
        });

        // Delete button
        div.querySelector('.deleteBtn').addEventListener('click', () => {
            const confirmDelete = confirm('Are you sure you want to delete this book?');
            if (confirmDelete) {
                ipcRenderer.send('delete-book', book.id);
                alert('Book deleted successfully!');
                loadBooks();
            }
        });

        bookListDiv.appendChild(div);
    });
}
