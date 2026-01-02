# Project: Cyber Bank Demonstration – OWASP Top 10 Demonstration

## Project Overview

This project is a vulnerable banking website created for educational purposes to demonstrate common web security vulnerabilities, specifically those listed in the OWASP Top 10. The website is built with a simple technology stack (HTML, CSS, JavaScript, Node.js, and SQLite) to make the code easy to understand for beginners.

**Disclaimer:** This project is for educational purposes only. Do not use any of the code or techniques shown here in a real-world environment.

## Setup

1.  Install the dependencies:
    ```bash
    npm install
    ```
2.  Populate the database with default users:
    ```bash
    npm run seed
    ```

### Default Credentials

| Username | Password      |
| -------- | ------------- |
| `alice`  | `password123` |
| `bob`    | `password456` |

## Vulnerabilities Implemented

This project demonstrates the following OWASP Top 10 vulnerabilities:

1.  **A02:2021 – Cryptographic Failures:** Sensitive data, such as user passwords, are stored in plain text in the database.
2.  **A03:2021 – Injection:** The login functionality is vulnerable to SQL Injection, which allows an attacker to bypass authentication and extract sensitive data from the database.

## Attack Demonstration

This section demonstrates how to exploit the vulnerabilities.

### 1. Cryptographic Failures

This vulnerability is demonstrated by showing that the user passwords are stored in plaintext in the database.

**Demonstration:**

1.  Start the vulnerable server by running `node server.js`.
2.  Open a web browser and navigate to `http://localhost:3000`.
3.  Login with any of the default users (e.g., username: `alice`, password: `password123`).
4.  Navigate to the "Account" page.
5.  In the "All Users in the Database" section, you will see a table of all users with their passwords in plaintext.

**Verification of the Fix:**

1.  Stop the vulnerable server and start the secure server by running `node server-secure.js`.
2.  Repeat the steps above.
3.  On the "Account" page, you will now see that the passwords in the "All Users in the Database" table are hashed, not in plaintext.

### 2. SQL Injection

This vulnerability is demonstrated by bypassing the login form and exfiltrating all user data from the database.

#### Vulnerable Code Snippet (`server.js`)

The `username` and `password` parameters are directly concatenated into the SQL query, which allows an attacker to inject malicious SQL code.

```javascript
// Vulnerable login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    db.all(query, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (rows.length > 0) {
            if (rows.length === 1) {
                res.json({ message: 'Login successful!', user: rows[0] });
            } else {
                res.json({ message: 'SQL Injection Successful!', users: rows });
            }
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    });
});
```

#### SQL Injection Payload

*   **Username:** `' UNION SELECT id, username, password, email, account_number, balance FROM users --`
*   **Password:** `anything`

**Demonstration:**

1.  Start the vulnerable server by running `node server.js`.
2.  Open a web browser and navigate to `http://localhost:3000`.
3.  Enter the payload above into the username field and any password in the password field.
4.  Click the "Login" button.
5.  You will be redirected to the dashboard. Instead of seeing a welcome message for a single user, you will see a table containing all the user data from the database, demonstrating a successful data leakage attack.

**Verification of the Fix:**

1.  Stop the vulnerable server and start the secure server by running `node server-secure.js`.
2.  Repeat the SQL injection attempt.
3.  The login will fail, and you will see an "Invalid username or password" message, demonstrating that the parameterized queries in the secure server prevent the SQL injection attack.

## Security Impact

The demonstrated vulnerabilities have a critical security impact:

*   **Authentication Bypass & Data Leakage (SQLi):** Attackers can gain unauthorized access and steal sensitive data.
*   **Data Breach (Cryptographic Failure):** If the database is compromised, all user credentials will be exposed.

## Mitigation Techniques

To prevent these vulnerabilities, we have implemented the following security best practices in `server-secure.js`:

1.  **Password Hashing:** Using `bcrypt` to hash passwords before storing them.
2.  **Parameterized Queries:** Using prepared statements to prevent SQL injection.

## Secure Code Examples

The following code snippet from `server-secure.js` shows the secure implementation of the login endpoint.

```javascript
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
                    res.json({ message: 'Login successful!', user: row });
                } else {
                    res.status(401).json({ message: 'Invalid username or password' });
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    });
});
```

## Conclusion

This project demonstrates how easy it is to introduce critical security vulnerabilities into a web application. By following secure coding practices, we can significantly reduce the risk of these vulnerabilities being exploited.

To run the servers:

*   **Vulnerable Server:** `node server.js`
*   **Secure Server:** `node server-secure.js`