// Script para la página landing (index.html)

function goToLogin() {
    window.location.href = 'login.html';
}

// Evento para el botón de registrarse
document.addEventListener('DOMContentLoaded', function () {
    const btnRegistrarse = document.getElementById('btnRegistrarse');
    if (btnRegistrarse) {
        btnRegistrarse.addEventListener('click', function () {
            window.location.href = 'register.html';
        });
    }
});