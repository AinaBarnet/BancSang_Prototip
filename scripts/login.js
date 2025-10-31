// Script para la página de login

// Manejo del formulario de inicio de sesión
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Aquí iría la lógica de autenticación
    console.log('Intentando iniciar sesión con:', email);
    
    // Por ahora, solo mostramos un mensaje
    alert('Funcionalidad de inicio de sesión en desarrollo');
});

// Función para ir a la página de registro
function goToRegister() {
    // Aquí redirigirás a la página de registro cuando la crees
    alert('Funcionalidad de registro próximamente');
}