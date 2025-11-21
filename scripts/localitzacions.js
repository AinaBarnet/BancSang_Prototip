// Protegir la pàgina - requerir autenticació
if (!AuthManager.requireAuth()) {
    throw new Error('Accés no autoritzat');
}

// Inicialització
document.addEventListener('DOMContentLoaded', () => {
    setupSearchFunctionality();
    setupLocationButton();
    setupHospitalButtons();
    setupModalListeners();

    // Comprovar si cal usar ubicació automàtica
    checkAutoLocation();
});

// Configurar funcionalitat de cerca
function setupSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        filterLocations(searchTerm);
    });
}

// Filtrar localitzacions segons el terme de cerca
function filterLocations(searchTerm) {
    const citySections = document.querySelectorAll('.city-section');
    const noResults = document.getElementById('noResults');
    let hasResults = false;

    citySections.forEach(section => {
        const cityName = section.dataset.city.toLowerCase();
        const comarca = section.dataset.comarca.toLowerCase();
        const hospitalNames = Array.from(section.querySelectorAll('.hospital-card h4'))
            .map(h => h.textContent.toLowerCase())
            .join(' ');

        // Comprovar si el terme de cerca coincideix amb ciutat, comarca o hospital
        const matches = cityName.includes(searchTerm) ||
            comarca.includes(searchTerm) ||
            hospitalNames.includes(searchTerm);

        if (matches || searchTerm === '') {
            section.style.display = 'block';
            hasResults = true;
        } else {
            section.style.display = 'none';
        }
    });

    // Mostrar missatge si no hi ha resultats
    if (!hasResults && searchTerm !== '') {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
    }
}

// Comprovar si s'ha d'usar ubicació automàtica
function checkAutoLocation() {
    const urlParams = new URLSearchParams(window.location.search);
    const autoLocate = urlParams.get('auto');

    // Si ve amb paràmetre auto=true, usar ubicació automàticament
    if (autoLocate === 'true') {
        setTimeout(() => {
            useCurrentLocation();
        }, 500);
    } return;
}

// Si no hi ha cerca prèvia, preguntar si vol usar la ubicació
const searchInput = document.getElementById('searchInput');
if (!searchInput.value && 'geolocation' in navigator) {
    // Mostrar suggeriment per usar ubicació
    showLocationSuggestion();
}

// Mostrar suggeriment per usar la ubicació actual
function showLocationSuggestion() {
    // Esperar 1 segon abans de mostrar el suggeriment
    setTimeout(() => {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput.value) {
            modalManager.confirm(
                'Vols que busquem els centres de donació més propers a la teva ubicació actual?',
                'Podem conèixer la teva ubicació?',
                () => {
                    useCurrentLocation();
                },
                () => {
                    // L\'usuari ha dit que no
                    console.log('Usuari ha rebutjat usar ubicació');
                }
            );
        }
    }, 1000);
}

// Usar ubicació actual
function useCurrentLocation() {
    if ('geolocation' in navigator) {
        const useLocationBtn = document.getElementById('useLocationBtn');
        useLocationBtn.classList.add('loading');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                findNearestCity(latitude, longitude);
                useLocationBtn.classList.remove('loading');

                // Mostrar missatge d'èxit
                const searchInput = document.getElementById('searchInput');
                if (searchInput.value) {
                    modalManager.success(
                        `Hem trobat centres de donació prop de ${searchInput.value}.`,
                        '✓ Ubicació detectada'
                    );
                }
            },
            (error) => {
                console.error('Error obtenint ubicació:', error);

                let errorMessage = 'No s\'ha pogut obtenir la teva ubicació.';
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage = 'Has denegat l\'accés a la ubicació. Si vols usar aquesta funció, activa els permisos d\'ubicació al teu navegador.';
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    errorMessage = 'La informació d\'ubicació no està disponible en aquest moment.';
                } else if (error.code === error.TIMEOUT) {
                    errorMessage = 'La sol·licitud d\'ubicació ha excedit el temps d\'espera.';
                }

                showAlert('⚠️ Error d\'ubicació', errorMessage);
                useLocationBtn.classList.remove('loading');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minuts de caché
            }
        );
    } else {
        showAlert('⚠️ No disponible', 'El teu navegador no suporta geolocalització.');
    }
}

// Configurar botó d'ubicació
function setupLocationButton() {
    const useLocationBtn = document.getElementById('useLocationBtn');

    useLocationBtn.addEventListener('click', () => {
        useCurrentLocation();
    });
}

// Coordenades de les ciutats principals
const CITY_COORDINATES = {
    'Barcelona': { lat: 41.3851, lon: 2.1734 },
    'Girona': { lat: 41.9794, lon: 2.8214 },
    "L'Hospitalet de Llobregat": { lat: 41.3598, lon: 2.1001 },
    'Lleida': { lat: 41.6175, lon: 0.6200 },
    'Manresa': { lat: 41.7267, lon: 1.8285 },
    'Reus': { lat: 41.1556, lon: 1.1064 },
    'Tarragona': { lat: 41.1189, lon: 1.2445 },
    'Terrassa': { lat: 41.5633, lon: 2.0086 },
    'Tortosa': { lat: 40.8125, lon: 0.5208 }
};

// Trobar la ciutat més propera
function findNearestCity(lat, lon) {
    let nearestCity = null;
    let minDistance = Infinity;

    Object.entries(CITY_COORDINATES).forEach(([city, coords]) => {
        const distance = calculateDistance(lat, lon, coords.lat, coords.lon);

        if (distance < minDistance) {
            minDistance = distance;
            nearestCity = city;
        }
    });

    if (nearestCity) {
        const searchInput = document.getElementById('searchInput');
        searchInput.value = nearestCity;

        // Afegir una animació subtil al input
        searchInput.style.transition = 'all 0.3s ease';
        searchInput.style.transform = 'scale(1.02)';
        setTimeout(() => {
            searchInput.style.transform = 'scale(1)';
        }, 300);

        filterLocations(nearestCity.toLowerCase());

        // Scroll a la primera secció visible amb una mica de delay per a millor UX
        setTimeout(() => {
            const firstVisibleSection = document.querySelector('.city-section[style*="display: block"]') ||
                document.querySelector('.city-section:not([style*="display: none"])');
            if (firstVisibleSection) {
                firstVisibleSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 400);
    }
}

// Fórmula de Haversine per calcular distància
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radi de la Terra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

// Mapa d'IDs d'hospitals amb les seves URLs
const HOSPITAL_URLS = {
    '1': 'https://www.bancsang.net/ca/hospitals/1/hospital-universitari-vall-d-hebron',
    '2': 'https://www.bancsang.net/ca/hospitals/2/hospital-de-la-santa-creu-i-sant-pau',
    '3': 'https://www.bancsang.net/ca/hospitals/3/hospital-clinic',
    '4': 'https://www.bancsang.net/ca/hospitals/4/germans-trias-i-pujol',
    '5': 'https://www.bancsang.net/ca/hospitals/5/hospital-universitari-de-bellvitge',
    '7': 'https://www.bancsang.net/ca/hospitals/7/fundacio-althaia-hospital-sant-joan-de-deu',
    '8': 'https://www.bancsang.net/ca/hospitals/8/hospital-universitari-mutua-terrassa',
    '9': 'https://www.bancsang.net/ca/hospitals/9/hospital-universitari-de-girona-doctor-josep-trueta',
    '10': 'https://www.bancsang.net/ca/hospitals/10/hospital-universitari-arnau-de-vilanova',
    '11': 'https://www.bancsang.net/ca/hospitals/11/hospital-universitari-joan-xxiii',
    '12': 'https://www.bancsang.net/ca/hospitals/12/hospital-verge-de-la-cinta',
    '13': 'https://www.bancsang.net/ca/hospitals/13/hospital-universitari-sant-joan-de-reus'
};

// Configurar botons dels hospitals
function setupHospitalButtons() {
    // Botons "Vull donar"
    const donateButtons = document.querySelectorAll('.btn-donate');
    donateButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const hospitalCard = btn.closest('.hospital-card');
            const hospitalId = hospitalCard.dataset.hospitalId;
            const hospitalUrl = HOSPITAL_URLS[hospitalId];

            if (hospitalUrl) {
                // Redirigir a la pàgina del Banc de Sang
                window.open(hospitalUrl, '_blank');
            } else {
                showAlert('⚠️ Error', 'No s\'ha pogut trobar la informació d\'aquest hospital.');
            }
        });
    });
}

// Mostrar modal genèric
function showModal(icon, title, content, actions) {
    const modal = document.getElementById('infoModal');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const modalActions = document.getElementById('modalActions');

    modalIcon.textContent = icon;
    modalTitle.textContent = title;
    modalContent.innerHTML = content;

    // Crear botons d'acció
    modalActions.innerHTML = '';
    actions.forEach(action => {
        const button = document.createElement('button');
        button.className = action.primary ? 'btn-modal-primary' : 'btn-modal-secondary';
        button.textContent = action.text;
        button.onclick = action.callback;
        modalActions.appendChild(button);
    });

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Tancar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Mostrar alerta simple utilitzant el sistema de modals
function showAlert(title, message) {
    // Determinar el tipus segons el títol
    if (title.includes('Error')) {
        modalManager.error(message, title);
    } else if (title.includes('⚠️') || title.toLowerCase().includes('avís')) {
        modalManager.warning(message, title);
    } else {
        modalManager.alert(message, title);
    }
}

// Configurar listeners dels modals
function setupModalListeners() {
    // Tancar modal d'informació
    document.getElementById('closeModalBtn').addEventListener('click', () => {
        closeModal('infoModal');
    });

    // Tancar modal d'alerta
    document.getElementById('closeAlertBtn').addEventListener('click', () => {
        closeModal('alertModal');
    });

    document.getElementById('alertOkBtn').addEventListener('click', () => {
        closeModal('alertModal');
    });

    // Tancar en fer clic fora del modal
    document.getElementById('infoModal').addEventListener('click', (e) => {
        if (e.target.id === 'infoModal') {
            closeModal('infoModal');
        }
    });

    document.getElementById('alertModal').addEventListener('click', (e) => {
        if (e.target.id === 'alertModal') {
            closeModal('alertModal');
        }
    });

    // Tancar amb la tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('infoModal');
            closeModal('alertModal');
        }
    });
}

// Detectar si l'usuari ve de home.html amb cerca
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('cerca');

    if (search) {
        const searchInput = document.getElementById('searchInput');
        searchInput.value = search;
        filterLocations(search.toLowerCase());
    }
});
