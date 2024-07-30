const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  const user = users.find((user) => user.username === username);

  // forces it to return a boolean value
  return !!user;
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  const validUser = users.find(
    (user) => user.username === username && user.password === password
  );

  return !!validUser;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    res.status(400).send("Either username or password is not provided.");
  } else {
    if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign(
        {
          data: {
            username: username,
            password: password,
          },
        },
        "access",
        { expiresIn: "1h" }
      );

      console.log(accessToken);
      req.session.authorization = {
        accessToken,
        username,
      };
      res.status(200).send("Customer Successfully Logged In.");
    } else {
      res
        .status(401)
        .send("Either username or password is incorrect, unauthorized.");
    }
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let filtered_book = books[isbn];
  if (filtered_book) {
    let review = req.query.review;
    let reviewer = req.session.authorization["username"];
    if (review) {
      filtered_book["reviews"][reviewer] = review;
      books[isbn] = filtered_book;
    }
    res.send(
      `The review for the book with ISBN ${isbn} has been added/updated.`
    );
  } else {
    res.send("Unable to find this ISBN!");
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  delete books[isbn].reviews[req.session.authorization["username"]];
  return res
    .status(200)
    .json({ message: "review deleted", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
