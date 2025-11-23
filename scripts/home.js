// Variables globales
let totalDonations = 0;
let todayDonations = 0;
const maxDonations = 33000; // Meta mensual para desbloquear el premio

// Elementos del DOM
const userMenuBtn = document.getElementById('userMenuBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

// Protegir la pàgina - requerir autenticació
if (!AuthManager.requireAuth()) {
    // Si no està autenticat, requireAuth redirigirà a login
    throw new Error('Accés no autoritzat');
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Mostrar nom de l'usuari
    const userName = AuthManager.getCurrentUserName();
    document.querySelector('.user-name').textContent = userName.toUpperCase();

    loadUserStats();
    setupEventListeners();

    // Verificar si l'usuari ja pot tornar a donar
    checkIfCanDonateAgain();

    // Actualitzar badge de notificacions quan es carrega la pàgina
    // Petit retard per assegurar que NotificationsManager està inicialitzat
    setTimeout(() => {
        updateNotificationBadge();
    }, 10);
});

// Cargar estadísticas del usuario
function loadUserStats() {
    const userData = UserDataManager.getCurrentUserData();
    if (!userData) return;

    const userDonationsCount = document.getElementById('userDonationsCount');
    const nextDonationDate = document.getElementById('nextDonationDate');
    const livesImpacted = document.getElementById('livesImpacted');

    if (userDonationsCount) {
        userDonationsCount.textContent = userData.donations.totalCount || 0;
    }

    if (livesImpacted) {
        // Cada donación puede salvar hasta 3 vidas
        const lives = (userData.donations.totalCount || 0) * 3;
        livesImpacted.textContent = lives;
    }

    if (nextDonationDate && userData.donations.list.length > 0) {
        // Obtenir la donació més recent per data
        const sortedDonations = [...userData.donations.list].sort((a, b) => {
            const dateA = new Date(a.date || a.timestamp);
            const dateB = new Date(b.date || b.timestamp);
            return dateB - dateA;
        });
        const lastDonation = sortedDonations[0];
        const lastDate = new Date(lastDonation.date || lastDonation.timestamp);
        const nextAvailable = new Date(lastDate);
        nextAvailable.setMonth(nextAvailable.getMonth() + 3);

        const today = new Date();
        if (nextAvailable <= today) {
            nextDonationDate.textContent = "Ja pots";
        } else {
            nextDonationDate.textContent = nextAvailable.toLocaleDateString('ca-ES', {
                day: '2-digit',
                month: '2-digit'
            });
        }
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Botón de chat
    const chatBtn = document.getElementById('chatBtn');
    chatBtn.addEventListener('click', () => {
        window.location.href = 'xat.html';
    });

    // Opción de configuración en el menú desplegable
    const configMenuItem = document.getElementById('configMenuItem');
    configMenuItem.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'configuracio.html';
    });

    // Botó de tancar sessió
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Segur que vols tancar la sessió?')) {
                AuthManager.logout();
            }
        });
    }

    // User menu dropdown
    userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('active');
        userMenuBtn.classList.toggle('active');
    });

    // Cerrar el menú al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!userMenuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('active');
            userMenuBtn.classList.remove('active');
        }
    });

    // Prevenir que los clicks dentro del menú lo cierren
    dropdownMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Actualitzar quan es modifiquen les notificacions
    window.addEventListener('notificationsUpdated', () => {
        updateNotificationBadge();
    });

    // Actualitzar quan l'usuari torna a la pàgina
    window.addEventListener('focus', () => {
        updateNotificationBadge();
    });

    // Actualitzar periòdicament per sincronitzar
    setInterval(() => {
        updateNotificationBadge();
    }, 5000); // Cada 5 segons
}

// Actualizar badge de notificaciones (ara per usuari)
function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) {
        console.warn('Element notificationBadge no trobat');
        return;
    }

    // Obtenir notificacions de l'usuari actual
    const notifications = UserDataManager.getNotifications();
    const unreadNotifications = notifications.filter(n => n.unread);
    const urgentNotifications = notifications.filter(n => n.priority === 'high' && n.unread);

    const unreadCount = unreadNotifications.length;
    const urgentCount = urgentNotifications.length;

    console.log('Actualitzant badge - Notificacions no llegides:', unreadCount);

    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'inline-block';
        badge.style.visibility = 'visible';
        badge.style.opacity = '1';

        // Canviar color segons urgència
        if (urgentCount > 0) {
            badge.style.background = 'linear-gradient(135deg, #ff5252 0%, #d32f2f 100%)';
            badge.style.animation = 'pulse 2s ease-in-out infinite';
        } else {
            badge.style.background = '#d32f2f';
            badge.style.animation = 'none';
        }
    } else {
        badge.style.display = 'none';
    }
}

// Verificar si l'usuari ja pot tornar a donar sang
function checkIfCanDonateAgain() {
    const userData = UserDataManager.getCurrentUserData();
    if (!userData || userData.donations.list.length === 0) return;

    // Obtenir la donació més recent per data
    const sortedDonations = [...userData.donations.list].sort((a, b) => {
        const dateA = new Date(a.date || a.timestamp);
        const dateB = new Date(b.date || b.timestamp);
        return dateB - dateA;
    });
    const lastDonation = sortedDonations[0];
    const lastDate = new Date(lastDonation.date || lastDonation.timestamp);
    const nextAvailable = new Date(lastDate);
    nextAvailable.setMonth(nextAvailable.getMonth() + 3);
    const today = new Date();

    // Comprovar si ja es pot donar i no s'ha notificat avui
    const lastNotificationCheck = localStorage.getItem(`lastDonationCheck_${userData.profile.email}`);
    const todayStr = today.toDateString();

    if (nextAvailable <= today && lastNotificationCheck !== todayStr) {
        // Verificar si ja hi ha una notificació de tipus "available"
        const hasAvailableNotification = userData.notifications.list.some(n =>
            n.type === 'reminders' &&
            n.title.includes('tornar a donar') &&
            n.unread
        );

        if (!hasAvailableNotification) {
            // Crear notificació
            UserDataManager.createAvailableToDonateNotification();

            // Guardar que ja s'ha comprovat avui
            localStorage.setItem(`lastDonationCheck_${userData.profile.email}`, todayStr);

            // Actualitzar badge
            setTimeout(() => {
                updateNotificationBadge();
            }, 100);
        }
    }
}
