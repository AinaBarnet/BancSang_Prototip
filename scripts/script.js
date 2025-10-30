// Simple demo authentication and original saludar functionality.

// --- Demo auth data (client-side only, for prototype) ---
const DEMO_USERS = [
    { email: 'user@example.com', password: 'password123', name: 'Usuari Demo' }
];

// --- Elements ---
const landingPage = document.getElementById('landingPage');
const btnIniciarSessio = document.getElementById('btnIniciarSessio');
const btnRegistrarse = document.getElementById('btnRegistrarse');
const loginModal = document.getElementById('loginModal');
const closeLogin = document.getElementById('closeLogin');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const protectedContent = document.getElementById('protectedContent');
const welcomeText = document.getElementById('welcomeText');
const logoutBtn = document.getElementById('logoutBtn');
const boton = document.getElementById('miBoton');

// --- Utility functions ---
function setAuth(user) {
    if (user) {
        sessionStorage.setItem('loggedInUser', JSON.stringify(user));
    } else {
        sessionStorage.removeItem('loggedInUser');
    }
    updateUIForAuth();
}

function getAuth() {
    const s = sessionStorage.getItem('loggedInUser');
    return s ? JSON.parse(s) : null;
}

function updateUIForAuth() {
    const user = getAuth();
    if (user) {
        landingPage.classList.add('hidden');
        loginModal.classList.add('hidden');
        protectedContent.classList.remove('hidden');
        welcomeText.textContent = `Has iniciat sessió com ${user.name} (${user.email})`;
    } else {
        landingPage.classList.remove('hidden');
        loginModal.classList.add('hidden');
        protectedContent.classList.add('hidden');
        welcomeText.textContent = '';
    }
}

// --- Show login modal ---
if (btnIniciarSessio) {
    btnIniciarSessio.addEventListener('click', function () {
        landingPage.classList.add('hidden');
        loginModal.classList.remove('hidden');
    });
}

// --- Show register (placeholder) ---
if (btnRegistrarse) {
    btnRegistrarse.addEventListener('click', function () {
        alert('Funcionalitat de registre pròximament...');
    });
}

// --- Close login modal ---
if (closeLogin) {
    closeLogin.addEventListener('click', function () {
        loginModal.classList.add('hidden');
        landingPage.classList.remove('hidden');
        loginError.textContent = '';
    });
}

// --- Login handler ---
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        loginError.textContent = '';
        const email = (document.getElementById('email').value || '').trim().toLowerCase();
        const password = document.getElementById('password').value || '';

        const user = DEMO_USERS.find(u => u.email === email && u.password === password);
        if (user) {
            setAuth({ email: user.email, name: user.name });
        } else {
            loginError.textContent = 'Credencials invàlides. Prova: user@example.com / password123';
        }
    });
}

// --- Logout ---
if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
        setAuth(null);
    });
}

// --- Original small example kept for compatibility ---
function saludar() {
    console.log('Hola! Això funciona amb bind');
}

// Nos aseguramos de que el botón exista antes de usar bind
if (boton) {
    boton.addEventListener('click', saludar.bind(this));
}

// Initialize UI on load
document.addEventListener('DOMContentLoaded', function () {
    updateUIForAuth();
});
