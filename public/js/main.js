const API_URL = '/api'; // Same domain as backend

// LOGIN
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = 'dashboard.html';
      } else {
        document.getElementById('loginError').textContent = data.error || 'Login failed';
      }
    } catch (err) {
      document.getElementById('loginError').textContent = 'Error connecting to server';
    }
  });
}

// REGISTER
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = firstNameInput.value;
    const lastName = lastNameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password })
      });

      const data = await res.json();
      if (data.message) {
        alert('Registration successful! You can now log in.');
        window.location.href = 'index.html';
      } else {
        document.getElementById('registerError').textContent = data.error || 'Registration failed';
      }
    } catch (err) {
      document.getElementById('registerError').textContent = 'Error connecting to server';
    }
  });
}

// DASHBOARD
const loadBtn = document.getElementById('loadBtn');
if (loadBtn) {
  loadBtn.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/memberships`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    const table = document.getElementById('memberTable');
    table.innerHTML = '';
    data.forEach((m) => {
      const row = `<tr class="border-t">
        <td class="p-2">${m.name}</td>
        <td class="p-2">${m.email}</td>
        <td class="p-2">${m.status}</td>
        <td class="p-2">${new Date(m.endDate).toLocaleDateString()}</td>
      </tr>`;
      table.innerHTML += row;
    });
  });
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });
}
