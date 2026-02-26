const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    let user = users.find(user => user.username === username);
    return user ? true : false;
};

const authenticatedUser = (username, password) => {
    let validUser = users.find(user =>
        user.username === username && user.password === password
    );
    return validUser ? true : false;
};

//only registered users can login
regd_users.post("/login", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    // Check if username & password provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    // Validate user
    if (authenticatedUser(username, password)) {

        let accessToken = jwt.sign(
            { username: username },
            "access",
            { expiresIn: 60 * 60 }
        );

        // Save token in session
        req.session.authorization = {
            accessToken: accessToken,
            username: username
        };

        return res.status(200).json({
            message: "Login successful",
            token: accessToken
        });

    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password" });
    }
});
// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

    const username = req.user.username;   // ✅ get from JWT
    const isbn = req.params.isbn;
    const review = req.body.review;

    if (!review) {
        return res.status(400).json({ message: "Review content required" });
    }

    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Add or modify review
    book.reviews[username] = review;

    return res.status(200).json({
        message: "Review added/updated successfully",
        reviews: book.reviews
    });

});

regd_users.delete("/auth/review/:isbn", (req, res) => {

    const username = req.user.username;   // from JWT middleware
    const isbn = req.params.isbn;

    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!book.reviews[username]) {
        return res.status(404).json({ message: "No review found for this user" });
    }

    // Delete only this user's review
    delete book.reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully",
        reviews: book.reviews
    });

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
