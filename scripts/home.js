// Script para la página principal (home)

function goToLogin() {
    window.location.href = 'login.html';
}

// Evento para el botón de registrarse
document.getElementById('btnRegistrarse').addEventListener('click', function () {
    window.location.href = 'register.html';
});
