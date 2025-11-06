// This file controls the app windows (main + reading list) and handles saving/loading book data.

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let readingListWindow;

// --- File path for saving the book list data ---
const filepath = path.join(__dirname, 'Data', 'list.json');

// Helper Functions (for reading/writing the JSON file)
// Function to read all books from list.json
function readList() {
    // If the file exists, read it and convert JSON text to JavaScript object (array)
    if (fs.existsSync(filepath)) {
        return JSON.parse(fs.readFileSync(filepath));
    }
    // If file doesn’t exist, return empty array
    return [];
}

// Function to save a list of books into list.json
function saveList(list) {
    // Convert JavaScript array into readable JSON text
    fs.writeFileSync(filepath, JSON.stringify(list, null, 2));
}

// Create Main Window (index.html)
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    mainWindow.loadFile('renderer/index.html');
}

// Create Reading List Window (readingList.html)
function createReadingListWindow(author) {
    readingListWindow = new BrowserWindow({
        width: 700,
        height: 650,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    readingListWindow.loadFile('renderer/readingList.html');

    // After the window finishes loading, send the author name
    readingListWindow.webContents.on('did-finish-load', () => {
        readingListWindow.webContents.send('author-selected', author);
    });
}

// IPC (Communication between Renderer and Main process)
// When user clicks “Open Reading List” button
ipcMain.on('open-readingList-window', (event, author) => {
    createReadingListWindow(author);
});

// READ: Load all books from list.json
ipcMain.handle('load-books', () => {
    return readList(); // returns array of all books
});

// CREATE: Save a new book into list.json
ipcMain.on('save-list', (event, data) => {
    let list = readList(); // get current list
    list.push(data);       // add new book
    saveList(list);        // save updated list
});

// UPDATE: Edit book information
ipcMain.on('update-book', (event, updatedBook) => {
    let list = readList();
    // Find the position (index) of the book to update
    const index = list.findIndex(b => b.id === updatedBook.id);
    if (index !== -1) {
        list[index] = updatedBook; // replace old data with updated one
        saveList(list);
    }
});

// DELETE: Remove one book from the list
ipcMain.on('delete-book', (event, bookId) => {
    let list = readList();
    // Filter removes the book that matches the given ID
    const newList = list.filter(b => b.id !== bookId);
    saveList(newList);
});

app.whenReady().then(createMainWindow);
