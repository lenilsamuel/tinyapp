const express = require("express");
const app = express();
const PORT = 8080;


const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

app.use(
  cookieSession({
    name: "user_id",
    keys: ["id"],
  })
);

// Import helper functions from helpers.js
const {
  urlsForUser,
  checkEmailPassword,
  getUserByEmail,
  generateRandomString,
} = require("./helpers");

// User database
const users = {};

app.set("view engine", "ejs");

// URL database
const urlDatabase = {};

app.use(bodyParser.urlencoded({ extended: true }));

// GET for root directory
app.get("/", (req, res) => {
  // checks if user is logged in
  const id = req.session.user_id;
  if (!users[id]) {
    return res.redirect('/urls/new');
  }
  res.redirect("/urls");
});

// GET for register page
app.get("/register", (req, res) => {
  const id = req.session.user_id;
  const templateVars = { user_id: users[req.session.user_id] };
  res.render("urls_registration", templateVars);
});

// POST for register page
app.post("/register", (req, res) => {
  // Check if email or password fields are empty
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Please enter login information");
  }
  // Check if email entered by user is already in database
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send("This email is in use already");
  }
  // generate random id for new user
  const userID = generateRandomString();
  // save user information to database
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  };
  req.session.user_id = userID;
  res.redirect("/urls");
});

// GET for login page
app.get("/login", (req, res) => {
  const id = req.session.user_id;
  if (users[id]) {
    return res.redirect('/urls/new');
  }
  const templateVars = { user_id: users[req.session.user_id] };
  res.render("urls_login", templateVars);
});

// POST for user login
app.post("/login", (req, res) => {
  const ID = checkEmailPassword(req.body.email, req.body.password, users);
  // checks login credentials against database
  if (ID) {
    req.session.user_id = ID;
    return res.redirect("/urls");
  }
  return res.status(403).send("Invalid credentials");
});

// GET for /urls
app.get("/urls", (req, res) => {
  // checks if user is logged in
  const id = req.session.user_id;
  if (!users[id]) {
    return res.status(400).send("Please Login");
  }
  const userURLS = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = {
    urls: userURLS,
    user_id: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});

// POST for new URLs
app.post("/urls", (req, res) => {
  const id = req.session.user_id;
  // checks if user is logged in
  if (!users[id]) {
    return res.status(400).send("Please Login");
  }
  // generates a random short URL id
  const sURL = generateRandomString();
  // save to url database
  urlDatabase[sURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect(`/urls/${sURL}`);
});

// GET for creating new URLs
app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  // checks if user is logged in
  if (!users[id]) {
    return res.redirect("/login");
  }
  const templateVars = { user_id: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

// GET for specific short URL
app.get("/urls/:shortURL", (req, res) => {
  const id = req.session["user_id"];
  // Check to ensure user is logged in before accessing short URL
  if (!id) {
    return res.send("Please login");
  }
  // Check to ensure short URL that is being accessed belongs to the logged in user
  if (req.session["user_id"] !== urlDatabase[req.params.shortURL].userID) {
    return res.send("This short URL does not belong to you");
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user_id: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

// POST for editing short URL to database
app.post("/urls/:id", (req, res) => {
  const urlInfo = urlDatabase[req.params.id];
  if (!urlInfo || req.session["user_id"] !== urlInfo.userID) {
    return res.status(401).send("Please login");
  }
  urlDatabase[req.params.id] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect("/urls");
});


// POST for deleting a short URL
app.post("/urls/:shortURL/delete", (req, res) => {
  // Checks that the short URL that is being deleted belongs to the user
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    return res.status(401).send("Please login");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls/");
});

// POST for logging out a user
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


// GET for redirecting user to the longURL based on the associated short URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
