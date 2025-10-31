// Elements del DOM
const markAllReadBtn = document.getElementById('markAllReadBtn');
const notificationsList = document.getElementById('notificationsList');
const emptyState = document.getElementById('emptyState');
const filterTabs = document.querySelectorAll('.tab-btn');

// Inicialitzar
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateEmptyState();
});

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

    // Tancar notificacions
    const closeButtons = document.querySelectorAll('.notification-close');
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            removeNotification(button);
        });
    });

    // Marcar com llegida en fer clic
    const notificationCards = document.querySelectorAll('.notification-card');
    notificationCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('notification-close')) {
                markAsRead(card);
            }
        });
    });
}

// Marcar totes com llegides
function markAllAsRead() {
    const unreadNotifications = document.querySelectorAll('.notification-card.unread');

    unreadNotifications.forEach((notification, index) => {
        setTimeout(() => {
            notification.classList.remove('unread');
            notification.style.animation = 'flash 0.5s ease';
        }, index * 50);
    });

    // Mostrar feedback
    showFeedback('Totes les notificacions marcades com llegides');
}

// Marcar una notificació com llegida
function markAsRead(card) {
    if (card.classList.contains('unread')) {
        card.classList.remove('unread');
        card.style.animation = 'flash 0.5s ease';
        console.log('Notificació marcada com llegida:', card.dataset.id);
    }
}

// Eliminar notificació
function removeNotification(button) {
    const card = button.closest('.notification-card');
    card.style.opacity = '0';
    card.style.transform = 'translateX(30px)';

    setTimeout(() => {
        const dateGroup = card.closest('.date-group');
        card.remove();

        // Si el grup de dates està buit, eliminar-lo també
        const remainingCards = dateGroup.querySelectorAll('.notification-card');
        if (remainingCards.length === 0) {
            dateGroup.style.opacity = '0';
            setTimeout(() => {
                dateGroup.remove();
                updateEmptyState();
            }, 300);
        }

        updateEmptyState();
    }, 300);
}

// Filtrar notificacions
function filterNotifications(filter) {
    const allCards = document.querySelectorAll('.notification-card');
    const dateGroups = document.querySelectorAll('.date-group');

    if (filter === 'all') {
        allCards.forEach(card => {
            card.style.display = 'flex';
        });
        dateGroups.forEach(group => {
            group.style.display = 'block';
        });
    } else if (filter === 'unread') {
        allCards.forEach(card => {
            if (card.classList.contains('unread')) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    } else {
        allCards.forEach(card => {
            if (card.dataset.type === filter) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Amagar grups de dates buits
    dateGroups.forEach(group => {
        const visibleCards = group.querySelectorAll('.notification-card[style*="display: flex"], .notification-card:not([style*="display"])');
        if (visibleCards.length === 0) {
            group.style.display = 'none';
        } else {
            group.style.display = 'block';
        }
    });

    updateEmptyState();
}

// Actualitzar estat buit
function updateEmptyState() {
    const visibleCards = document.querySelectorAll('.notification-card:not([style*="display: none"])');
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
