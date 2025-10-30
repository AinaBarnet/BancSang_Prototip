// Funciones para el modal
function openModal() {
    document.getElementById('loginModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('loginModal').classList.add('hidden');
}

function closeModalOutside(event) {
    if (event.target.id === 'loginModal') {
        closeModal();
    }
}

// Cerrar con tecla ESC
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});