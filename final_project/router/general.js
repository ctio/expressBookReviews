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
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;

        const book = await new Promise((resolve, reject) => {
            if (books[isbn]) {
                resolve(books[isbn]);
            } else {
                reject("Book not found");
            }
        });

        return res.status(200).json(book);

    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;

        const result = await new Promise((resolve, reject) => {
            const filteredBooks = {};

            Object.keys(books).forEach(key => {
                if (books[key].author === author) {
                    filteredBooks[key] = books[key];
                }
            });

            if (Object.keys(filteredBooks).length > 0) {
                resolve(filteredBooks);
            } else {
                reject("No books found for this author");
            }
        });

        return res.status(200).json(result);

    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title;

        const result = await new Promise((resolve, reject) => {
            const filteredBooks = {};

            Object.keys(books).forEach(key => {
                if (books[key].title === title) {
                    filteredBooks[key] = books[key];
                }
            });

            if (Object.keys(filteredBooks).length > 0) {
                resolve(filteredBooks);
            } else {
                reject("No books found for this title");
            }
        });

        return res.status(200).json(result);

    } catch (error) {
        return res.status(404).json({ message: error });
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
