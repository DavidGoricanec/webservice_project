const sqlite = require('sqlite3');
const db = new sqlite.Database('./flags.db');
const bcrypt = require('bcrypt');

db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, password TEXT NOT NULL);");
db.run("CREATE TABLE IF NOT EXISTS flags (id INTEGER PRIMARY KEY AUTOINCREMENT, flagName TEXT NOT NULL, flagValue TEXT NOT NULL, flagCounter INTEGER DEFAULT 0);");

/*
valuesToTable("USA", "blue,blue,blue,blue,blue,blue,red,red,red,red,red,red,red,red,red,blue,white,blue,white,blue,blue,white,white,white,white,white,white,white,white,white,blue,blue,white,blue,white,blue,red,red,red,red,red,red,red,red,red,blue,blue,blue,blue,blue,blue,white,white,white,white,white,white,white,white,white,red,red,red,red,red,red,red,red,red,red,red,red,red,red,red,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,red,red,red,red,red,red,red,red,red,red,red,red,red,red,red,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,red,red,red,red,red,red,red,red,red,red,red,red,red,red,red")
valuesToTable("Japan","white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,red,red,red,white,white,white,white,white,white,white,white,white,white,white,white,red,red,red,white,white,white,white,white,white,white,white,white,white,white,white,red,red,red,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white,white")
valuesToTable("England", "white,white,white,white,white,white,white,red,white,white,white,white,white,white,white,white,white,white,white,white,white,white,red,white,white,white,white,white,white,white,white,white,white,white,white,white,white,red,white,white,white,white,white,white,white,white,white,white,white,white,white,white,red,white,white,white,white,white,white,white,red,red,red,red,red,red,red,red,red,red,red,red,red,red,red,white,white,white,white,white,white,white,red,white,white,white,white,white,white,white,white,white,white,white,white,white,white,red,white,white,white,white,white,white,white,white,white,white,white,white,white,white,red,white,white,white,white,white,white,white,white,white,white,white,white,white,white,red,white,white,white,white,white,white,white")
*/

// add a new flag to db
function valuesToTable(flagName, flagValue) {
  return new Promise((resolve, reject) => {
  console.log("valuesToTable()");
    const query =
      'INSERT INTO flags (flagName, flagValue) VALUES (?, ?)';
    db.run(query, [flagName, flagValue], function(
      error,
      result,
    ) {
      if (error) {
        console.log('Error saving flag data to db')
        reject(error);
      } else {
        console.log("added new flag " + flagName + " to db");
        resolve(this.lastID);
      }
    });
  });
}

// get all flags
function getFlags() {
  return new Promise((resolve, reject) => {
    console.log("getFlags()");
    const query = 'SELECT * FROM flags';
    db.all(query, [], (error, result) => {
      if (error) {
        console.log('Error retrieving flags from db')
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
    console.log("usernameExists()");
    const query = 'SELECT id FROM users WHERE username = ?';
    db.get(query, [username], (error, result) => {
      if (error) {
        console.log('Error retrieving user from db')
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
    console.log("usernamePassword()");
    const query = 'SELECT password FROM users WHERE username = ?';
    db.get(query, [username], (error, result) => {
      if (error) {
        console.log('Error retrieving password for user from db')
        reject(false)
      } else {
        if (result) {
          bcrypt.compare(password, result.password).then((passwordMatch) => {
            console.log('Entered password matches saved user password: ' + passwordMatch)
            resolve(passwordMatch)
          });
        } else {
          console.log('Entered password matches saved user password: false')
          resolve(false)
        }
      }
    });
  });
}

// save username, password to db
function saveUsername(username, password) {
  return new Promise((resolve, reject) => {
    console.log("saveUsername()");
    bcrypt.hash(password, 10).then((hashedPassword) => {
      const query =
        'INSERT INTO users (username, password) VALUES (?, ?)';
      db.run(query, [username, hashedPassword], function(
        error,
        result,
      ) {
        if (error) {
          console.log('Error saving user to db')
          reject(error);
        } else {
          console.log("added new user");
          resolve(this.lastID);
        }
      });
    });
  });
}

// increment selection counter of flag use
function updateFlag(flagName) {
  return new Promise((resolve, reject) => {
    console.log("updateFlag()");
    const query =
      'UPDATE flags SET flagCounter = flagCounter + 1 WHERE flagName = ?';
    db.run(query, [flagName], function(
      error,
      result,
    ) {
      if (error) {
        console.log('Error updating flag counter in db')
        reject(error);
      } else {
        console.log("incremented counter of " + flagName);
        resolve(true);
      }
    });
  });
}

module.exports = {
  usernameExists(username) { return usernameExists(username) },
  saveUsername(username, password) { return saveUsername(username, password) },
  usernamePassword(username, password) { return usernamePassword(username, password) },
  getFlags() { return getFlags() },
  updateFlag(flagName) { return updateFlag(flagName) },
}
