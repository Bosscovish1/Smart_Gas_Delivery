const API_URL = 'http://localhost:5000/api';

// Authentication Helpers
function setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function checkAuth(roleRequired = null) {
    const token = getToken();
    const user = getUser();
    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }
    if (roleRequired && user.role !== roleRequired) {
        alert('Unauthorized access');
        window.location.href = 'index.html';
    }
    return user;
}

// Update UI based on auth
function updateNavbar() {
    const user = getUser();
    const nav = document.getElementById('navbar-links');
    if (!nav) return;

    if (user) {
        let dashboardLink = user.role === 'admin' ? 'admin-dashboard.html' : 
                            user.role === 'customer' ? 'customer-dashboard.html' : 
                            'vendor-dashboard.html';
        nav.innerHTML = `
            <a href="${dashboardLink}">Dashboard</a>
            <a href="#" onclick="logout(); return false;">Logout (${user.name})</a>
        `;
    } else {
        nav.innerHTML = `
            <a href="login.html">Login</a>
            <a href="register.html" class="btn btn-primary" style="padding: 0.5rem 1rem; color: white;">Sign Up</a>
        `;
    }
}

// API Call Wrapper
async function apiCall(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json'
    };

    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'API Error');
        }
        return data;
    } catch (error) {
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', updateNavbar);
