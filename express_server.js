const express = require("express");
const app = express();
const PORT = 8080;

const cookieParser = require("cookie-parser");

app.use(cookieParser());

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

function generateRandomString() {
  let randomString = "";
  const alphaNumericChars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < 6; i++) {
    const random = Math.floor(Math.random() * 62);
    randomString += alphaNumericChars[random];
  }
  return randomString;
}

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/urls", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = { urls: urlDatabase, username: user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = { username: user };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const sURL = generateRandomString();
  urlDatabase[sURL] = req.body.longURL;
  res.redirect(`/urls/${sURL}`);
});

app.post("/register", (req, res) => {
  if (!(req.body.email || req.body.password)) {
    return res.sendStatus(400);
  }
  for (const key in users) {
    if (users[key].email === req.body.email) return res.status(400);
  }
  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password,
  };
  console.log(users);
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls/");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls/");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  for (const key in users) {
    if (users[key].email === req.body.email && users[key].password === req.body.password) {
      res.cookie("user_id", key);
      return res.redirect('/urls');
    } else return res.sendStatus(403);
    // else res.redirect('/url');
  }
});

app.get("/register", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = { username: user };
  res.render("urls_registration", templateVars);
});

app.get('/login', (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = { username: user };
  res.render('urls_login', templateVars);
})

app.get("/urls/:shortURL", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: user,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
