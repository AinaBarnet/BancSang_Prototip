// Variables globales
let totalDonations = 0;
const maxDonations = 100; // Meta de donaciones para llenar la gota completamente

// Elementos del DOM
const donationCountEl = document.getElementById('donationCount');
const percentageEl = document.getElementById('percentage');
const bloodFillEl = document.getElementById('bloodFill');
const configBtn = document.getElementById('configBtn');
const addBtn = document.getElementById('addBtn');

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
    totalDonations++;
    saveDonations();
    updateDisplay();
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
