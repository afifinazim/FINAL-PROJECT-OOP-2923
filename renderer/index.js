// index.js - Reading Tracker (Main Window)
const { ipcRenderer } = require('electron');

const searchBtn = document.getElementById('searchBtn');
const resultDiv = document.getElementById('result');
const readingListBtn = document.getElementById('readingListBtn');
let currentAuthor = '';

searchBtn.addEventListener('click', () => {
    const author = document.getElementById('authorInput').value.trim();

    if (author === "") {
        resultDiv.innerHTML = "<p>Please enter an author name.</p>";
        return;
    }

    // Show loading text
    resultDiv.innerHTML = "<p>Searching for books...</p>";

    // Fetch book data from Open Library
    fetch(`https://openlibrary.org/search.json?author=${encodeURIComponent(author)}&limit=1`)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);

            // Check if book list exists
            if (!data.docs) {
                resultDiv.innerHTML = "<p>No data found for this author.</p>";
                return;
            }

            // Check if the list has at least 1 book
            if (data.docs.length === 0) {
                resultDiv.innerHTML = "<p>No book found for this author.</p>";
                return;
            }

            // Get the first book only
            const book = data.docs[0];
            const title = book.title || "Unknown";
            const year = book.first_publish_year || "Unknown";
            const edition = (book.edition_key && book.edition_key[0]) || "N/A";
            const authorName = (book.author_name && book.author_name[0]) || author;

            // Check if eBook is available
            let ebookAvailable = "Not Available";
            if (book.has_fulltext || book.ebook_access === "public") {
                ebookAvailable = "Available";
            }

            // Display book info on screen
            resultDiv.innerHTML = `
                <h3>${title}</h3>
                <p><b>Author:</b> ${authorName}</p>
                <p><b>Edition:</b> ${edition}</p>
                <p><b>Year Published:</b> ${year}</p>
                <p><b>E-Book:</b> ${ebookAvailable}</p>
            `;

            // Show the "Open Reading List" button
            readingListBtn.style.display = 'block';
            currentAuthor = authorName;
        })
        .catch((error) => {
            console.error('Error:', error);
            resultDiv.innerHTML = "<p>Something went wrong. Please try again.</p>";
        });
});

// Open Reading List window
readingListBtn.addEventListener('click', () => {
    ipcRenderer.send('open-readingList-window', currentAuthor);
});
