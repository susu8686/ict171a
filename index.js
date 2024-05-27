const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Database setup
let db = new sqlite3.Database('./scores.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the scores database.');
});

db.run(`CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  playerName TEXT,
  score INTEGER
)`);

// Routes
app.post('/submit', (req, res) => {
  const { playerName, score } = req.body;
  if (score > 100000000) {
    // Moderation logic
    res.status(400).send('Score too high, needs moderation.');
  } else {
    db.run(`INSERT INTO scores (playerName, score) VALUES (?, ?)`, [playerName, score], function(err) {
      if (err) {
        return console.error(err.message);
      }
      res.status(200).send('Score submitted successfully.');
    });
  }
});

app.get('/getHighScores', (req, res) => {
  db.all(`SELECT playerName, score FROM scores ORDER BY score DESC LIMIT 10`, [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
