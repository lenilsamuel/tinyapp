const bcrypt = require("bcrypt");

// Function that generates a random 6-digit alphanumeric string
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

// Function that retrieves user id by associated email address
const getUserByEmail = function (email, database) {
  for (const key in database) {
    if (database[key].email === email) {
      return database[key].id;
    }
  }
};

// Function to check user login information matches database
const checkEmailPassword = (email, password, users) => {
  for (const key in users) {
    if (
      users[key].email === email &&
      bcrypt.compareSync(password, users[key].password)
    ) {
      return key;
    }
  }
};

// Function to retrieve URLs specific to a user
urlsForUser = (id, database) => {
  let urlsForUser = {};
  for (const key in database) {
    if (database[key].userID === id) {
      urlsForUser[key] = database[key].longURL;
    }
  }
  return urlsForUser;
};

module.exports = {
  urlsForUser,
  checkEmailPassword,
  getUserByEmail,
  generateRandomString,
};
