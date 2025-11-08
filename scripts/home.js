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
    loadNotifications();
    updateNotificationBadge();
});

// Carregar i renderitzar notificacions
function loadNotifications() {
    const unreadNotifications = NotificationsManager.getUnread().slice(0, 4);
    const notificationList = document.querySelector('.notification-list');

    notificationList.innerHTML = '';

    if (unreadNotifications.length === 0) {
        notificationList.innerHTML = '<div style="padding: 2rem; text-align: center; color: #999;"><p>No hi ha notificacions noves</p></div>';
        return;
    }

    unreadNotifications.forEach(notification => {
        const card = createNotificationCard(notification);
        notificationList.appendChild(card);
    });

    setupNotificationListeners();
}

// Crear targeta de notificació
function createNotificationCard(notification) {
    const card = document.createElement('div');
    card.className = `notification-card${notification.unread ? ' unread' : ''}`;
    card.dataset.id = notification.id;

    card.innerHTML = `
        <div class="notification-icon ${notification.iconClass}">${notification.icon}</div>
        <div class="notification-content">
            <h5>${notification.title}</h5>
            <p>${notification.description}</p>
            <span class="notification-time">${notification.time}</span>
        </div>
        <button class="notification-close">✕</button>
    `;

    return card;
}

// Configurar listeners de notificacions
function setupNotificationListeners() {
    // Marcar totes com llegides
    const markAllReadBtn = document.getElementById('markAllRead');
    if (markAllReadBtn) {
        markAllReadBtn.replaceWith(markAllReadBtn.cloneNode(true));
        document.getElementById('markAllRead').addEventListener('click', (e) => {
            e.stopPropagation();
            NotificationsManager.markAllAsRead();
            loadNotifications();
            updateNotificationBadge();
        });
    }

    // Tancar notificacions individuals
    const closeButtons = document.querySelectorAll('.notification-close');
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = button.closest('.notification-card');
            const id = parseInt(card.dataset.id);

            card.style.opacity = '0';
            card.style.transform = 'translateX(20px)';

            setTimeout(() => {
                NotificationsManager.remove(id);
                loadNotifications();
                updateNotificationBadge();
            }, 300);
        });
    });

    // Click en notificació per marcar com llegida
    const notificationCards = document.querySelectorAll('.notification-card');
    notificationCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('notification-close')) {
                const id = parseInt(card.dataset.id);
                NotificationsManager.markAsRead(id);
                card.classList.remove('unread');
                updateNotificationBadge();
            }
        });
    });
}

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
        // Cerrar submenus si están abiertos
        const notificationsSubmenu = document.getElementById('notificationsSubmenu');
        notificationsSubmenu.classList.remove('active');
        document.getElementById('notificationsBtn').classList.remove('active');
    });

    // Cerrar el menú al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!userMenuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('active');
            userMenuBtn.classList.remove('active');
            // Cerrar submenus
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

    // Actualitzar quan es modifiquen les notificacions
    window.addEventListener('notificationsUpdated', () => {
        loadNotifications();
        updateNotificationBadge();
    });

    // Register Donation submenu
    const registerDonationBtn = document.getElementById('registerDonationBtn');
    const registerDonationSubmenu = document.getElementById('registerDonationSubmenu');

    registerDonationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        registerDonationBtn.classList.toggle('active');
        registerDonationSubmenu.classList.toggle('active');
        // Tancar altres submenus
        notificationsSubmenu.classList.remove('active');
        notificationsBtn.classList.remove('active');
    });

    // Locations submenu
    const locationsBtn = document.getElementById('locationsBtn');
    const locationsSubmenu = document.getElementById('locationsSubmenu');

    locationsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        locationsBtn.classList.toggle('active');
        locationsSubmenu.classList.toggle('active');
        // Tancar altres submenus
        notificationsSubmenu.classList.remove('active');
        notificationsBtn.classList.remove('active');
        registerDonationSubmenu.classList.remove('active');
        registerDonationBtn.classList.remove('active');
    });

    // Location card buttons
    const locationBtns = document.querySelectorAll('.location-btn');
    locationBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.location-card');
            const locationName = card.querySelector('h5').textContent;
            alert(`Informació detallada de:\n${locationName}\n\n(Aquesta funcionalitat s'implementarà properment)`);
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

    // Manual Form
    const manualFormBtn = document.getElementById('manualFormBtn');
    manualFormBtn.addEventListener('click', () => {
        openDonationModal();
    });

    // Code Form
    const codeFormBtn = document.getElementById('codeFormBtn');
    codeFormBtn.addEventListener('click', () => {
        openCodeModal();
    });

    // Modal controls
    const donationModal = document.getElementById('donationModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelFormBtn = document.getElementById('cancelFormBtn');
    const donationForm = document.getElementById('donationForm');
    const donationCenter = document.getElementById('donationCenter');
    const otherCenterGroup = document.getElementById('otherCenterGroup');

    closeModalBtn.addEventListener('click', closeDonationModal);
    cancelFormBtn.addEventListener('click', closeDonationModal);

    donationModal.addEventListener('click', (e) => {
        if (e.target === donationModal) {
            closeDonationModal();
        }
    });

    // Mostrar/ocultar camp "Altre centre"
    donationCenter.addEventListener('change', (e) => {
        if (e.target.value === 'other') {
            otherCenterGroup.style.display = 'block';
            document.getElementById('otherCenter').required = true;
        } else {
            otherCenterGroup.style.display = 'none';
            document.getElementById('otherCenter').required = false;
        }
    });

    // Gestionar enviament del formulari
    donationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleDonationFormSubmit();
    });

    // Code Modal controls
    const codeModal = document.getElementById('codeModal');
    const closeCodeModalBtn = document.getElementById('closeCodeModalBtn');
    const cancelCodeBtn = document.getElementById('cancelCodeBtn');
    const codeForm = document.getElementById('codeForm');

    closeCodeModalBtn.addEventListener('click', closeCodeModal);
    cancelCodeBtn.addEventListener('click', closeCodeModal);

    codeModal.addEventListener('click', (e) => {
        if (e.target === codeModal) {
            closeCodeModal();
        }
    });

    codeForm.addEventListener('submit', handleCodeFormSubmit);

    // Carregar última donació
    loadLastDonation();

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

// Funcions per registrar donacions
function openDonationModal(qrData = null) {
    const modal = document.getElementById('donationModal');
    const form = document.getElementById('donationForm');

    // Reset form
    form.reset();
    document.getElementById('otherCenterGroup').style.display = 'none';

    // Establir data d'avui per defecte
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('donationDate').value = today;
    document.getElementById('donationDate').max = today; // No permetre dates futures

    // Si hi ha dades del QR, pre-omplir el formulari
    if (qrData) {
        document.getElementById('donationDate').value = qrData.date;
        document.getElementById('donationCenter').value = qrData.center;
        document.getElementById('donationType').value = qrData.type;
        document.getElementById('donationVolume').value = qrData.volume;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDonationModal() {
    const modal = document.getElementById('donationModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Funcions per modal de codi
function openCodeModal() {
    const modal = document.getElementById('codeModal');
    const form = document.getElementById('codeForm');
    const errorDiv = document.getElementById('codeError');

    // Reset form and errors
    form.reset();
    errorDiv.style.display = 'none';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCodeModal() {
    const modal = document.getElementById('codeModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function handleCodeFormSubmit(e) {
    e.preventDefault();

    const code = document.getElementById('donationCode').value.toUpperCase();
    const errorDiv = document.getElementById('codeError');

    // Validar format del codi
    const codePattern = /^[A-Z]{3}-[0-9]{4}-[0-9]{6}$/;
    if (!codePattern.test(code)) {
        errorDiv.style.display = 'block';
        return;
    }

    // Verificar si el codi ja s'ha utilitzat
    const usedCodes = JSON.parse(localStorage.getItem('usedDonationCodes') || '[]');
    if (usedCodes.includes(code)) {
        errorDiv.querySelector('p').textContent = 'Aquest codi ja ha estat utilitzat anteriorment.';
        errorDiv.style.display = 'block';
        return;
    }

    // Simular validació del codi (en producció es faria una crida al servidor)
    // Per ara, acceptem qualsevol codi amb el format correcte

    // Extreure informació del codi
    const [prefix, year, number] = code.split('-');
    const centerMap = {
        'BST': 'Banc de Sang i Teixits - Barcelona',
        'HCB': 'Hospital Clínic - Barcelona',
        'HVH': 'Hospital Vall d\'Hebron - Barcelona',
        'HBV': 'Hospital de Bellvitge - L\'Hospitalet',
        'HGT': 'Hospital Germans Trias i Pujol - Badalona'
    };

    const donation = {
        code: code,
        center: centerMap[prefix] || 'Centre de donació',
        date: new Date().toISOString().split('T')[0],
        type: 'Sang total',
        volume: 450,
        method: 'Codi',
        timestamp: Date.now()
    };

    // Guardar codi com a utilitzat
    usedCodes.push(code);
    localStorage.setItem('usedDonationCodes', JSON.stringify(usedCodes));

    // Guardar donació
    const donations = JSON.parse(localStorage.getItem('userDonations') || '[]');
    donations.push(donation);
    localStorage.setItem('userDonations', JSON.stringify(donations));

    // Actualitzar comptador global
    addDonation();

    // Actualitzar visualització
    loadLastDonation();

    // Tancar modal
    closeCodeModal();

    // Mostrar confirmació
    showCodeSuccessMessage(donation);
}

function showCodeSuccessMessage(donation) {
    alert(`✅ Donació registrada correctament amb codi!\n\n` +
        `Codi: ${donation.code}\n` +
        `Centre: ${donation.center}\n` +
        `Data: ${new Date(donation.date).toLocaleDateString('ca-ES')}\n\n` +
        `Gràcies per la teva col·laboració solidària!`);
}

function handleDonationFormSubmit() {
    const date = document.getElementById('donationDate').value;
    const centerSelect = document.getElementById('donationCenter').value;
    const center = centerSelect === 'other'
        ? document.getElementById('otherCenter').value
        : centerSelect;
    const type = document.getElementById('donationType').value;
    const volume = document.getElementById('donationVolume').value;
    const observations = document.getElementById('observations').value;

    const donation = {
        date: date,
        center: center,
        type: type,
        volume: parseInt(volume),
        observations: observations,
        timestamp: Date.now()
    };

    // Guardar donació
    const donations = JSON.parse(localStorage.getItem('userDonations') || '[]');
    donations.push(donation);
    localStorage.setItem('userDonations', JSON.stringify(donations));

    // Actualitzar comptador global
    addDonation();

    // Actualitzar visualització
    loadLastDonation();

    // Tancar modal
    closeDonationModal();

    // Mostrar confirmació
    showSuccessMessage(donation);
}

function showSuccessMessage(donation) {
    const formattedDate = new Date(donation.date).toLocaleDateString('ca-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    alert(`✅ Donació registrada correctament!\n\n` +
        `Centre: ${donation.center}\n` +
        `Data: ${formattedDate}\n` +
        `Tipus: ${donation.type}\n` +
        `Volum: ${donation.volume} ml\n\n` +
        `Gràcies per la teva col·laboració solidària!`);
}

function registerDonation(method, location) {
    const donation = {
        date: new Date().toISOString(),
        method: method,
        location: location,
        timestamp: Date.now()
    };

    // Guardar donació
    const donations = JSON.parse(localStorage.getItem('userDonations') || '[]');
    donations.push(donation);
    localStorage.setItem('userDonations', JSON.stringify(donations));

    // Actualitzar comptador global
    addDonation();

    // Actualitzar visualització
    loadLastDonation();

    // Mostrar confirmació
    alert('✅ Donació registrada correctament!\n\nGràcies per la teva col·laboració!');
}

function showDonationForm() {
    const location = prompt('Introdueix el nom del centre de donació:', 'Centre Banc de Sang');

    if (location) {
        const confirm = window.confirm(`Confirmes el registre de la donació?\n\nCentre: ${location}\nData: ${new Date().toLocaleDateString('ca-ES')}`);

        if (confirm) {
            registerDonation('Manual', location);
        }
    }
}

function loadLastDonation() {
    const donations = JSON.parse(localStorage.getItem('userDonations') || '[]');
    const lastDonationInfo = document.getElementById('lastDonationInfo');

    if (donations.length === 0) {
        lastDonationInfo.innerHTML = '<p>Encara no has registrat cap donació</p>';
        return;
    }

    const lastDonation = donations[donations.length - 1];
    const date = new Date(lastDonation.date || lastDonation.timestamp);
    const formattedDate = date.toLocaleDateString('ca-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const centerName = lastDonation.center || lastDonation.location || 'Centre no especificat';
    const donationType = lastDonation.type || 'Sang total';

    lastDonationInfo.innerHTML = `
        <div class="donation-detail">
            <span class="donation-icon">🩸</span>
            <div class="donation-text">
                <strong>${centerName}</strong>
                <span>${formattedDate}</span>
                <span class="donation-method">${donationType}</span>
            </div>
        </div>
    `;
}

// Exponer funciones globales para pruebas
window.addDonation = addDonation;
window.resetCounter = resetCounter;
