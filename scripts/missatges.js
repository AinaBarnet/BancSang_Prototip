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

// Inicialitzar
document.addEventListener('DOMContentLoaded', () => {
    loadAllMessages();
    setupEventListeners();
    updateEmptyState();
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

    // Crear nou missatge
    const recipientNames = {
        'dr-martinez': 'Dr. Joan Martínez',
        'banc-sang': 'Centre Banc de Sang',
        'suport': 'Equip de suport',
        'dra-lopez': 'Dra. Maria López'
    };

    const avatars = {
        'dr-martinez': '👨‍⚕️',
        'banc-sang': '🏥',
        'suport': '💬',
        'dra-lopez': '👩‍⚕️'
    };

    const newMessage = {
        id: Date.now(),
        avatar: avatars[recipient] || '👤',
        sender: recipientNames[recipient] || recipient,
        message: `${subject}: ${messageText}`,
        time: 'Ara mateix',
        date: 'Avui',
        unread: false,
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
