// Inicialització
document.addEventListener('DOMContentLoaded', () => {
    setupSearchFunctionality();
    setupLocationButton();
    setupHospitalButtons();
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

// Configurar botó d'ubicació
function setupLocationButton() {
    const useLocationBtn = document.getElementById('useLocationBtn');

    useLocationBtn.addEventListener('click', () => {
        if ('geolocation' in navigator) {
            useLocationBtn.classList.add('loading');

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    findNearestCity(latitude, longitude);
                    useLocationBtn.classList.remove('loading');
                },
                (error) => {
                    console.error('Error obtenint ubicació:', error);
                    alert('No s\'ha pogut obtenir la teva ubicació.\n\nSi us plau, assegura\'t que has donat permís al navegador per accedir a la teva ubicació.');
                    useLocationBtn.classList.remove('loading');
                }
            );
        } else {
            alert('El teu navegador no suporta geolocalització.');
        }
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
        filterLocations(nearestCity.toLowerCase());

        // Scroll a la primera secció visible
        const firstVisibleSection = document.querySelector('.city-section[style*="display: block"]') ||
            document.querySelector('.city-section:not([style*="display: none"])');
        if (firstVisibleSection) {
            firstVisibleSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
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

// Configurar botons dels hospitals
function setupHospitalButtons() {
    // Botons "Dona sang"
    const primaryButtons = document.querySelectorAll('.btn-primary');
    primaryButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const hospitalCard = btn.closest('.hospital-card');
            const hospitalName = hospitalCard.querySelector('h4').textContent.trim();
            const citySection = btn.closest('.city-section');
            const cityName = citySection.dataset.city;

            showDonationInfo(hospitalName, cityName);
        });
    });

    // Botons "Zona plasma"
    const secondaryButtons = document.querySelectorAll('.btn-secondary');
    secondaryButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const hospitalCard = btn.closest('.hospital-card');
            const hospitalName = hospitalCard.querySelector('h4').textContent.trim();
            const citySection = btn.closest('.city-section');
            const cityName = citySection.dataset.city;

            showPlasmaInfo(hospitalName, cityName);
        });
    });
}

// Mostrar informació de donació de sang
function showDonationInfo(hospitalName, cityName) {
    const message = `📍 ${hospitalName}\n${cityName}\n\n` +
        `Per donar sang en aquest centre:\n\n` +
        `✓ Horari: De dilluns a divendres, de 8:00h a 20:00h\n` +
        `✓ No cal cita prèvia\n` +
        `✓ Recorda portar el DNI o document d'identitat\n` +
        `✓ És recomanable haver menjat abans\n\n` +
        `Vols reservar una cita?`;

    if (confirm(message)) {
        // Aquí es podria implementar la funcionalitat de reserva
        alert('🗓️ Redirigint al sistema de reserves...\n\n(Funcionalitat en desenvolupament)');
    }
}

// Mostrar informació de donació de plasma
function showPlasmaInfo(hospitalName, cityName) {
    const message = `🩸 Zona de Plasma\n\n` +
        `📍 ${hospitalName}\n${cityName}\n\n` +
        `La donació de plasma requereix:\n\n` +
        `✓ Cita prèvia obligatòria\n` +
        `✓ Durada aproximada: 45-60 minuts\n` +
        `✓ Es pot donar cada 15 dies\n` +
        `✓ Portar DNI o document d'identitat\n\n` +
        `Vols més informació o reservar cita?`;

    if (confirm(message)) {
        alert('📞 Contactant amb el centre...\n\n(Funcionalitat en desenvolupament)');
    }
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
