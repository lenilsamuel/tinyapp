const express = require("express");
const app = express();
const PORT = 8080;

const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
app.use(cookieParser());

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
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: users.userRandomID.id,
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: users.user2RandomID.id,
  },
};

urlsForUser = (id) => {
  let urlsForUser = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urlsForUser[key] = urlDatabase[key].longURL;
    }
  }
  return urlsForUser;
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.send("Please login");
  }
  const userURLS = urlsForUser(req.cookies["user_id"]);
  const templateVars = {
    urls: userURLS,
    user_id: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies["user_id"];
  if (!id) {
    return res.redirect("/login");
  }
  const user = users[id];
  const templateVars = { user_id: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const sURL = generateRandomString();
  urlDatabase[sURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"],
  };
  res.redirect(`/urls/${sURL}`);
});

app.post("/register", (req, res) => {
  if (!(req.body.email || req.body.password)) {
    return res.status(400).send('Please enter login information');
  }
  for (const key in users) {
    if (users[key].email === req.body.email) return res.sendStatus(400);
  }
  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password,10),
  };
  
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies["user_id"] !== urlDatabase[req.params.shortURL].userID) {
    return res.send('Please login');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls/");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  if (req.cookies["user_id"] !== urlDatabase[req.params.shortURL].userID) {
    return res.send('Please login');
  }
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = {
    longURL: req.body.longURL,
  };
  res.redirect("/urls/");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/login", (req, res) => {
  for (const key in users) {
    if (users[key].email === req.body.email && bcrypt.compareSync(req.body.password, users[key].password)) {
      res.cookie("user_id", key);
      return res.redirect("/urls");
    } 
  }
  return res.sendStatus(403);
});

app.get("/register", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = { user_id: users[req.cookies["user_id"]] };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = { user_id: users[req.cookies["user_id"]] };
  res.render("urls_login", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  if (!id) {
    return res.send('Please login');
  }
  if(id !== urlDatabase[req.params.shortURL].userID) {
    return res.send('This short URL does not belong to you')
  } 
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user_id: users[req.cookies["user_id"]],
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

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
