# Project: Cyber Bank Demonstration – OWASP Top 10 Demonstration

## Project Overview

This project is a vulnerable banking website created for educational purposes to demonstrate common web security vulnerabilities, specifically those listed in the OWASP Top 10. The website is built with a simple technology stack (HTML, CSS, JavaScript, Node.js, and SQLite) to make the code easy to understand for beginners.

**Disclaimer:** This project is for educational purposes only. Do not use any of the code or techniques shown here in a real-world environment.

## Vulnerabilities Implemented

This project demonstrates the following OWASP Top 10 vulnerabilities:

1.  **A02:2021 – Cryptographic Failures:** Sensitive data, such as user passwords, emails, and account numbers, are stored in plain text in the database.
2.  **A03:2021 – Injection:** The login functionality is vulnerable to SQL Injection, which allows an attacker to bypass authentication and extract sensitive data from the database.

## Attack Demonstration

This section demonstrates how to exploit the SQL Injection vulnerability in the login form.

### Vulnerable Code Snippet

The following code snippet from `server.js` shows the vulnerable login endpoint. The `username` and `password` parameters are directly concatenated into the SQL query, which allows an attacker to inject malicious SQL code.

```javascript
// Vulnerable login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    db.get(query, (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            res.json({ message: 'Login successful!', user: row });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    });
});
```

### SQL Injection Payloads

#### 1. Bypassing Authentication

An attacker can bypass the login form by injecting a simple SQL payload into the username field.

*   **Username:** `' OR '1'='1`
*   **Password:** `anything`

**Explanation:**

This payload modifies the SQL query to:

```sql
SELECT * FROM users WHERE username = '' OR '1'='1' AND password = 'anything'
```

Since `'1'='1'` is always true, the `WHERE` clause evaluates to true for the first user in the database, and the attacker is logged in as that user without knowing their password.

**Demonstration:**

1.  Start the server by running `node server.js`.
2.  Open a web browser and navigate to `http://localhost:3000`.
3.  Enter the payload `' OR '1'='1` in the username field and any password in the password field.
4.  Click the "Login" button.
5.  You will be redirected to the dashboard, logged in as the first user in the database.

#### 2. Data Leakage (Union-based SQLi)

An attacker can extract all the data from the `users` table using a UNION-based SQL Injection attack.

*   **Username:** `' UNION SELECT id, username, password, email, account_number, balance FROM users --`
*   **Password:** `anything`

**Explanation:**

This payload modifies the SQL query to:

```sql
SELECT * FROM users WHERE username = '' UNION SELECT id, username, password, email, account_number, balance FROM users --' AND password = 'anything'
```

The `UNION` operator combines the results of the two `SELECT` statements. The `--` at the end of the payload is a comment in SQL, which causes the rest of the original query to be ignored. This query will return all the users from the database. Although the application will only log in as the first user, an attacker can use other techniques (like time-based or error-based SQLi) to exfiltrate all the data. In this case, because the server returns the user object on successful login, an attacker can see the details of the first user, which in this case is the result of the UNION query.

**Demonstration:**

1.  Start the server by running `node server.js`.
2.  Open a web browser and navigate to `http://localhost:3000`.
3.  Open the browser's developer tools (F12) and go to the "Network" tab.
4.  Enter the payload `' UNION SELECT id, username, password, email, account_number, balance FROM users --` in the username field and any password in the password field.
5.  Click the "Login" button.
6.  Look at the response of the `/login` request in the developer tools. You will see the details of all the users in the database in the response body.

## Security Impact

The SQL Injection vulnerability has a critical security impact:

*   **Authentication Bypass:** Attackers can bypass the login mechanism and gain unauthorized access to the application.
*   **Data Leakage:** Attackers can exfiltrate sensitive data from the database, such as usernames, passwords, emails, and financial information.
*   **Data Tampering:** Attackers can modify or delete data in the database.
*   **Denial of Service:** In some cases, attackers can craft SQL queries that can cause the database to become unresponsive.

The Cryptographic Failure vulnerability also has a critical impact:

*   **Data Breach:** If the database is compromised, all the sensitive user data will be exposed in plain text.
*   **Credential Stuffing:** Attackers can use the stolen credentials to gain access to other systems where the user might have used the same password.

## Mitigation Techniques

To prevent these vulnerabilities, we have implemented the following security best practices in `server-secure.js`.

### 1. Password Hashing

To mitigate the risk of cryptographic failures, all user passwords should be hashed before being stored in the database. Hashing is a one-way function that converts a password into a fixed-length string of characters. This means that even if the database is compromised, the attacker will not be able to retrieve the original passwords.

We use the `bcrypt` library to hash and verify passwords.

### 2. Parameterized Queries (Prepared Statements)

To prevent SQL Injection, we use parameterized queries (also known as prepared statements). Parameterized queries separate the SQL query from the user-supplied data. This ensures that the user input is treated as data and not as part of the SQL query, which prevents the attacker from injecting malicious SQL code.

### 3. Input Validation

While parameterized queries are the primary defense against SQL Injection, it is also important to validate all user input. Input validation ensures that the user-supplied data is in the expected format and length. For example, you can check if a username contains only alphanumeric characters, or if an email address is in a valid format.

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
```

## Conclusion

This project demonstrates how easy it is to introduce critical security vulnerabilities into a web application. By following secure coding practices, such as using parameterized queries and hashing passwords, we can significantly reduce the risk of these vulnerabilities being exploited.

To run the secure version of the server, use the following command:

```bash
node server-secure.js
```