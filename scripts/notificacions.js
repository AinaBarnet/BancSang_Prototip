// Elements del DOM
const markAllReadBtn = document.getElementById('markAllReadBtn');
const notificationsList = document.getElementById('notificationsList');
const emptyState = document.getElementById('emptyState');
const filterTabs = document.querySelectorAll('.tab-btn');

// Inicialitzar
document.addEventListener('DOMContentLoaded', () => {
    loadAllNotifications();
    setupEventListeners();
    updateEmptyState();
});

// Carregar totes les notificacions
function loadAllNotifications() {
    const notifications = NotificationsManager.getAll();
    renderNotifications(notifications);
}

// Renderitzar notificacions agrupades per dates
function renderNotifications(notifications) {
    notificationsList.innerHTML = '';

    // Agrupar per dates
    const grouped = {
        'Avui': [],
        'Ahir': [],
        'Fa 3 dies': [],
        'Fa 5 dies': [],
        'Fa 1 setmana': []
    };

    notifications.forEach(n => {
        if (grouped[n.date]) {
            grouped[n.date].push(n);
        }
    });

    // Crear grups de dates
    Object.keys(grouped).forEach(date => {
        if (grouped[date].length > 0) {
            const dateGroup = createDateGroup(date, grouped[date]);
            notificationsList.appendChild(dateGroup);
        }
    });
}

// Crear grup de dates
function createDateGroup(date, notifications) {
    const group = document.createElement('div');
    group.className = 'date-group';

    const header = document.createElement('h3');
    header.className = 'date-header';
    header.textContent = date;
    group.appendChild(header);

    notifications.forEach(notification => {
        const card = createNotificationCard(notification);
        group.appendChild(card);
    });

    return group;
}

// Crear targeta de notificació
function createNotificationCard(notification) {
    const card = document.createElement('div');
    card.className = `notification-card${notification.unread ? ' unread' : ''}`;
    card.dataset.id = notification.id;
    card.dataset.type = notification.type;

    card.innerHTML = `
        <div class="notification-icon ${notification.iconClass}">${notification.icon}</div>
        <div class="notification-content">
            <h4>${notification.title}</h4>
            <p>${notification.description}</p>
            <div class="notification-meta">
                <span class="notification-time">${notification.time}</span>
                <span class="notification-category">${notification.category}</span>
            </div>
        </div>
        <button class="notification-close">✕</button>
    `;

    // Event listeners
    const closeBtn = card.querySelector('.notification-close');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeNotification(card);
    });

    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('notification-close')) {
            markAsRead(card);
        }
    });

    return card;
}

// Configurar event listeners
function setupEventListeners() {
    // Marcar totes com llegides
    markAllReadBtn.addEventListener('click', markAllAsRead);

    // Filtres
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filterNotifications(tab.dataset.filter);
        });
    });
}

// Marcar totes com llegides
function markAllAsRead() {
    NotificationsManager.markAllAsRead();
    loadAllNotifications();
    showFeedback('Totes les notificacions marcades com llegides');
}

// Marcar una notificació com llegida
function markAsRead(card) {
    const id = parseInt(card.dataset.id);
    if (card.classList.contains('unread')) {
        NotificationsManager.markAsRead(id);
        card.classList.remove('unread');
        card.style.animation = 'flash 0.5s ease';
    }
}

// Eliminar notificació
function removeNotification(card) {
    const id = parseInt(card.dataset.id);
    card.style.opacity = '0';
    card.style.transform = 'translateX(30px)';

    setTimeout(() => {
        NotificationsManager.remove(id);

        const dateGroup = card.closest('.date-group');
        const remainingCards = dateGroup.querySelectorAll('.notification-card');

        if (remainingCards.length <= 1) {
            dateGroup.style.opacity = '0';
            setTimeout(() => {
                loadAllNotifications();
                updateEmptyState();
            }, 300);
        } else {
            card.remove();
            updateEmptyState();
        }
    }, 300);
}

// Filtrar notificacions
function filterNotifications(filter) {
    let notifications = NotificationsManager.getAll();

    if (filter === 'unread') {
        notifications = notifications.filter(n => n.unread);
    } else if (filter !== 'all') {
        notifications = notifications.filter(n => n.type === filter);
    }

    renderNotifications(notifications);
    updateEmptyState();
}

// Actualitzar estat buit
function updateEmptyState() {
    const visibleCards = document.querySelectorAll('.notification-card');
    const activeFilter = document.querySelector('.tab-btn.active').dataset.filter;

    if (visibleCards.length === 0) {
        notificationsList.style.display = 'none';
        emptyState.style.display = 'block';

        if (activeFilter === 'unread') {
            emptyState.querySelector('h3').textContent = 'No hi ha notificacions no llegides';
            emptyState.querySelector('p').textContent = 'Molt bé! Has llegit totes les notificacions';
        } else if (activeFilter !== 'all') {
            emptyState.querySelector('h3').textContent = 'No hi ha notificacions d\'aquest tipus';
            emptyState.querySelector('p').textContent = 'Prova amb un altre filtre';
        } else {
            emptyState.querySelector('h3').textContent = 'No hi ha notificacions';
            emptyState.querySelector('p').textContent = 'Totes les teves notificacions estan llegides';
        }
    } else {
        notificationsList.style.display = 'flex';
        emptyState.style.display = 'none';
    }
}// Mostrar feedback
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

// Afegir animació flash al CSS dinàmicament
const style = document.createElement('style');
style.textContent = `
    @keyframes flash {
        0%, 100% { background: inherit; }
        50% { background: #e8f5e9; }
    }
    
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
