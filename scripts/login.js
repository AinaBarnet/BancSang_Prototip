// Script para la página de login

// Manejo del formulario de inicio de sesión
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Validación de credenciales
    const validEmail = 'demo@exemple.com';
    const validPassword = 'password1234';

    if (email === validEmail && password === validPassword) {
        // Redirigir a home.html sin mostrar alert
        window.location.href = 'home.html';
    } else {
        alert('Email o contraseña incorrectos');
    }
});

// Función para ir a la página de registro
function goToRegister() {
    window.location.href = 'register.html';
}