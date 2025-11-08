// Variables globales
let totalDonations = 0;
let todayDonations = 0;
const maxDonations = 33000; // Meta mensual para desbloquear el premio

// Elementos del DOM
const donationCountEl = document.getElementById('donationCount');
const percentageEl = document.getElementById('percentage');
const bloodFillEl = document.getElementById('bloodFill');
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
    updateNotificationBadge();
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
    // Botón de chat
    const chatBtn = document.getElementById('chatBtn');
    chatBtn.addEventListener('click', () => {
        console.log('Chat - Por implementar');
        // TODO: Abrir interfaz de chat
        alert('📱 Xat\n\nLa funcionalitat de xat s\'està desenvolupant.\nProperement podràs enviar i rebre missatges en temps real!');
    });

    // Opción de configuración en el menú desplegable
    const configMenuItem = document.getElementById('configMenuItem');
    configMenuItem.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Configuración desde menú - Por implementar');
        // TODO: Navegar a página de configuración
        alert('⚙️ Configuració\n\nAquí podràs:\n• Gestionar el teu perfil\n• Configurar notificacions\n• Preferències d\'idioma\n• Privacitat i seguretat\n\n(En desenvolupament)');
    });

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

    // Register Donation - ara és un enllaç directe a registrar-donacio.html

    // Locations submenu
    const locationsBtn = document.getElementById('locationsBtn');
    const locationsSubmenu = document.getElementById('locationsSubmenu');

    locationsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        locationsBtn.classList.toggle('active');
        locationsSubmenu.classList.toggle('active');
    });

    // Location card buttons
    const locationBtns = document.querySelectorAll('.location-btn');
    locationBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.location-card');
            const locationName = card.querySelector('h5').textContent;
            // Redirigir a la pàgina de localitzacions amb el nom de l'hospital
            window.location.href = `localitzacions.html?cerca=${encodeURIComponent(locationName)}`;
        });
    });

    // Filter locations button
    const filterLocationsBtn = document.getElementById('filterLocationsBtn');
    if (filterLocationsBtn) {
        filterLocationsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            alert('Filtres de localitzacions:\n- Per distància\n- Per tipus de centre\n- Només oberts ara\n\n(Funcionalitat en desenvolupament)');
        });
    }

    // Calcular i actualitzar distàncies des de Mataró
    calculateDistancesFromMataro();
}

// Coordenades de referència - Mataró (centre ciutat)
const MATARO_COORDS = {
    lat: 41.5402,
    lon: 2.4444
};

// Coordenades dels centres de donació
const DONATION_CENTERS = {
    'Banc de Sang i Teixits - Barcelona': { lat: 41.4093, lon: 2.2058 },
    'Hospital Clínic - Barcelona': { lat: 41.3889, lon: 2.1522 },
    'Hospital Vall d\'Hebron - Barcelona': { lat: 41.4273, lon: 2.1396 },
    'Centre Cívic - Sabadell': { lat: 41.5489, lon: 2.1089 },
    'Hospital de Bellvitge - L\'Hospitalet': { lat: 41.3473, lon: 2.1111 }
};

// Fórmula de Haversine per calcular distància entre dues coordenades
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radi de la Terra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Arrodonir a 1 decimal
}

// Calcular distàncies des de Mataró i actualitzar la interfície
function calculateDistancesFromMataro() {
    const locationCards = document.querySelectorAll('.location-card');

    locationCards.forEach(card => {
        const locationName = card.querySelector('h5').textContent;
        const centerCoords = DONATION_CENTERS[locationName];

        if (centerCoords) {
            const distance = calculateDistance(
                MATARO_COORDS.lat,
                MATARO_COORDS.lon,
                centerCoords.lat,
                centerCoords.lon
            );

            // Actualitzar la distància a la targeta
            const distanceElement = card.querySelector('.location-distance');
            if (distanceElement) {
                distanceElement.textContent = `${distance} km`;
            }

            // Actualitzar l'atribut data-distance per possibles filtres futurs
            card.setAttribute('data-distance', distance);
        }
    });

    // Ordenar les localitzacions per distància
    sortLocationsByDistance();
}

// Ordenar localitzacions per distància
function sortLocationsByDistance() {
    const locationsList = document.querySelector('.locations-list');
    if (!locationsList) return;

    const cards = Array.from(locationsList.querySelectorAll('.location-card'));

    cards.sort((a, b) => {
        const distA = parseFloat(a.getAttribute('data-distance'));
        const distB = parseFloat(b.getAttribute('data-distance'));
        return distA - distB;
    });

    // Reordenar els elements al DOM
    cards.forEach(card => locationsList.appendChild(card));

    // Els controls de registre de donació ara estan a registrar-donacio.html

    // Click en la información del premio
    prizeInfoEl.addEventListener('click', () => {
        window.location.href = 'premio.html';
    });

    // Añadir estilo de cursor pointer al premio
    prizeInfoEl.style.cursor = 'pointer';
}

// Actualizar badge de notificaciones
function updateNotificationBadge() {
    const unreadCount = NotificationsManager.getUnreadCount();
    const urgentCount = NotificationsManager.getUrgent().length;
    const badge = document.getElementById('notificationBadge');

    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'inline-block';

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

// Función para resetear el contador (útil para pruebas)
function resetCounter() {
    totalDonations = 0;
    todayDonations = 0;
    saveDonations();
    updateDisplay();
}

// Les funcions de registre de donació ara estan a registrar-donacio.js

// Exponer funciones globales para pruebas
window.addDonation = addDonation;
window.resetCounter = resetCounter;
