const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const dbCleanPath = './database/database.clean.db';

// Delete the old clean database if it exists
if (fs.existsSync(dbCleanPath)) {
    fs.unlinkSync(dbCleanPath);
}

const db = new sqlite3.Database(dbCleanPath, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Created the clean SQLite database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        email TEXT NOT NULL,
        account_number TEXT NOT NULL,
        balance REAL NOT NULL
    )`, (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Created the users table.');
    });

    const users = [
        {
            username: 'alice',
            password: 'password123',
            email: 'alice@example.com',
            account_number: '1234567890',
            balance: 1500.00
        },
        {
            username: 'bob',
            password: 'password456',
            email: 'bob@example.com',
            account_number: '0987654321',
            balance: 2500.00
        },
        {
            username: 'charlie',
            password: 'password789',
            email: 'charlie@example.com',
            account_number: '1122334455',
            balance: 500.00
        },
        {
            username: 'dave',
            password: 'password101',
            email: 'dave@example.com',
            account_number: '5566778899',
            balance: 10000.00
        },
        {
            username: 'eve',
            password: 'password112',
            email: 'eve@example.com',
            account_number: '2233445566',
            balance: 0.00
        }
    ];

    const stmt = db.prepare("INSERT INTO users (username, password, email, account_number, balance) VALUES (?, ?, ?, ?, ?)");

    users.forEach(user => {
        stmt.run(user.username, user.password, user.email, user.account_number, user.balance);
    });

    stmt.finalize((err) => {
        if(err) {
            return console.error(err.message);
        }
        console.log('Inserted plaintext passwords into clean database.');
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Closed the clean database connection.');
        });
    });
});
