// Protegir la pàgina - requerir autenticació
if (typeof AuthManager !== 'undefined' && !AuthManager.isAuthenticated()) {
    AuthManager.requireAuth();
}

// ============================================================
// SISTEMA CENTRALITZAT DE GESTIÓ DE NOTIFICACIONS
// ============================================================

const NotificationsManager = {
    // NOTA: Ara les notificacions s'emmagatzemen per usuari via UserDataManager
    // Aquest objecte manté la compatibilitat amb el codi existent

    // Notificacions per defecte (ja no s'usen directament)
    defaultNotifications: [
        {
            id: 1,
            type: 'events',
            icon: '📅',
            iconClass: 'new-event',
            title: 'Noves places disponibles!',
            description: 'S\'han alliberat places per demà al matí a l\'Hospital Clínic de Barcelona.',

            time: 'Fa 2 hores',
            date: 'Avui',
            category: 'Cita',
            unread: true,
            priority: 'high',
            timestamp: Date.now() - 2 * 60 * 60 * 1000,
            actions: [
                { label: 'Reservar cita', action: 'reserveAppointment', url: 'localitzacions.html' },
            ]
        },
        {
            id: 2,
            type: 'events',
            icon: '📅',
            iconClass: 'new-event',
            title: 'Cita confirmada per demà',
            description: 'Demà a les 10:00h t\'esperem a l\'Hospital Vall d\'Hebron. Recorda portar el DNI, esmorzar bé i hidratar-te.',

            time: 'Fa 5 hores',
            date: 'Avui',
            category: 'Cita',
            unread: true,
            priority: 'high',
            timestamp: Date.now() - 5 * 60 * 60 * 1000,
            actions: [
                { label: 'Afegir al calendari', action: 'addToCalendar', data: { date: 'Demà', time: '10:00' } },
                { label: 'Informació abans de donar', action: 'viewDetails', url: 'abans-donar.html' }
            ]
        },
        {
            id: 3,
            type: 'reminders',
            icon: '🔔',
            iconClass: 'reminder',
            title: 'Ja pots tornar a donar sang!',
            description: 'Han passat 3 mesos des de la teva última donació. La teva ajuda és valuosa: tens 5 centres disponibles a menys de 5 km. ¿Reservem una cita?',

            time: 'Ahir',
            date: 'Ahir',
            category: 'Recordatori',
            unread: true,
            priority: 'medium',
            timestamp: Date.now() - 24 * 60 * 60 * 1000,
            actions: [
                { label: 'Centres propers', action: 'findLocations', url: 'localitzacions.html' },
            ]
        },
        {
            id: 4,
            type: 'info',
            icon: 'ℹ️',
            iconClass: 'info',
            title: 'Necessitem sang O negatiu urgentment',
            description: 'Les reserves de sang O- estan en nivells crítics. Si tens aquest grup sanguini, ara és el moment d\'actuar.',

            time: 'Ahir',
            date: 'Ahir',
            category: 'Informació',
            unread: false,
            priority: 'high',
            timestamp: Date.now() - 26 * 60 * 60 * 1000,
            actions: [
                { label: 'Vull col·laborar', action: 'reserveAppointment', url: 'localitzacions.html' }
            ]
        },
        {
            id: 5,
            type: 'achievements',
            icon: '🏆',
            iconClass: 'achievement',
            title: 'Felicitats, ets donant plata! 🥈',
            description: 'Has completat la teva 5a donació i has salvat fins a 15 vides. Ets un exemple de solidaritat. Continua així per desbloquejar el nivell or!',

            time: 'Fa 3 dies',
            date: 'Fa 3 dies',
            category: 'Assoliment',
            unread: true,
            priority: 'medium',
            timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
            actions: [
                { label: 'Veure tots els assoliments', action: 'viewAchievements', url: 'home.html' }, //pendent config user
                { label: 'Veure el meu progrés', action: 'viewDetails', url: 'home.html' } //pendent config user
            ]
        },
        {
            id: 6,
            type: 'info',
            icon: '🎁',
            iconClass: 'info',
            title: '🎁 Sorteig mensual: Samsung Galaxy Book4',
            description: 'El sorteig es celebrarà el 30 d\'aquest mes. Cada donació que facis és una participació automàtica. Dona sang i entra en el sorteig!',

            time: 'Fa 5 dies',
            date: 'Fa 5 dies',
            category: 'Informació',
            unread: false,
            priority: 'low',
            timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
            actions: [
                { label: 'Veure premi', action: 'viewPrize', url: 'premio.html' },
                { label: 'Reservar donació', action: 'reserveAppointment', url: 'localitzacions.html' }
            ]
        },
        {
            id: 7,
            type: 'events',
            icon: '📅',
            iconClass: 'new-event',
            title: 'Gràcies per salvar vides!',
            description: 'Donació completada amb èxit el 24 d\'octubre a l\'Hospital Vall d\'Hebron. La teva sang arribarà a qui més ho necessita i pot salvar fins a 3 vides. Podràs tornar a donar a partir del 24 de gener.',

            time: 'Fa 1 setmana',
            date: 'Fa 1 setmana',
            category: 'Cita',
            unread: false,
            priority: 'low',
            timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
            actions: [
                { label: 'Veure historial', action: 'viewDetails', url: 'home.html' }, //pendent config user
                { label: 'Detall del sorteig', action: 'viewPrize', url: 'premio.html' }
            ]
        }
    ],

    // Inicialitzar notificacions (ara per usuari)
    init() {
        // Les notificacions ara s'inicialitzen per usuari via UserDataManager
        // Aquest mètode es manté per compatibilitat
    },

    // Obtenir totes les notificacions (ara de l'usuari actual)
    getAll() {
        return UserDataManager.getNotifications();
    },

    // Obtenir notificacions no llegides
    getUnread() {
        return this.getAll().filter(n => n.unread);
    },

    // Obtenir només les més recents (per al submenu)
    getRecent(limit = 4) {
        return this.getAll()
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    },

    // Marcar com llegida
    markAsRead(id) {
        const notifications = this.getAll();
        const notification = notifications.find(n => n.id === id);
        if (notification) {
            notification.unread = false;
            this.saveNotifications(notifications);
        }
    },

    // Marcar com no llegida (pendent)
    markAsUnread(id) {
        const notifications = this.getAll();
        const notification = notifications.find(n => n.id === id);
        if (notification) {
            notification.unread = true;
            this.saveNotifications(notifications);
        }
    },

    // Alternar estat de lectura
    toggleReadStatus(id) {
        const notifications = this.getAll();
        const notification = notifications.find(n => n.id === id);
        if (notification) {
            notification.unread = !notification.unread;
            this.saveNotifications(notifications);
            return notification.unread;
        }
        return false;
    },

    // Marcar totes com llegides
    markAllAsRead() {
        const notifications = this.getAll();
        notifications.forEach(n => n.unread = false);
        this.saveNotifications(notifications);
    },

    // Eliminar notificació
    remove(id) {
        const notifications = this.getAll().filter(n => n.id !== id);
        this.saveNotifications(notifications);
    },

    // Guardar notificacions (ara per usuari)
    saveNotifications(notifications) {
        UserDataManager.saveNotifications(notifications);
        // Disparar event per actualitzar totes les vistes
        window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    },

    // Obtenir nombre de no llegides
    getUnreadCount() {
        return this.getUnread().length;
    },

    // Obtenir notificacions actives (no eliminades ni posposades)
    getActive() {
        return this.getAll().filter(n => {
            // Filtrar posposades
            if (n.snoozedUntil && n.snoozedUntil > Date.now()) {
                return false;
            }
            return true;
        });
    },

    // Obtenir notificacions urgents
    getUrgent() {
        return this.getActive().filter(n => n.priority === 'high' && n.unread);
    },

    // Obtenir estadístiques
    getStats() {
        const all = this.getActive();
        const unread = all.filter(n => n.unread);
        const urgent = all.filter(n => n.priority === 'high' && n.unread);

        return {
            total: all.length,
            unread: unread.length,
            urgent: urgent.length
        };
    },

    // Moure a la paperera (ara per usuari)
    moveToTrash(id) {
        const notifications = this.getAll();
        const notification = notifications.find(n => n.id === id);

        if (notification) {
            // Afegir a la paperera
            const trash = this.getTrash();
            notification.deletedAt = Date.now();
            trash.push(notification);
            UserDataManager.saveNotificationTrash(trash);

            // Eliminar de les notificacions actives
            const updated = notifications.filter(n => n.id !== id);
            this.saveNotifications(updated);

            window.dispatchEvent(new CustomEvent('notificationsUpdated'));
        }
    },

    // Restaurar de la paperera (ara per usuari)
    restoreFromTrash(id) {
        const trash = this.getTrash();
        const notification = trash.find(n => n.id === id);

        if (notification) {
            // Eliminar de la paperera
            const updatedTrash = trash.filter(n => n.id !== id);
            UserDataManager.saveNotificationTrash(updatedTrash);

            // Afegir de nou a les notificacions
            delete notification.deletedAt;
            const notifications = this.getAll();
            notifications.push(notification);
            this.saveNotifications(notifications);

            window.dispatchEvent(new CustomEvent('notificationRestored', { detail: notification }));
        }
    },

    // Obtenir paperera (ara per usuari)
    getTrash() {
        return UserDataManager.getNotificationTrash();
    },

    // Buidar paperera (ara per usuari)
    emptyTrash() {
        UserDataManager.saveNotificationTrash([]);
        window.dispatchEvent(new CustomEvent('trashEmptied'));
    },

    // Posposar notificació
    snoozeNotification(id, hours) {
        const notifications = this.getAll();
        const notification = notifications.find(n => n.id === id);

        if (notification) {
            notification.snoozedUntil = Date.now() + (hours * 60 * 60 * 1000);
            this.saveNotifications(notifications);
        }
    },

    // Obtenir preferències (ara per usuari)
    getPreferences() {
        return UserDataManager.getNotificationPreferences();
    },

    // Guardar preferències (ara per usuari)
    savePreferences(prefs) {
        UserDataManager.saveNotificationPreferences(prefs);
        window.dispatchEvent(new CustomEvent('preferencesUpdated'));
    },

    // Netejar notificacions antigues
    cleanOldNotifications() {
        const prefs = this.getPreferences();
        const notifications = this.getAll();
        const cutoffDate = Date.now() - (prefs.daysToKeep * 24 * 60 * 60 * 1000);
        const trash = this.getTrash();

        // Separar notificacions antigues per moure a paperera
        const toKeep = [];
        const toTrash = [];

        notifications.forEach(n => {
            if (n.unread) {
                toKeep.push(n); // Mantenir no llegides
            } else if (n.timestamp > cutoffDate) {
                toKeep.push(n); // Mantenir recents
            } else {
                n.deletedAt = Date.now();
                toTrash.push(n); // Moure a paperera
            }
        });

        // Guardar notificacions actives
        this.saveNotifications(toKeep);

        // Afegir a la paperera
        const updatedTrash = [...trash, ...toTrash];
        localStorage.setItem(this.TRASH_KEY, JSON.stringify(updatedTrash));

        return toTrash.length;
    },

    // Afegir nova notificació (ara per usuari)
    addNotification(notification) {
        // Afegir prioritat per defecte si no existeix
        if (!notification.priority) {
            notification.priority = 'low';
        }

        // Afegir actions per defecte si no existeix
        if (!notification.actions) {
            notification.actions = [];
        }

        // Usar el mètode de UserDataManager que ja gestiona l'ID i timestamp
        UserDataManager.addNotification(notification);
    },

    // Simular notificacions en temps real (per demo)
    startRealtimeSimulation() {
        setInterval(() => {
            // 10% de probabilitat cada 30 segons
            if (Math.random() < 0.1) {
                const types = ['events', 'reminders', 'achievements', 'info'];
                const type = types[Math.floor(Math.random() * types.length)];

                const samples = {
                    events: {
                        icon: '📅',
                        iconClass: 'new-event',
                        title: '¡Places disponibles aquesta setmana!',
                        description: 'S\'han alliberat noves places per donar sang. Troba el teu centre més proper i reserva la teva cita ara.',
                        category: 'Cita',
                        priority: 'high',
                        actions: [{ label: 'Reservar', action: 'reserveAppointment', url: 'localitzacions.html' }]
                    },
                    reminders: {
                        icon: '🔔',
                        iconClass: 'reminder',
                        title: '¿Ja pots donar de nou?',
                        description: 'Si han passat més de 2 mesos des de la teva última donació, ja pots reservar una nova cita. ¡La teva ajuda és important!',
                        category: 'Recordatori',
                        priority: 'medium',
                        actions: [{ label: 'Buscar centres', action: 'findLocations', url: 'localitzacions.html' }]
                    },
                    achievements: {
                        icon: '🏆',
                        iconClass: 'achievement',
                        title: '¡Nou assoliment desbloquejat!',
                        description: 'La teva dedicació com a donant ha estat reconeguda. Consulta els teus assoliments i descobreix el teu progrés.',
                        category: 'Assoliment',
                        priority: 'low',
                        actions: []
                    },
                    info: {
                        icon: 'ℹ️',
                        iconClass: 'info',
                        title: 'Novetats del Banc de Sang',
                        description: 'Tenim informació nova que pot interessar-te. Consulta les últimes actualitzacions sobre donació de sang.',
                        category: 'Informació',
                        priority: 'low',
                        actions: []
                    }
                };

                const notification = {
                    type: type,
                    ...samples[type]
                    // time i date es calculen dinàmicament des del timestamp
                };

                this.addNotification(notification);
            }
        }, 30000); // Cada 30 segons
    }
};

// Inicialitzar NotificationsManager
NotificationsManager.init();

// Iniciar simulació en temps real (només a home.html)
if (window.location.pathname.includes('home.html')) {
    NotificationsManager.startRealtimeSimulation();
}

// ============================================================
// INTERFÍCIE D'USUARI DE NOTIFICACIONS
// ============================================================

// Només executar la interfície si estem a la pàgina de notificacions
if (window.location.pathname.includes('notificacions.html')) {
    // Elements del DOM
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    const notificationsList = document.getElementById('notificationsList');
    const emptyState = document.getElementById('emptyState');
    const filterTabs = document.querySelectorAll('.tab-btn');

    // Variables globals per desfer
    let lastDeleted = null;
    let deleteTimeout = null;

    // Actualitzar els temps de les notificacions visibles
    function updateNotificationTimes() {
        const timeElements = document.querySelectorAll('.notification-time');
        timeElements.forEach(timeEl => {
            const timestamp = parseInt(timeEl.dataset.timestamp);
            if (timestamp) {
                timeEl.textContent = getTimeAgoFromTimestamp(timestamp);
            }
        });
    }

    // Inicialitzar
    document.addEventListener('DOMContentLoaded', () => {
        loadAllNotifications();
        setupEventListeners();
        updateEmptyState();
        displayStats();
        checkForNewNotifications();

        // Actualitzar els temps cada 30 segons
        setInterval(updateNotificationTimes, 30000);
    });

    // Mostrar estadístiques
    function displayStats() {
        const stats = NotificationsManager.getStats();
        const statsContainer = document.getElementById('notificationStats');

        if (!statsContainer) return;

        const urgentText = stats.urgent > 0 ? ` · <span class="urgent-count">${stats.urgent} urgent${stats.urgent > 1 ? 's' : ''}</span>` : '';

        statsContainer.innerHTML = `
        <div class="stats-summary">
            <span class="stats-item"><strong>${stats.unread}</strong> no llegides</span>
            ${urgentText}
            <span class="stats-item">· <strong>${stats.total}</strong> total</span>
        </div>
    `;

        updateTrashCount();
    }

    // Carregar totes les notificacions
    function loadAllNotifications() {
        const notifications = NotificationsManager.getActive();
        renderNotifications(notifications);
        displayStats();
    }

    // Calcular el temps transcorregut
    function getTimeAgoFromTimestamp(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);

        if (seconds < 60) return 'Ara mateix';
        if (seconds < 120) return 'Fa 1 minut';
        if (seconds < 3600) return `Fa ${Math.floor(seconds / 60)} minuts`;
        if (seconds < 7200) return 'Fa 1 hora';
        if (seconds < 86400) return `Fa ${Math.floor(seconds / 3600)} hores`;
        if (seconds < 172800) return 'Ahir';
        if (seconds < 604800) return `Fa ${Math.floor(seconds / 86400)} dies`;
        if (seconds < 1209600) return 'Fa 1 setmana';
        if (seconds < 2592000) return `Fa ${Math.floor(seconds / 604800)} setmanes`;
        if (seconds < 5184000) return 'Fa 1 mes';
        return `Fa ${Math.floor(seconds / 2592000)} mesos`;
    }

    // Calcular la categoria de data per agrupació
    function getDateCategory(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        const days = Math.floor(seconds / 86400);

        if (days === 0) return 'Avui';
        if (days === 1) return 'Ahir';
        if (days <= 7) return 'Aquesta setmana';
        if (days <= 30) return 'Aquest mes';
        return 'Més antic';
    }

    // Renderitzar notificacions agrupades per dates
    function renderNotifications(notifications) {
        notificationsList.innerHTML = '';

        // Ordenar per timestamp de més nou a més antic
        const sortedNotifications = [...notifications].sort((a, b) => b.timestamp - a.timestamp);

        // Agrupar per dates dinàmicament
        const grouped = {};

        sortedNotifications.forEach(n => {
            const category = getDateCategory(n.timestamp);
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(n);
        });

        // Crear grups de dates en l'ordre correcte
        const dateOrder = ['Avui', 'Ahir', 'Aquesta setmana', 'Aquest mes', 'Més antic'];
        dateOrder.forEach(date => {
            if (grouped[date] && grouped[date].length > 0) {
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
        let cardClass = `notification-card${notification.unread ? ' unread' : ''}`;

        // Afegir classe de prioritat
        if (notification.priority === 'high') {
            cardClass += ' priority-high';
        } else if (notification.priority === 'medium') {
            cardClass += ' priority-medium';
        }

        card.className = cardClass;
        card.dataset.id = notification.id;
        card.dataset.type = notification.type;
        card.dataset.priority = notification.priority || 'low';

        // Crear HTML base
        let actionsHTML = '';
        if (notification.actions && notification.actions.length > 0) {
            actionsHTML = '<div class="notification-actions">';
            notification.actions.forEach(action => {
                actionsHTML += `<button class="action-btn" data-action="${action.action}" data-url="${action.url || ''}" data-data='${JSON.stringify(action.data || {})}'>${action.label}</button>`;
            });
            actionsHTML += '</div>';
        }

        const priorityBadge = notification.priority === 'high' ? '<span class="priority-badge high">Urgent</span>' : '';
        const readStatusIcon = notification.unread ? '📕' : '📖';
        const readStatusTitle = notification.unread ? 'Marcar com llegida' : 'Marcar com no llegida';

        // Calcular el temps dinàmicament des del timestamp
        const timeAgo = getTimeAgoFromTimestamp(notification.timestamp);

        card.innerHTML = `
        <div class="notification-icon ${notification.iconClass}">${notification.icon}</div>
        <div class="notification-content">
            <div class="notification-header-row">
                <h4>${notification.title}</h4>
                ${priorityBadge}
            </div>
            <p>${notification.description}</p>
            ${actionsHTML}
            <div class="notification-meta">
                <span class="notification-time" data-timestamp="${notification.timestamp}">${timeAgo}</span>
                <span class="notification-category">${notification.category}</span>
            </div>
        </div>
        <div class="notification-controls">
            <button class="notification-read-toggle" title="${readStatusTitle}">${readStatusIcon}</button>
            <button class="notification-close" title="Eliminar">✕</button>
        </div>
    `;

        // Event listeners per accions
        const actionBtns = card.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleAction(btn.dataset.action, btn.dataset.url, JSON.parse(btn.dataset.data), notification);
            });
        });

        // Event listener per alternar estat de lectura
        const readToggleBtn = card.querySelector('.notification-read-toggle');
        readToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleReadStatus(card, notification);
        });

        // Event listener per tancar
        const closeBtn = card.querySelector('.notification-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeNotification(card, notification);
        });

        return card;
    }

    // Gestionar accions de les notificacions
    function handleAction(action, url, data, notification) {
        // Marcar com llegida quan es fa click en una acció
        NotificationsManager.markAsRead(notification.id);

        switch (action) {
            case 'reserveAppointment':
            case 'findLocations':
            case 'viewAchievements':
            case 'viewPrize':
            case 'participate':
            case 'viewCalendar':
            case 'viewDetails':
                // Redirigir a la URL proporcionada
                if (url) {
                    window.location.href = url;
                } else {
                    console.warn('No s\'ha proporcionat URL per l\'acció:', action);
                }
                break;

            case 'addToCalendar':
                addToCalendar(data, notification);
                break;

            case 'snooze':
                snoozeNotification(notification.id, data.hours || 1);
                break;

            default:
                // Per a qualsevol altra acció, si hi ha URL, redirigir
                if (url) {
                    window.location.href = url;
                } else {
                    console.log('Acció no implementada:', action);
                }
        }
    }

    // Afegir al calendari
    function addToCalendar(data, notification) {
        // Simular afegir al calendari
        showFeedback(`✅ Cita afegida al calendari per ${data.date} a les ${data.time}`);
        NotificationsManager.markAsRead(notification.id);

        setTimeout(() => {
            loadAllNotifications();
            updateEmptyState();
        }, 300);
    }

    // Posposar notificació
    function snoozeNotification(id, hours) {
        NotificationsManager.snoozeNotification(id, hours);
        showFeedback(`🔔 Recordatori posposat ${hours} hora${hours > 1 ? 's' : ''}`);

        setTimeout(() => {
            loadAllNotifications();
            updateEmptyState();
        }, 300);
    }

    // Comprovar noves notificacions
    function checkForNewNotifications() {
        // Escoltar l'event de nova notificació
        window.addEventListener('newNotification', (e) => {
            // Recarregar notificacions
            loadAllNotifications();
            updateEmptyState();

            // Mostrar animació
            showNewNotificationAlert(e.detail);
        });

        // Escoltar altres events
        window.addEventListener('notificationsUpdated', () => {
            loadAllNotifications();
            updateEmptyState();
        });

        window.addEventListener('notificationRestored', () => {
            loadAllNotifications();
            updateEmptyState();
        });
    }

    // Mostrar alerta de nova notificació
    function showNewNotificationAlert(notification) {
        const alert = document.createElement('div');
        alert.className = 'new-notification-alert';
        alert.innerHTML = `
        <div class="alert-icon">${notification.icon}</div>
        <div class="alert-content">
            <strong>${notification.title}</strong>
            <p>${notification.description.substring(0, 60)}...</p>
        </div>
    `;

        document.body.appendChild(alert);

        setTimeout(() => alert.classList.add('show'), 10);

        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 300);
        }, 4000);

        // Click per anar a la notificació
        alert.addEventListener('click', () => {
            alert.remove();
            const card = document.querySelector(`[data-id="${notification.id}"]`);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.classList.add('highlight');
                setTimeout(() => card.classList.remove('highlight'), 2000);
            }
        });
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

        // Botons d'acció ràpida
        const viewTrashBtn = document.getElementById('viewTrashBtn');
        const cleanOldBtn = document.getElementById('cleanOldBtn');

        if (viewTrashBtn) {
            viewTrashBtn.addEventListener('click', openTrashModal);
        }

        if (cleanOldBtn) {
            cleanOldBtn.addEventListener('click', openCleanOldModal);
        }

        // Modal de netejar notificacions antigues
        const acceptCleanOld = document.getElementById('acceptCleanOld');
        const cancelCleanOld = document.getElementById('cancelCleanOld');
        const cleanOldModal = document.getElementById('cleanOldModal');

        if (acceptCleanOld) {
            acceptCleanOld.addEventListener('click', () => {
                closeCleanOldModal();
                const count = NotificationsManager.cleanOldNotifications();
                loadAllNotifications();
                updateEmptyState();
                updateTrashCount();
                if (count > 0) {
                    showFeedback(`✅ ${count} notificació${count > 1 ? 's' : ''} moguda${count > 1 ? 'es' : ''} a la paperera`);
                } else {
                    showFeedback('✅ No hi ha notificacions antigues per netejar');
                }
            });
        }

        if (cancelCleanOld) {
            cancelCleanOld.addEventListener('click', closeCleanOldModal);
        }

        if (cleanOldModal) {
            cleanOldModal.addEventListener('click', (e) => {
                if (e.target === cleanOldModal) {
                    closeCleanOldModal();
                }
            });
        }

        // Botó de marcar tot com llegit (accions ràpides)
        const markAllReadBtnQuick = document.getElementById('markAllReadBtnQuick');
        if (markAllReadBtnQuick) {
            markAllReadBtnQuick.addEventListener('click', markAllAsRead);
        }

        // Modal de paperera
        const closeTrashModal = document.getElementById('closeTrashModal');
        const closeTrash = document.getElementById('closeTrash');
        const emptyTrashBtn = document.getElementById('emptyTrashBtn');
        const trashModal = document.getElementById('trashModal');

        if (closeTrashModal) {
            closeTrashModal.addEventListener('click', closeTrashModalFn);
        }

        if (closeTrash) {
            closeTrash.addEventListener('click', closeTrashModalFn);
        }

        if (emptyTrashBtn) {
            emptyTrashBtn.addEventListener('click', emptyTrash);
        }

        if (trashModal) {
            trashModal.addEventListener('click', (e) => {
                if (e.target === trashModal) {
                    closeTrashModalFn();
                }
            });
        }
    }

    // Gestió del modal de paperera
    function openTrashModal() {
        const trash = NotificationsManager.getTrash();
        const trashList = document.getElementById('trashList');

        if (trash.length === 0) {
            trashList.innerHTML = '<div class="empty-trash">[la paperera està buida]</div>';
        } else {
            trashList.innerHTML = '';
            trash.forEach(notification => {
                const card = createTrashCard(notification);
                trashList.appendChild(card);
            });
        }

        document.getElementById('trashModal').classList.add('active');
    }

    function closeTrashModalFn() {
        document.getElementById('trashModal').classList.remove('active');
    }

    function openCleanOldModal() {
        document.getElementById('cleanOldModal').classList.add('active');
    }

    function closeCleanOldModal() {
        document.getElementById('cleanOldModal').classList.remove('active');
    }

    function createTrashCard(notification) {
        const card = document.createElement('div');
        card.className = 'trash-card';

        const deletedDate = new Date(notification.deletedAt);
        const timeAgo = getTimeAgo(deletedDate);

        card.innerHTML = `
        <div class="trash-icon">${notification.icon}</div>
        <div class="trash-content">
            <h4>${notification.title}</h4>
            <p>${notification.description}</p>
            <span class="trash-time">Eliminada ${timeAgo}</span>
        </div>
        <button class="restore-btn" data-id="${notification.id}">↺ Restaurar</button>
    `;

        const restoreBtn = card.querySelector('.restore-btn');
        restoreBtn.addEventListener('click', () => {
            NotificationsManager.restoreFromTrash(notification.id);
            openTrashModal(); // Refrescar
            loadAllNotifications();
            updateEmptyState();
            showFeedback('↺ Notificació restaurada');
        });

        return card;
    }

    function emptyTrash() {
        if (confirm('⚠️ Segur que vols buidar la paperera?\n\nAixò eliminarà permanentment totes les notificacions.')) {
            NotificationsManager.emptyTrash();
            closeTrashModalFn();
            updateTrashCount();
            showFeedback('✅ Paperera buida');
        }
    }

    function getTimeAgo(date) {
        // Utilitzar la funció principal de càlcul de temps
        return getTimeAgoFromTimestamp(date).toLowerCase();
    }

    function updateTrashCount() {
        const trashCount = NotificationsManager.getTrash().length;
        const trashCountEl = document.getElementById('trashCount');
        if (trashCountEl) {
            trashCountEl.textContent = trashCount;
        }
    }

    // Marcar totes com llegides
    function markAllAsRead() {
        NotificationsManager.markAllAsRead();
        loadAllNotifications();
        showFeedback('Totes les notificacions han estat marcades com llegides');
    }

    // Alternar estat de lectura
    function toggleReadStatus(card, notification) {
        const id = parseInt(card.dataset.id);
        const isNowUnread = NotificationsManager.toggleReadStatus(id);

        // Actualitzar classe de la targeta
        if (isNowUnread) {
            card.classList.add('unread');
            showFeedback('Marcada com a pendent de lectura');
        } else {
            card.classList.remove('unread');
            showFeedback('Marcada com a llegida');
        }

        // Actualitzar botó
        const readToggleBtn = card.querySelector('.notification-read-toggle');
        readToggleBtn.textContent = isNowUnread ? '📕' : '📖';
        readToggleBtn.title = isNowUnread ? 'Marcar com llegida' : 'Marcar com no llegida';

        card.style.animation = 'flash 0.5s ease';

        // Actualitzar estadístiques
        displayStats();
    }

    // Eliminar notificació amb opció de desfer
    function removeNotification(card, notification) {
        const id = parseInt(card.dataset.id);
        card.style.opacity = '0';
        card.style.transform = 'translateX(30px)';

        setTimeout(() => {
            // Guardar per desfer
            lastDeleted = { id, notification, card: card.cloneNode(true) };

            // Moure a paperera
            NotificationsManager.moveToTrash(id);

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

            // Mostrar opció de desfer
            showUndoNotification();

        }, 300);
    }

    // Mostrar toast per desfer
    function showUndoNotification() {
        // Cancel·lar timeout anterior si existeix
        if (deleteTimeout) {
            clearTimeout(deleteTimeout);
        }

        // Eliminar toast anterior si existeix
        const existingToast = document.querySelector('.undo-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'undo-toast';
        toast.innerHTML = `
        <span>Notificació eliminada</span>
        <button class="undo-btn">Desfer</button>
    `;

        document.body.appendChild(toast);

        // Animar entrada
        setTimeout(() => toast.classList.add('show'), 10);

        // Event listener per desfer
        const undoBtn = toast.querySelector('.undo-btn');
        undoBtn.addEventListener('click', () => {
            undoDelete();
            toast.remove();
            if (deleteTimeout) clearTimeout(deleteTimeout);
        });

        // Auto-amagar després de 5 segons
        deleteTimeout = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
            lastDeleted = null;
        }, 5000);
    }

    // Desfer eliminació
    function undoDelete() {
        if (!lastDeleted) return;

        NotificationsManager.restoreFromTrash(lastDeleted.id);
        loadAllNotifications();
        updateEmptyState();
        showFeedback('↺ Notificació restaurada');

        lastDeleted = null;
    }

    // Filtrar notificacions
    function filterNotifications(filter) {
        let notifications = NotificationsManager.getActive();

        if (filter === 'unread') {
            // Només mostrar no llegides
            notifications = notifications.filter(n => n.unread);
        } else if (filter === 'urgent') {
            // Mostrar totes les urgents (independentment de si estan llegides o no)
            notifications = notifications.filter(n => n.priority === 'high');
        } else if (filter !== 'all') {
            // Filtrar per categoria (events, reminders, achievements, info) - totes les notificacions d'aquesta categoria
            notifications = notifications.filter(n => n.type === filter);
        }

        renderNotifications(notifications);
        updateEmptyState();
        displayStats();
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
        background: white;
        color: #333;
        padding: 1rem 2rem;
        border-radius: 12px;
        border: 3px solid #b71c34;
        box-shadow: 0 4px 12px rgba(183, 28, 52, 0.2);
        z-index: 1000;
        animation: slideDown 0.3s ease;
        font-weight: 600;
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
}
