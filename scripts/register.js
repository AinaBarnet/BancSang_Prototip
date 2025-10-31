// Script para la página de registro

// Manejo del formulario de registro
document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Limpiar mensajes de error previos
    clearErrors();

    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordRepeat = document.getElementById('registerPasswordRepeat').value;

    // Validación de contraseñas
    if (password !== passwordRepeat) {
        showError('Les contrasenyes no coincideixen');
        document.getElementById('registerPassword').classList.add('error');
        document.getElementById('registerPasswordRepeat').classList.add('error');
        return;
    }

    // Validación de longitud de contraseña
    if (password.length < 6) {
        showError('La contrasenya ha de tenir almenys 6 caràcters');
        document.getElementById('registerPassword').classList.add('error');
        return;
    }

    // Validación de formato de email
    if (!isValidEmail(email)) {
        showError('Si us plau, introdueix un email vàlid');
        document.getElementById('registerEmail').classList.add('error');
        return;
    }

    // Aquí iría la lógica de registro (API call)
    console.log('Intentando registrar usuario:', email);

    // Simulación de registro exitoso
    // Redirigir directamente a home.html
    window.location.href = 'home.html';
});

// Función para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Función para mostrar errores
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;

    const form = document.getElementById('registerForm');
    form.insertBefore(errorDiv, form.firstChild);
}

// Función para mostrar éxito
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;

    const form = document.getElementById('registerForm');
    form.insertBefore(successDiv, form.firstChild);
}

// Función para limpiar errores
function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message, .success-message');
    errorMessages.forEach(msg => msg.remove());

    const errorInputs = document.querySelectorAll('input.error');
    errorInputs.forEach(input => input.classList.remove('error'));
}

// Limpiar errores cuando el usuario empieza a escribir
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', function () {
        this.classList.remove('error');
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
    });
});
