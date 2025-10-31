// Elements del DOM
const markAllReadBtn = document.getElementById('markAllReadBtn');
const messagesList = document.getElementById('messagesList');
const emptyState = document.getElementById('emptyState');
const filterTabs = document.querySelectorAll('.tab-btn');
const newMessageBtn = document.getElementById('newMessageBtn');
const modalOverlay = document.getElementById('modalOverlay');
const modalCloseBtn = document.querySelector('.modal-close');
const messageForm = document.getElementById('messageForm');
const cancelBtn = document.querySelector('.btn-cancel');
const recipientSelect = document.getElementById('recipient');
const contactsGroup = document.getElementById('contactsGroup');
const contactSelect = document.getElementById('contactSelect');
const addContactBtn = document.getElementById('addContactBtn');
const deleteContactBtn = document.getElementById('deleteContactBtn');
const addContactModal = document.getElementById('addContactModal');
const addContactModalClose = document.getElementById('addContactModalClose');
const addContactForm = document.getElementById('addContactForm');
const cancelAddContactBtn = document.getElementById('cancelAddContactBtn');

// Clau de localStorage per als contactes
const CONTACTS_KEY = 'bancSang_contacts';

// Llista de contactes per defecte
const defaultContacts = [
    { id: 'contact-1', name: 'Anna Puig', avatar: '👤' },
    { id: 'contact-2', name: 'Marc Soler', avatar: '👤' },
    { id: 'contact-3', name: 'Laura Vidal', avatar: '👤' },
    { id: 'contact-4', name: 'Pau Ribas', avatar: '👤' },
    { id: 'contact-5', name: 'Marta Serra', avatar: '👤' }
];

// Obtenir contactes
function getContacts() {
    const stored = localStorage.getItem(CONTACTS_KEY);
    if (!stored) {
        localStorage.setItem(CONTACTS_KEY, JSON.stringify(defaultContacts));
        return defaultContacts;
    }
    return JSON.parse(stored);
}

// Guardar contactes
function saveContacts(contacts) {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
}

// Inicialitzar
document.addEventListener('DOMContentLoaded', () => {
    loadAllMessages();
    setupEventListeners();
    updateEmptyState();
    loadContacts();
});

// Carregar tots els missatges
function loadAllMessages() {
    const messages = MessagesManager.getAll();
    renderMessages(messages);
}

// Renderitzar missatges agrupats per dates
function renderMessages(messages) {
    messagesList.innerHTML = '';

    // Agrupar per dates
    const grouped = {
        'Avui': [],
        'Ahir': [],
        'Fa 2 dies': [],
        'Fa 3 dies': [],
        'Fa 5 dies': [],
        'Fa 1 setmana': []
    };

    messages.forEach(m => {
        if (grouped[m.date]) {
            grouped[m.date].push(m);
        }
    });

    // Crear grups de dates
    Object.keys(grouped).forEach(date => {
        if (grouped[date].length > 0) {
            const dateGroup = createDateGroup(date, grouped[date]);
            messagesList.appendChild(dateGroup);
        }
    });
}

// Crear grup de dates
function createDateGroup(date, messages) {
    const group = document.createElement('div');
    group.className = 'date-group';

    const header = document.createElement('h3');
    header.className = 'date-header';
    header.textContent = date;
    group.appendChild(header);

    messages.forEach(message => {
        const card = createMessageCard(message);
        group.appendChild(card);
    });

    return group;
}

// Crear targeta de missatge
function createMessageCard(message) {
    const card = document.createElement('div');
    card.className = `message-card${message.unread ? ' unread' : ''}`;
    card.dataset.id = message.id;

    card.innerHTML = `
        <div class="message-avatar">${message.avatar}</div>
        <div class="message-content">
            <div class="message-header">
                <h4>${message.sender}</h4>
                <span class="message-time">${message.time}</span>
            </div>
            <p>${message.message}</p>
        </div>
        <button class="message-close">✕</button>
    `;

    // Event listeners
    const closeBtn = card.querySelector('.message-close');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeMessage(card);
    });

    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('message-close')) {
            markAsRead(card);
        }
    });

    return card;
}

// Configurar event listeners
function setupEventListeners() {
    // Marcar tots com llegits
    markAllReadBtn.addEventListener('click', markAllAsRead);

    // Filtres
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filterMessages(tab.dataset.filter);
        });
    });

    // Modal de nou missatge
    newMessageBtn.addEventListener('click', openModal);
    modalCloseBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Mostrar/ocultar selector de contactes
    recipientSelect.addEventListener('change', (e) => {
        if (e.target.value === 'contacts') {
            contactsGroup.style.display = 'block';
            contactSelect.required = true;
        } else {
            contactsGroup.style.display = 'none';
            contactSelect.required = false;
            deleteContactBtn.style.display = 'none';
        }
    });

    // Mostrar/ocultar botó eliminar contacte
    contactSelect.addEventListener('change', (e) => {
        if (e.target.value) {
            deleteContactBtn.style.display = 'flex';
        } else {
            deleteContactBtn.style.display = 'none';
        }
    });

    // Eliminar contacte
    deleteContactBtn.addEventListener('click', handleDeleteContact);

    // Modal afegir contacte
    addContactBtn.addEventListener('click', openAddContactModal);
    addContactModalClose.addEventListener('click', closeAddContactModal);
    cancelAddContactBtn.addEventListener('click', closeAddContactModal);
    addContactModal.addEventListener('click', (e) => {
        if (e.target === addContactModal) {
            closeAddContactModal();
        }
    });

    // Afegir contacte
    addContactForm.addEventListener('submit', handleAddContact);

    // Enviar missatge
    messageForm.addEventListener('submit', handleSendMessage);
}

// Marcar tots com llegits
function markAllAsRead() {
    MessagesManager.markAllAsRead();
    loadAllMessages();
    showFeedback('Tots els missatges marcats com llegits');
}

// Marcar un missatge com llegit
function markAsRead(card) {
    const id = parseInt(card.dataset.id);
    if (card.classList.contains('unread')) {
        MessagesManager.markAsRead(id);
        card.classList.remove('unread');
        card.style.animation = 'flash 0.5s ease';
    }
}

// Eliminar missatge
function removeMessage(card) {
    const id = parseInt(card.dataset.id);
    card.style.opacity = '0';
    card.style.transform = 'translateX(30px)';

    setTimeout(() => {
        MessagesManager.remove(id);

        const dateGroup = card.closest('.date-group');
        const remainingCards = dateGroup.querySelectorAll('.message-card');

        if (remainingCards.length <= 1) {
            dateGroup.style.opacity = '0';
            setTimeout(() => {
                loadAllMessages();
                updateEmptyState();
            }, 300);
        } else {
            card.remove();
            updateEmptyState();
        }
    }, 300);
}

// Filtrar missatges
function filterMessages(filter) {
    let messages = MessagesManager.getAll();

    if (filter === 'unread') {
        messages = messages.filter(m => m.unread);
    } else if (filter === 'sent') {
        messages = MessagesManager.getSent();
    }

    renderMessages(messages);
    updateEmptyState();
}

// Actualitzar estat buit
function updateEmptyState() {
    const visibleCards = document.querySelectorAll('.message-card');
    const activeFilter = document.querySelector('.tab-btn.active').dataset.filter;

    if (visibleCards.length === 0) {
        messagesList.style.display = 'none';
        emptyState.style.display = 'block';

        if (activeFilter === 'unread') {
            emptyState.querySelector('h3').textContent = 'No hi ha missatges no llegits';
            emptyState.querySelector('p').textContent = 'Molt bé! Has llegit tots els missatges';
        } else if (activeFilter === 'sent') {
            emptyState.querySelector('h3').textContent = 'No hi ha missatges enviats';
            emptyState.querySelector('p').textContent = 'Encara no has enviat cap missatge';
        } else {
            emptyState.querySelector('h3').textContent = 'No hi ha missatges';
            emptyState.querySelector('p').textContent = 'Tots els teus missatges estan llegits';
        }
    } else {
        messagesList.style.display = 'flex';
        emptyState.style.display = 'none';
    }
}

// Mostrar feedback
function showFeedback(message) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback-toast';
    feedback.textContent = message;
    feedback.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: #4caf50;
        color: white;
        padding: 1rem 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideDown 0.3s ease;
    `;

    document.body.appendChild(feedback);

    setTimeout(() => {
        feedback.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => feedback.remove(), 300);
    }, 2000);
}

// Obrir modal
function openModal() {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Tancar modal
function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    messageForm.reset();
    contactsGroup.style.display = 'none';
    contactSelect.required = false;
}

// Carregar llista de contactes
function loadContacts() {
    const contacts = getContacts();
    contactSelect.innerHTML = '<option value="">Tria un contacte</option>';
    contacts.forEach(contact => {
        const option = document.createElement('option');
        option.value = contact.id;
        option.textContent = contact.name;
        contactSelect.appendChild(option);
    });
}

// Obrir modal afegir contacte
function openAddContactModal() {
    addContactModal.classList.add('active');
}

// Tancar modal afegir contacte
function closeAddContactModal() {
    addContactModal.classList.remove('active');
    addContactForm.reset();
}

// Gestionar afegir contacte
function handleAddContact(e) {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const avatar = document.querySelector('input[name="avatar"]:checked').value;

    if (!name || !avatar) {
        showFeedback('Si us plau, omple tots els camps');
        return;
    }

    // Crear nou contacte
    const contacts = getContacts();
    const newContact = {
        id: `contact-${Date.now()}`,
        name: name,
        avatar: avatar
    };

    contacts.push(newContact);
    saveContacts(contacts);

    // Actualitzar selector i tancar modal
    loadContacts();
    closeAddContactModal();
    showFeedback(`Contacte "${name}" afegit correctament!`);
}

// Gestionar eliminar contacte
function handleDeleteContact() {
    const selectedId = contactSelect.value;
    if (!selectedId) {
        showFeedback('Si us plau, selecciona un contacte');
        return;
    }

    const contacts = getContacts();
    const contactToDelete = contacts.find(c => c.id === selectedId);

    if (!contactToDelete) return;

    // Confirmar eliminació
    if (confirm(`Estàs segur que vols eliminar el contacte "${contactToDelete.name}"?`)) {
        const updatedContacts = contacts.filter(c => c.id !== selectedId);
        saveContacts(updatedContacts);

        // Actualitzar selector
        loadContacts();
        deleteContactBtn.style.display = 'none';
        showFeedback(`Contacte "${contactToDelete.name}" eliminat correctament!`);
    }
}

// Gestionar enviament de missatge
function handleSendMessage(e) {
    e.preventDefault();

    const recipient = document.getElementById('recipient').value;
    const subject = document.getElementById('subject').value;
    const messageText = document.getElementById('message').value;

    // Validar camps
    if (!recipient || !subject || !messageText) {
        showFeedback('Si us plau, omple tots els camps');
        return;
    }

    // Si s'ha seleccionat contactes, validar que s'hagi triat un
    if (recipient === 'contacts') {
        const selectedContact = contactSelect.value;
        if (!selectedContact) {
            showFeedback('Si us plau, selecciona un contacte');
            return;
        }
    }

    // Determinar destinatari final
    let finalRecipient, finalAvatar;

    if (recipient === 'contacts') {
        const contacts = getContacts();
        const selectedContact = contacts.find(c => c.id === contactSelect.value);
        finalRecipient = selectedContact.name;
        finalAvatar = selectedContact.avatar;
    } else {
        const recipientNames = {
            'dr-joan': 'Dr. Joan Martínez',
            'suport': 'Equip de suport',
            'dra-maria': 'Dra. Maria López'
        };

        finalRecipient = recipientNames[recipient] || recipient;
        finalAvatar = '📤';
    }

    // Crear nou missatge
    const newMessage = {
        id: Date.now(),
        avatar: finalAvatar,
        sender: finalRecipient,
        message: `${subject}: ${messageText}`,
        time: 'Ara mateix',
        date: 'Avui',
        unread: false,
        sent: true,
        timestamp: Date.now()
    };

    // Afegir missatge
    MessagesManager.add(newMessage);

    // Tancar modal i actualitzar
    closeModal();
    loadAllMessages();
    updateEmptyState();
    showFeedback('Missatge enviat correctament!');
}

// Afegir animacions al CSS dinàmicament
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translate(-50%, -20px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translate(-50%, 0);
        }
        to {
            opacity: 0;
            transform: translate(-50%, -20px);
        }
    }
`;
document.head.appendChild(style);

