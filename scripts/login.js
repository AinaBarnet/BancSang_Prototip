// Script per a la pàgina de login

// Si l'usuari ja està autenticat, redirigir a xat
if (AuthManager.isAuthenticated()) {
    window.location.href = 'xat.html';
}

// Manejo del formulario de inicio de sesión
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Intentar iniciar sessió amb AuthManager
    const result = AuthManager.login(email, password);

    if (result.success) {
        // Redirigir a xat.html
        window.location.href = 'xat.html';
    } else {
        modalManager.error(result.message, 'Error d\'autenticació');
    }
});

// Función para ir a la página de registro
function goToRegister() {
    window.location.href = 'register.html';
}