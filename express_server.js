const express = require("express");
const app = express();
const PORT = 8080;

const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');

const bcrypt = require('bcrypt');
app.use(cookieParser());
app.use(cookieSession({
  name: 'user_id',
  keys: ['id'],
}));

const {
  urlsForUser,
  checkEmailPassword,
  getUserByEmail,
  generateRandomString,
} = require('./helpers');

const users = {
  user2RandomID: {
    id: "user2RandomID",
    email: "l@gmail.com",
    password: "123",
  },
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "123",
  },
};



app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: users.userRandomID.id,
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: users.user2RandomID.id,
  },
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.send("Please login");
  }
  const userURLS = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = {
    urls: userURLS,
    user_id: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  if (!id) {
    return res.redirect("/login");
  }
  const user = users[id];
  const templateVars = { user_id: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

app.post("/urls/new", (req, res) => {
  const sURL = generateRandomString();
  urlDatabase[sURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect(`/urls/${sURL}`);
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('Please enter login information');
  }

  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send('This email is in use already');
  }

  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password,10),
  };
  req.session.user_id = userID;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    return res.send('Please login');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls/");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const urlInfo = urlDatabase[req.params.shortURL];
  if (!urlInfo || req.session["user_id"] !== urlInfo.userID) {
    return res.send('Please login');
  }
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/login", (req, res) => {
  const ID = checkEmailPassword(req.body.email, req.body.password, users);
  if (ID) {
    req.session.user_id = ID;
    return res.redirect('/urls');
  }
  return res.status(403).send('Invalid credentials');
});

app.get("/register", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = { user_id: users[req.session.user_id] };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = { user_id: users[req.session.user_id] };
  res.render("urls_login", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const id = req.session["user_id"];
  const user = users[id];
  if (!id) {
    return res.send('Please login');
  }
  if(req.session["user_id"] !== urlDatabase[req.params.shortURL].userID) {
    return res.send('This short URL does not belong to you')
  } 
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user_id: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


