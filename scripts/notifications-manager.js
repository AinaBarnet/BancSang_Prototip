// Sistema centralitzat de gestió de notificacions
const NotificationsManager = {
    STORAGE_KEY: 'bancSang_notifications',

    // Notificacions per defecte
    defaultNotifications: [
        {
            id: 1,
            type: 'events',
            icon: '📅',
            iconClass: 'new-event',
            title: 'Nova cita disponible',
            description: 'Hi ha places disponibles per donar sang demà al matí al Centre Banc de Sang de Barcelona',
            time: 'Fa 2 hores',
            date: 'Avui',
            category: 'Cita',
            unread: true,
            timestamp: Date.now() - 2 * 60 * 60 * 1000 // Hace 2 horas
        },
        {
            id: 2,
            type: 'events',
            icon: '📅',
            iconClass: 'new-event',
            title: 'Confirmació de cita',
            description: 'La teva cita per donar sang està confirmada per demà a les 10:00h',
            time: 'Fa 5 hores',
            date: 'Avui',
            category: 'Cita',
            unread: true,
            timestamp: Date.now() - 5 * 60 * 60 * 1000
        },
        {
            id: 3,
            type: 'reminders',
            icon: '🔔',
            iconClass: 'reminder',
            title: 'Recordatori de donació',
            description: 'Ja pots tornar a donar sang! Han passat 3 mesos des de la teva última donació',
            time: 'Ahir',
            date: 'Ahir',
            category: 'Recordatori',
            unread: true,
            timestamp: Date.now() - 24 * 60 * 60 * 1000
        },
        {
            id: 4,
            type: 'info',
            icon: 'ℹ️',
            iconClass: 'info',
            title: 'Actualització important',
            description: 'Hem actualitzat les nostres polítiques de privacitat. Consulta els canvis al teu perfil',
            time: 'Ahir',
            date: 'Ahir',
            category: 'Informació',
            unread: false,
            timestamp: Date.now() - 26 * 60 * 60 * 1000
        },
        {
            id: 5,
            type: 'achievements',
            icon: '🏆',
            iconClass: 'achievement',
            title: 'Nou assoliment desbloquejat!',
            description: 'Has completat 5 donacions. Gràcies per la teva col·laboració!',
            time: 'Fa 3 dies',
            date: 'Fa 3 dies',
            category: 'Assoliment',
            unread: true,
            timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000
        },
        {
            id: 6,
            type: 'info',
            icon: 'ℹ️',
            iconClass: 'info',
            title: 'Informació important',
            description: 'El proper sorteig del premi mensual es realitzarà el dia 15. Assegura\'t de participar!',
            time: 'Fa 5 dies',
            date: 'Fa 5 dies',
            category: 'Informació',
            unread: false,
            timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000
        },
        {
            id: 7,
            type: 'reminders',
            icon: '🔔',
            iconClass: 'reminder',
            title: 'Recordatori de sorteig',
            description: 'No oblidis participar en el sorteig d\'aquest mes. Tens temps fins el dia 15!',
            time: 'Fa 5 dies',
            date: 'Fa 5 dies',
            category: 'Recordatori',
            unread: false,
            timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000
        },
        {
            id: 8,
            type: 'achievements',
            icon: '🏆',
            iconClass: 'achievement',
            title: 'Primera donació completada',
            description: 'Felicitats per la teva primera donació de sang. Has salvat fins a 3 vides!',
            time: 'Fa 1 setmana',
            date: 'Fa 1 setmana',
            category: 'Assoliment',
            unread: false,
            timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000
        },
        {
            id: 9,
            type: 'events',
            icon: '📅',
            iconClass: 'new-event',
            title: 'Donació completada',
            description: 'Gràcies per la teva donació del dia 24. La teva contribució és molt valuosa',
            time: 'Fa 1 setmana',
            date: 'Fa 1 setmana',
            category: 'Cita',
            unread: false,
            timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000
        }
    ],

    // Inicialitzar notificacions
    init() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) {
            this.saveNotifications(this.defaultNotifications);
        }
    },

    // Obtenir totes les notificacions
    getAll() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : this.defaultNotifications;
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

    // Guardar notificacions
    saveNotifications(notifications) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
        // Disparar event per actualitzar totes les vistes
        window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    },

    // Obtenir nombre de no llegides
    getUnreadCount() {
        return this.getUnread().length;
    }
};

// Inicialitzar en carregar
NotificationsManager.init();
