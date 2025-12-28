
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// Database connection
const db = new sqlite3.Database('./database/database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Middleware to check for user session
const checkAuth = (req, res, next) => {
    const userId = req.headers['user-id'];
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    req.userId = userId;
    next();
};

// Secure login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Use parameterized queries to prevent SQL injection
    const query = `SELECT * FROM users WHERE username = ?`;

    db.get(query, [username], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            // Compare the provided password with the hashed password from the database
            bcrypt.compare(password, row.password, (err, result) => {
                if (result) {
                    // Passwords match
                    res.json({ message: 'Login successful!', user: row });
                } else {
                    // Passwords don't match
                    res.status(401).json({ message: 'Invalid username or password' });
                }
            });
        } else {
            // User not found
            res.status(401).json({ message: 'Invalid username or password' });
        }
    });
});

// API endpoint to get account details
app.get('/api/account', checkAuth, (req, res) => {
    // Use parameterized queries to prevent SQL injection
    const query = `SELECT id, username, email, account_number, balance FROM users WHERE id = ?`;

    db.get(query, [req.userId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    });
});

// API endpoint to get transactions
app.get('/api/transactions', checkAuth, (req, res) => {
    // For demonstration purposes, we'll return dummy transaction data
    const transactions = [
        { date: '2025-12-25', description: 'Grocery Store', amount: -75.50 },
        { date: '2025-12-24', description: 'ATM Withdrawal', amount: -100.00 },
        { date: '2025-12-22', description: 'Paycheck Deposit', amount: 2000.00 },
        { date: '2025-12-20', description: 'Online Shopping', amount: -150.25 },
        { date: '2025-12-18', description: 'Restaurant', amount: -45.00 }
    ];
    res.json(transactions);
});


// Start the server
app.listen(port, () => {
    console.log(`Secure server listening at http://localhost:${port}`);
    console.log('To run the vulnerable server, run: node server.js');
    console.log('To run the secure server, run: node server-secure.js');
});
