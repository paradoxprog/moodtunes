const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files (HTML, CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Set up SQLite database
let db = new sqlite3.Database('./moodtunes.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Create Users table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
)`);

// Sign-up route
app.post('/signup', (req, res) => {
    const { email, psw } = req.body;

    // Hash the password
    const hashedPassword = bcrypt.hashSync(psw, 10);

    // Insert user into database
    const query = `INSERT INTO users (email, password) VALUES (?, ?)`;
    db.run(query, [email, hashedPassword], (err) => {
        if (err) {
            if (err.message.includes('UNIQUE constraint')) {
                return res.send('This email is already registered. Please log in.');
            }
            return res.send('Error during sign-up.');
        }
        res.redirect('/signup-success.html');
    });
});

// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Retrieve user from the database
    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], (err, user) => {
        if (err) {
            return res.send('Error occurred during login.');
        }
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.send('Incorrect email or password.');
        }
        res.redirect('/options1.html');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
