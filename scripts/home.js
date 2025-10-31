// Variables globales
let totalDonations = 0;
const maxDonations = 1100; // Meta de donaciones diarias

// Elementos del DOM
const donationCountEl = document.getElementById('donationCount');
const percentageEl = document.getElementById('percentage');
const bloodFillEl = document.getElementById('bloodFill');
const configBtn = document.getElementById('configBtn');
const addBtn = document.getElementById('addBtn');
const remainingEl = document.getElementById('remaining');
const participantsEl = document.getElementById('participants');
const prizeInfoEl = document.getElementById('prizeInfo');

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    loadDonations();
    updateDisplay();
    setupEventListeners();
});

// Cargar donaciones desde localStorage
function loadDonations() {
    const savedDonations = localStorage.getItem('totalDonations');
    if (savedDonations !== null) {
        totalDonations = parseInt(savedDonations, 10);
    }
}

// Guardar donaciones en localStorage
function saveDonations() {
    localStorage.setItem('totalDonations', totalDonations.toString());
}

// Actualizar la visualización
function updateDisplay() {
    // Actualizar contador
    donationCountEl.textContent = totalDonations;

    // Calcular porcentaje
    const percentage = Math.min(100, (totalDonations / maxDonations) * 100);
    percentageEl.textContent = percentage.toFixed(1);

    // Actualizar donaciones restantes
    const remaining = Math.max(0, maxDonations - totalDonations);
    remainingEl.textContent = remaining;

    // Actualizar participantes (por ahora igual a donaciones)
    participantsEl.textContent = totalDonations;

    // Actualizar información del sorteo
    updatePrizeInfo();

    // Actualizar el relleno de la gota
    updateBloodFill(percentage);
}

// Actualizar el relleno de sangre en la gota
function updateBloodFill(percentage) {
    // La gota tiene una altura de 120 unidades en el viewBox
    // Calculamos desde abajo hacia arriba
    const fillHeight = 120 - (120 * percentage / 100);

    bloodFillEl.setAttribute('y', fillHeight);
    bloodFillEl.setAttribute('height', 120 - fillHeight);

    // Añadir animación
    bloodFillEl.classList.add('animate');
    setTimeout(() => {
        bloodFillEl.classList.remove('animate');
    }, 1500);
}

// Añadir una donación (temporal para pruebas)
function addDonation() {
    if (totalDonations < maxDonations) {
        totalDonations++;
        saveDonations();
        updateDisplay();

        // Si llegamos al 100%, mostrar celebración
        if (totalDonations === maxDonations) {
            celebrateGoalReached();
        }
    } else {
        alert('¡Ya hemos alcanzado la meta de 1100 donaciones del día! 🎉\n\nSigue donando para el sorteo mensual.');
    }
}

// Actualizar información del sorteo
function updatePrizeInfo() {
    if (totalDonations >= maxDonations) {
        prizeInfoEl.classList.add('completed');
        prizeInfoEl.querySelector('.prize-title').textContent = '¡Meta diaria alcanzada!';
        prizeInfoEl.querySelector('.prize-description').textContent =
            '¡Felicidades! Hemos alcanzado las 1100 donaciones del día. Continúa participando en el sorteo mensual.';
    } else {
        prizeInfoEl.classList.remove('completed');
    }
}

// Celebrar cuando se alcanza la meta
function celebrateGoalReached() {
    // Mostrar mensaje de celebración
    alert('🎉 ¡FELICIDADES! 🎉\n\n¡Hemos alcanzado las 1100 donaciones del día!\n\nSigue donando para participar en el sorteo mensual.');
}

// Configurar event listeners
function setupEventListeners() {
    // Botón de configuración
    configBtn.addEventListener('click', () => {
        console.log('Configuración - Por implementar');
        // TODO: Navegar a página de configuración
    });

    // Botón de añadir
    addBtn.addEventListener('click', () => {
        console.log('Añadir - Por implementar');
        // TODO: Implementar funcionalidad del botón +
        // Por ahora, añadimos una donación para pruebas
        addDonation();
    });
}

// Función para resetear el contador (útil para pruebas)
function resetCounter() {
    totalDonations = 0;
    saveDonations();
    updateDisplay();
}

// Exponer funciones globales para pruebas
window.addDonation = addDonation;
window.resetCounter = resetCounter;
