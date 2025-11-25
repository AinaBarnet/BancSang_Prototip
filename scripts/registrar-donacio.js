// Protegir la pàgina - requerir autenticació
if (!AuthManager.requireAuth()) {
    throw new Error('Accés no autoritzat');
}

// Inicialitzar la pàgina
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadLastDonation();
});


// Configurar event listeners
function setupEventListeners() {
    // Botons principals
    const manualFormBtn = document.getElementById('manualFormBtn');
    const codeFormBtn = document.getElementById('codeFormBtn');

    manualFormBtn.addEventListener('click', openDonationModal);
    codeFormBtn.addEventListener('click', openCodeModal);

    // Modal de formulari manual
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

    // Gestionar canvi de tipus de donació
    const donationType = document.getElementById('donationType');
    const volumeGroup = document.getElementById('volumeGroup');
    const donationVolume = document.getElementById('donationVolume');

    donationType.addEventListener('change', (e) => {
        if (e.target.value === 'Plasma') {
            volumeGroup.style.display = 'none';
            donationVolume.required = false;
        } else {
            volumeGroup.style.display = 'block';
            donationVolume.required = false;
            donationVolume.value = 450;
        }
    });

    // Gestionar enviament del formulari
    donationForm.addEventListener('submit', handleDonationFormSubmit);

    // Modal de codi
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
}

// Funcions per modal de formulari manual
function openDonationModal() {
    // Comprovar si l'usuari pot donar
    const nextAvailableDate = UserDataManager.getNextAvailableDonationDate();

    if (nextAvailableDate) {
        // L'usuari encara no pot donar
        const formattedDate = nextAvailableDate.toLocaleDateString('ca-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const message = `Encara no han passat <strong>3 mesos</strong> des de la teva última donació.<br><br><span class="date-highlight">Podràs tornar a donar a partir del:<br>${formattedDate}`;
        modalManager.warning(message, 'No pots donar sang encara');
        return; // No obrir el modal
    }

    const modal = document.getElementById('donationModal');
    const form = document.getElementById('donationForm');
    const errorDiv = document.getElementById('donationError');

    // Reset form and errors
    form.reset();
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }

    // Establir la data d'avui per defecte
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('donationDate').value = today;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDonationModal() {
    const modal = document.getElementById('donationModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function handleDonationFormSubmit(e) {
    e.preventDefault();

    // Obtenir dades del formulari
    let center = document.getElementById('donationCenter').value;
    if (center === 'other') {
        center = document.getElementById('otherCenter').value;
    }

    const date = document.getElementById('donationDate').value;
    const time = document.getElementById('donationTime').value;
    const type = document.getElementById('donationType').value;
    let volume = document.getElementById('donationVolume').value;

    // Ajustar volum segons tipus
    if (type === 'Plasma') {
        volume = null;
    } else if (!volume) {
        volume = 450;
    }

    const donation = {
        center: center,
        date: date,
        time: time,
        type: type,
        volume: volume ? parseInt(volume, 10) : null,
        method: 'Manual',
        timestamp: Date.now()
    };

    // Guardar donació
    const success = saveDonation(donation);

    // Només continuar si s'ha guardat correctament
    if (!success) {
        return;
    }

    const modal = document.getElementById('donationModal');
    const form = document.getElementById('donationForm');

    // Reset form
    form.reset();
    document.getElementById('otherCenterGroup').style.display = 'none';

    // Configurar dates del calendari
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('donationDate');

    // Establir data màxima (avui) i mínima (si hi ha donació anterior, 3 mesos després)
    dateInput.max = today;

    // Si hi ha donacions prèvies, establir data mínima
    const userDonations = UserDataManager.getDonations();
    if (userDonations && userDonations.list.length > 0) {
        const lastDonation = userDonations.list[0];
        const lastDate = new Date(lastDonation.date || lastDonation.timestamp);
        const minDate = new Date(lastDate);
        minDate.setMonth(minDate.getMonth() + 3);
        dateInput.min = minDate.toISOString().split('T')[0];
    }

    dateInput.value = today;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDonationModal() {
    const modal = document.getElementById('donationModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function handleDonationFormSubmit(e) {
    e.preventDefault();

    const date = document.getElementById('donationDate').value;
    const centerSelect = document.getElementById('donationCenter').value;
    const center = centerSelect === 'other'
        ? document.getElementById('otherCenter').value
        : centerSelect;
    const type = document.getElementById('donationType').value;
    const volume = type === 'Plasma' ? null : document.getElementById('donationVolume').value;
    const observations = document.getElementById('observations').value;

    const donation = {
        date: date,
        center: center,
        type: type,
        volume: volume ? parseInt(volume) : null,
        observations: observations,
        method: 'Formulari',
        timestamp: Date.now()
    };

    // Guardar donació
    const success = saveDonation(donation);

    // Només continuar si s'ha guardat correctament
    if (!success) {
        return; // No tancar el modal, deixar que l'usuari corregeixi
    }

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

    const volumeText = donation.volume ? `\nVolum: ${donation.volume} ml` : '';

    modalManager.success(`Centre: ${donation.center}\nData: ${formattedDate}\nTipus: ${donation.type}${volumeText}\n\nGràcies per la teva col·laboració solidària!`, 'Donació registrada!');
}

// Funcions per modal de codi
function openCodeModal() {
    // Comprovar si l'usuari pot donar
    const nextAvailableDate = UserDataManager.getNextAvailableDonationDate();

    if (nextAvailableDate) {
        // L'usuari encara no pot donar
        const formattedDate = nextAvailableDate.toLocaleDateString('ca-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const message = `Encara no han passat <strong>3 mesos</strong> des de la teva última donació.<br><br><span class="date-highlight">Podràs tornar a donar a partir del:<br>${formattedDate}`;
        modalManager.warning(message, 'No pots registrar una donació encara');
        return; // No obrir el modal
    }

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
    const codePattern = /^[A-Z]{3}-[0-9]{8}-[0-9]{6}$/;
    if (!codePattern.test(code)) {
        errorDiv.style.display = 'block';
        errorDiv.querySelector('p').textContent = 'El format del codi no és correcte. Utilitza el format XXX-AAAAMMDD-XXXXXX';
        return;
    }

    // Verificar si el codi ja s'ha utilitzat
    const usedCodes = JSON.parse(localStorage.getItem('usedDonationCodes') || '[]');
    if (usedCodes.includes(code)) {
        errorDiv.querySelector('p').textContent = 'Aquest codi ja ha estat utilitzat anteriorment.';
        errorDiv.style.display = 'block';
        return;
    }

    // Extreure informació del codi
    const [prefix, dateStr, number] = code.split('-');

    // Extreure la data del codi (format: AAAAMMDD)
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const donationDate = `${year}-${month}-${day}`;
    const centerMap = {
        'BST': 'Banc de Sang i Teixits - Barcelona',
        'HVH': 'Hospital Universitari Vall d\'Hebron - Barcelona',
        'HSP': 'Hospital de la Santa Creu i Sant Pau - Barcelona',
        'HCB': 'Hospital Clínic - Barcelona',
        'HGT': 'Hospital Germans Trias i Pujol - Badalona',
        'HBV': 'Hospital Universitari de Bellvitge - L\'Hospitalet',
        'HSJ': 'Fundació Althaia - Hospital Sant Joan de Déu - Manresa',
        'HMT': 'Hospital Universitari Mútua Terrassa - Terrassa',
        'HGI': 'Hospital Universitari de Girona Doctor Josep Trueta - Girona',
        'HAV': 'Hospital Universitari Arnau de Vilanova - Lleida',
        'HJ3': 'Hospital Universitari Joan XXIII - Tarragona',
        'HVC': 'Hospital Verge de la Cinta - Tortosa',
        'HSR': 'Hospital Universitari Sant Joan de Reus - Reus'
    };

    const donation = {
        code: code,
        center: centerMap[prefix] || 'Centre de donació',
        date: donationDate,
        type: 'Sang',
        volume: 450,
        method: 'Codi',
        timestamp: Date.now()
    };

    // Guardar donació (validar primer)
    const success = saveDonation(donation);

    // Només continuar si s'ha guardat correctament
    if (!success) {
        return; // No tancar el modal ni guardar el codi com a utilitzat
    }

    // Guardar codi com a utilitzat DESPRÉS de validar
    usedCodes.push(code);
    localStorage.setItem('usedDonationCodes', JSON.stringify(usedCodes));

    // Actualitzar visualització
    loadLastDonation();

    // Tancar modal
    closeCodeModal();

    // Mostrar confirmació
    showCodeSuccessMessage(donation);
}

function showCodeSuccessMessage(donation) {
    modalManager.success(`Codi: ${donation.code}\nCentre: ${donation.center}\nData: ${new Date(donation.date).toLocaleDateString('ca-ES')}\n\nGràcies per la teva col·laboració solidària!`, '✅ Donació registrada amb codi!');
}

// Funcions auxiliars
function saveDonation(donation) {
    // Guardar la donació amb UserDataManager
    const result = UserDataManager.addDonation(donation);

    // Comprovar si hi ha hagut un error de validació
    if (result && !result.success) {
        // Mostrar error a l'usuari
        modalManager.error(result.error, 'ERROR en registrar la donació');
        return false;
    }

    // --- ACTUALITZAR VALORS GLOBALS ---
    // Total mensual
    let totalDonations = parseInt(localStorage.getItem('global_totalDonations') || '0', 10);
    totalDonations++;
    localStorage.setItem('global_totalDonations', totalDonations.toString());

    // Donacions d'avui
    const todayStr = new Date().toISOString().split('T')[0];
    const storedTodayDate = localStorage.getItem('global_todayDonations_date');
    let todayDonations = 0;
    if (storedTodayDate === todayStr) {
        todayDonations = parseInt(localStorage.getItem('global_todayDonations') || '0', 10) + 1;
    } else {
        todayDonations = 1;
        localStorage.setItem('global_todayDonations_date', todayStr);
    }
    localStorage.setItem('global_todayDonations', todayDonations.toString());

    return true;
}

function loadLastDonation() {
    const userDonations = UserDataManager.getDonations();
    const lastDonationInfo = document.getElementById('lastDonationInfo');

    if (!userDonations || userDonations.list.length === 0) {
        lastDonationInfo.innerHTML = '<p>Encara no has registrat cap donació</p>';
        return;
    }

    // Obtenir la donació més recent per data
    const sortedDonations = [...userDonations.list].sort((a, b) => {
        const dateA = new Date(a.date || a.timestamp);
        const dateB = new Date(b.date || b.timestamp);
        return dateB - dateA;
    });
    const lastDonation = sortedDonations[0];
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
