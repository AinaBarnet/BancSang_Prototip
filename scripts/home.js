// Variables globales
let totalDonations = 0;
let todayDonations = 0;
const maxDonations = 33000; // Meta mensual para desbloquear el premio

// Elementos del DOM
const donationCountEl = document.getElementById('donationCount');
const percentageEl = document.getElementById('percentage');
const bloodFillEl = document.getElementById('bloodFill');
const configBtn = document.getElementById('configBtn');
const userMenuBtn = document.getElementById('userMenuBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
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

    // Cargar donaciones del día
    const savedDate = localStorage.getItem('lastDonationDate');
    const today = new Date().toDateString();

    if (savedDate === today) {
        // Mismo día, cargar donaciones del día
        const savedTodayDonations = localStorage.getItem('todayDonations');
        if (savedTodayDonations !== null) {
            todayDonations = parseInt(savedTodayDonations, 10);
        }
    } else {
        // Nuevo día, resetear contador diario
        todayDonations = 0;
        localStorage.setItem('lastDonationDate', today);
        localStorage.setItem('todayDonations', '0');
    }
}

// Guardar donaciones en localStorage
function saveDonations() {
    localStorage.setItem('totalDonations', totalDonations.toString());
    localStorage.setItem('todayDonations', todayDonations.toString());
    localStorage.setItem('lastDonationDate', new Date().toDateString());
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
    remainingEl.textContent = remaining.toLocaleString('ca-ES');

    // Actualizar donaciones de hoy
    participantsEl.textContent = todayDonations.toLocaleString('ca-ES');

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
        todayDonations++;
        saveDonations();
        updateDisplay();

        // Si llegamos al 100%, mostrar celebración
        if (totalDonations === maxDonations) {
            celebrateGoalReached();
        }
    } else {
        alert('¡Ja hem assolit l\'objectiu de 33.000 donacions del mes! 🎉\n\nEl sorteig es realitzarà aviat.');
    }
}

// Actualizar información del sorteo
function updatePrizeInfo() {
    if (totalDonations >= maxDonations) {
        prizeInfoEl.classList.add('completed');
        prizeInfoEl.querySelector('.prize-title').textContent = '¡Objectiu assolit!';
        prizeInfoEl.querySelector('.prize-description').textContent =
            'Felicitats! Hem arribat a les 33.000 donacions del mes. El sorteig es realitzarà aviat!';
    } else {
        prizeInfoEl.classList.remove('completed');
    }
}

// Celebrar cuando se alcanza la meta
function celebrateGoalReached() {
    // Mostrar mensaje de celebración
    alert('🎉 FELICITATS! 🎉\n\n¡Hem assolit les 33.000 donacions del mes!\n\nEl sorteig del premi es realitzarà aviat.');
}

// Configurar event listeners
function setupEventListeners() {
    // Botón de configuración
    configBtn.addEventListener('click', () => {
        console.log('Configuración - Por implementar');
        // TODO: Navegar a página de configuración
    });

    // User menu dropdown
    userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('active');
        userMenuBtn.classList.toggle('active');
        // Cerrar submenu de notificaciones si está abierto
        const notificationsSubmenu = document.getElementById('notificationsSubmenu');
        notificationsSubmenu.classList.remove('active');
        document.getElementById('notificationsBtn').classList.remove('active');
    });

    // Cerrar el menú al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!userMenuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('active');
            userMenuBtn.classList.remove('active');
            // Cerrar submenu de notificaciones
            const notificationsSubmenu = document.getElementById('notificationsSubmenu');
            notificationsSubmenu.classList.remove('active');
            document.getElementById('notificationsBtn').classList.remove('active');
        }
    });

    // Prevenir que los clicks dentro del menú lo cierren
    dropdownMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Notifications submenu
    const notificationsBtn = document.getElementById('notificationsBtn');
    const notificationsSubmenu = document.getElementById('notificationsSubmenu');

    notificationsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationsBtn.classList.toggle('active');
        notificationsSubmenu.classList.toggle('active');
    });

    // Marcar todas como leídas
    const markAllReadBtn = document.getElementById('markAllRead');
    markAllReadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const unreadNotifications = document.querySelectorAll('.notification-card.unread');
        unreadNotifications.forEach(notification => {
            notification.classList.remove('unread');
        });
        updateNotificationBadge();
    });

    // Cerrar notificaciones individuales
    const notificationCloseButtons = document.querySelectorAll('.notification-close');
    notificationCloseButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const notificationCard = button.closest('.notification-card');
            notificationCard.style.opacity = '0';
            notificationCard.style.transform = 'translateX(20px)';
            setTimeout(() => {
                notificationCard.remove();
                updateNotificationBadge();
            }, 300);
        });
    });

    // Click en notificación para marcarla como leída
    const notificationCards = document.querySelectorAll('.notification-card');
    notificationCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('notification-close')) {
                card.classList.remove('unread');
                updateNotificationBadge();
                // Aquí podrías agregar lógica para abrir detalles de la notificación
                console.log('Notificación clicada:', card.dataset.id);
            }
        });
    });

    // Click en la información del premio
    prizeInfoEl.addEventListener('click', () => {
        window.location.href = 'premio.html';
    });

    // Añadir estilo de cursor pointer al premio
    prizeInfoEl.style.cursor = 'pointer';
}

// Actualizar badge de notificaciones
function updateNotificationBadge() {
    const unreadCount = document.querySelectorAll('.notification-card.unread').length;
    const badge = document.getElementById('notificationBadge');

    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

// Función para resetear el contador (útil para pruebas)
function resetCounter() {
    totalDonations = 0;
    todayDonations = 0;
    saveDonations();
    updateDisplay();
}

// Exponer funciones globales para pruebas
window.addDonation = addDonation;
window.resetCounter = resetCounter;
