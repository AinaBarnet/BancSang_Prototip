// Protegir la pàgina - requerir autenticació
if (!AuthManager.requireAuth()) {
    throw new Error('Accés no autoritzat');
}

// Variables
const maxDonations = 33000;
let totalDonations = 0;

// Elementos del DOM
const backBtn = document.getElementById('backBtn');
const statusBadge = document.getElementById('statusBadge');
const currentDonationsEl = document.getElementById('currentDonations');
const totalGoalEl = document.getElementById('totalGoal');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const shareBtn = document.getElementById('shareBtn');
const rulesToggle = document.getElementById('rulesToggle');
const rulesContent = document.getElementById('rulesContent');

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    loadDonations();
    updateDisplay();
    setupEventListeners();
});

// Cargar donaciones
function loadDonations() {
    const saved = localStorage.getItem('totalDonations');
    if (saved !== null) {
        totalDonations = parseInt(saved, 10);
    }
}

// Actualizar visualización
function updateDisplay() {
    // Formatear números
    currentDonationsEl.textContent = totalDonations.toLocaleString('ca-ES');
    totalGoalEl.textContent = maxDonations.toLocaleString('ca-ES');

    // Calcular porcentaje
    const percentage = Math.min(100, (totalDonations / maxDonations) * 100);
    progressText.textContent = percentage.toFixed(1) + '%';
    progressBar.style.width = percentage + '%';

    // Actualizar estado
    if (totalDonations >= maxDonations) {
        statusBadge.classList.add('completed');
        statusBadge.innerHTML = '<span class="status-icon">✅</span><span class="status-text">Objectiu Assolit!</span>';
    }
}

// Event listeners
function setupEventListeners() {
    // Botón volver
    backBtn.addEventListener('click', () => {
        window.location.href = 'home.html';
    });

    // Botón compartir
    shareBtn.addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: 'Premi Banc de Sang',
                text: '🎁 Participa al sorteig d\'un Samsung Galaxy Book4! Només cal donar sang!',
                url: window.location.href
            }).catch(err => console.log('Error sharing:', err));
        } else {
            modalManager.alert('Comparteix aquest premi amb els teus amics:\n\n🎁 Samsung Galaxy Book4 i3 + Funda\n\nDona sang i participa al sorteig!', 'Compartir');
        }
    });

    // Toggle de bases del sorteo
    rulesToggle.addEventListener('click', () => {
        rulesToggle.classList.toggle('active');
        rulesContent.classList.toggle('expanded');

        // Scroll suave hacia las bases si se expanden
        if (rulesContent.classList.contains('expanded')) {
            setTimeout(() => {
                rulesToggle.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    });
}
