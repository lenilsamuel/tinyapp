const bcrypt = require('bcrypt');

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

const getUserByEmail = function (email, database) {
  for (const key in database) {
    if (database[key].email === email) {
      return database[key].id;
    }
  }
};

const checkEmailPassword = (email, password, users) => {
  for (const key in users) {
    if (
      users[key].email === email &&
      bcrypt.compareSync(password, users[key].password)
    ) {
      // req.session.user_id = key;
      return key;
    }
  }
};

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
