const sqlite = require('sqlite3');
const db = new sqlite.Database('./flags.db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, password TEXT NOT NULL);");
db.run("CREATE TABLE IF NOT EXISTS flags (id INTEGER PRIMARY KEY AUTOINCREMENT, flagName TEXT NOT NULL, flagValue TEXT NOT NULL, flagCounter INTEGER DEFAULT 0);");

/*
valuesToTable("USA", "blue,blue,blue,blue,blue,blue,red,red,red,red,red,red,red,red,red,blue,white,blue,white,blue,blue,white,white,white,white,white,white,white,white,white,blue,blue,white,blue,white,blue,red,red,red,red,red,red,red,red,red,blue,blue,blue,blue,blue,blue,white,white,white,white,white,white,white,white,white,red,red,red,red,red,red,red,red,red,red,red,red,red,red,red,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,red,red,red,red,red,red,red,red,red,red,red,red,red,red,red,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,red,red,red,red,red,red,red,red,red,red,red,red,red,red,red")
valuesToTable("Japan","white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,red,red,red,white,white,white,white,white,white,white,white,white,white,white,white,red,red,red,white,white,white,white,white,white,white,white,white,white,white,white,red,red,red,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white")
valuesToTable("England", "white,white,white,white,white,white,white,red,white,white,white,white,white,white,white,white,white,white,white,white,white,white,red,white,white,white,white,white,white,white,white,white,white,white,white,white,white,red,white,white,white,white,white,white,white,white,white,white,white,white,white,white,red,white,white,white,white,white,white,white,red,red,red,red,red,red,red,red,red,red,red,red,red,red,red,white,white,white,white,white,white,white,red,white,white,white,white,white,white,white,white,white,white,white,white,white,white,red,white,white,white,white,white,white,white,white,white,white,white,white,white,white,red,white,white,white,white,white,white,white,white,white,white,white,white,white,white,red,white,white,white,white,white,white,white")
*/

function valuesToTable(flagName, flagValue) {
  return new Promise((resolve, reject) => {
    const query =
      'INSERT INTO flags (flagName, flagValue) VALUES (?, ?)';
    db.run(query, [flagName, flagValue], function(
      error,
      result,
    ) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log("added new flag " + flagName);
        resolve(this.lastID);
      }
    });
  });
}

// get all flags
function getFlags() {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM flags';
    db.all(query, [], (error, result) => {
      if (error) {
        console.log('flags table error')
        reject(false)
      } else {
        resolve(result)
      }
    });
  });
}

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

function updateFlag(flagName) {
  return new Promise((resolve, reject) => {
    const query =
      'UPDATE flags SET flagCounter = flagCounter + 1 WHERE flagName = ?';
    db.run(query, [flagName], function(
      error,
      result,
    ) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log("incremented counter of " + flagName);
        resolve(true);
      }
    });
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
  getFlags() { return getFlags() },
  updateFlag(flagName) { return updateFlag(flagName) },
}
