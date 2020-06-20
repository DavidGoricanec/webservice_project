const sqlite = require('sqlite3');
const db = new sqlite.Database('./flags.db');

db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, password TEXT NOT NULL);");

// check if username exist
function usernameExists(username) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT id FROM users WHERE username = ?';
    db.get(query, [username], (error, result) => {
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
  });
}

module.exports = {
  usernameExists(username) { return usernameExists(username) },
}
