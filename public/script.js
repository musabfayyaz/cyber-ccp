
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const logoutButton = document.getElementById('logout');

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('users');
            window.location.href = '/index.html';
        });
    }

    if (window.location.pathname.includes('dashboard.html')) {
        const user = JSON.parse(sessionStorage.getItem('user'));
        const users = JSON.parse(sessionStorage.getItem('users'));

        if (users) {
            document.getElementById('username').textContent = 'Administrator';
            const leakedUsersDiv = document.getElementById('leaked-users');
            leakedUsersDiv.style.display = 'block';
            const tbody = document.querySelector('#leaked-users-table tbody');
            users.forEach(u => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${u.id}</td>
                    <td>${u.username}</td>
                    <td>${u.password}</td>
                    <td>${u.email}</td>
                    <td>${u.account_number}</td>
                    <td>${u.balance}</td>
                `;
                tbody.appendChild(row);
            });
        } else if (user) {
            document.getElementById('username').textContent = user.username;
        } else {
            window.location.href = '/index.html';
        }

        if (user || users) {
            const ctx = document.getElementById('myChart').getContext('2d');
            const myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'Monthly Spending',
                        data: [1200, 1900, 3000, 5000, 2300, 3200, 4500, 2800, 3900, 4200, 4800, 5500],
                        backgroundColor: 'rgba(0, 212, 255, 0.2)',
                        borderColor: 'rgba(0, 212, 255, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    if (window.location.pathname.includes('account.html')) {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (user) {
            fetch('/api/account', {
                headers: {
                    'user-id': user.id
                }
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('account-username').textContent = data.username;
                document.getElementById('account-email').textContent = data.email;
                document.getElementById('account-number').textContent = data.account_number;
                document.getElementById('account-balance').textContent = data.balance;
            });

            fetch('/api/users')
            .then(response => response.json())
            .then(data => {
                const tbody = document.querySelector('#users-table tbody');
                data.forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.username}</td>
                        <td>${user.password}</td>
                    `;
                    tbody.appendChild(row);
                });
            });
        } else {
            window.location.href = '/index.html';
        }
    }

    if (window.location.pathname.includes('transactions.html')) {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (user) {
            fetch('/api/transactions', {
                headers: {
                    'user-id': user.id
                }
            })
            .then(response => response.json())
            .then(data => {
                const tbody = document.querySelector('#transactions-table tbody');
                data.forEach(tx => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${tx.date}</td>
                        <td>${tx.description}</td>
                        <td>${tx.amount.toFixed(2)}</td>
                    `;
                    tbody.appendChild(row);
                });
            });
        } else {
            window.location.href = '/index.html';
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = loginForm.username.value;
            const password = loginForm.password.value;

            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.users) {
                    sessionStorage.setItem('users', JSON.stringify(data.users));
                } else {
                    sessionStorage.setItem('user', JSON.stringify(data.user));
                }
                window.location.href = '/dashboard.html';
            } else {
                errorMessage.textContent = data.message;
            }
        });
    }
});
