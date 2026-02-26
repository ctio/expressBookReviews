const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    // Check if username & password provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if user already exists
    if (isValid(username)) {
        return res.status(409).json({ message: "User already exists" });
    }

    // Register new user
    users.push({ username: username, password: password });

    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const data = await new Promise((resolve, reject) => {
            resolve(books);
        });

        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ message: "Error retrieving books" });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    const book = books[isbn];

    if (book) {
        return res.status(200).json(book);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const bookKeys = Object.keys(books);

    let filteredBooks = {};

    bookKeys.forEach(key => {
        if (books[key].author === author) {
            filteredBooks[key] = books[key];
        }
    });

    if (Object.keys(filteredBooks).length > 0) {
        return res.status(200).json(filteredBooks);
    } else {
        return res.status(404).json({ message: "No books found for this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const bookKeys = Object.keys(books);

    let filteredBooks = {};

    bookKeys.forEach(key => {
        if (books[key].title === title) {
            filteredBooks[key] = books[key];
        }
    });

    if (Object.keys(filteredBooks).length > 0) {
        return res.status(200).json(filteredBooks);
    } else {
        return res.status(404).json({ message: "No books found for this title" });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    const book = books[isbn];

    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
