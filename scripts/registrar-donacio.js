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
    const modal = document.getElementById('donationModal');
    const form = document.getElementById('donationForm');

    // Reset form
    form.reset();
    document.getElementById('otherCenterGroup').style.display = 'none';

    // Establir data d'avui per defecte
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('donationDate').value = today;
    document.getElementById('donationDate').max = today; // No permetre dates futures

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
    saveDonation(donation);

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

    alert(`✅ Donació registrada correctament!\n\n` +
        `Centre: ${donation.center}\n` +
        `Data: ${formattedDate}\n` +
        `Tipus: ${donation.type}` +
        volumeText + `\n\n` +
        `Gràcies per la teva col·laboració solidària!`);
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

    // Guardar codi com a utilitzat
    usedCodes.push(code);
    localStorage.setItem('usedDonationCodes', JSON.stringify(usedCodes));

    // Guardar donació
    saveDonation(donation);

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

// Funcions auxiliars
function saveDonation(donation) {
    // Guardar la donació amb UserDataManager
    UserDataManager.addDonation(donation);
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
