const sqlite = require('sqlite3');
const db = new sqlite.Database('./flags.db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, password TEXT NOT NULL);");

// check if username exist
function usernameExists(username) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT id FROM users WHERE username = ?';
    db.get(query, [username], (error, result) => {
      if (error) {
        console.log('username exists: error')
        reject(false)
      } else {
        if (result) {
          console.log('username exists: true')
          resolve(true)
        } else {
          console.log('username exists: false')
          resolve(false)
        }
      }
    });
  });
}

// check username works with password
function usernamePassword(username, password) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT id FROM users WHERE username = ? AND password = ?';
    // bcrypt.hash(password, 10, function(err, hash) {
    var hashedPassword = password;
    console.log('hash' + hashedPassword)
    console.log("check username with password");
    console.log("Hashed PW: " + hashedPassword);
    db.get(query, [username, hashedPassword], (error, result) => {
      if (error) {
        reject(false)
      } else {
        if (result) {
          resolve(true)
        } else {
          resolve(false)
        }
      }
    });
    // });
  });
}

// save username, password to db
function saveUsername(username, password) {
  return new Promise((resolve, reject) => {
    console.log("inserting new user");
    console.log(username, password);
    // bcrypt.hash(password, 10, function(err, hash) {
    var hashedPassword = password;
    const query =
      'INSERT INTO users (username, password) VALUES (?, ?)';
    db.run(query, [username, hashedPassword], function(
      error,
      result,
    ) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log("added new user");
        resolve(this.lastID);
      }
    });
    // });
  });
}

// create token and return it
 function getToken(username) {
    return jwt.sign(username, 'secretkey');
}

module.exports = {
  usernameExists(username) { return usernameExists(username) },
  saveUsername(username, password) { return saveUsername(username, password) },
  usernamePassword(username, password) { return usernamePassword(username, password) },
  getToken(username) { return getToken(username) },
}
