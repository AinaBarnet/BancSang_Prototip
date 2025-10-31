// Sistema centralitzat de gestió de missatges
const MessagesManager = {
    STORAGE_KEY: 'bancSang_messages',

    // Missatges per defecte
    defaultMessages: [
        {
            id: 1,
            avatar: '👨‍⚕️',
            sender: 'Dr. Joan Martínez',
            message: 'Gràcies per la teva donació. Els resultats de l\'anàlisi són correctes.',
            time: 'Fa 1 hora',
            date: 'Avui',
            unread: true,
            sent: false,
            timestamp: Date.now() - 1 * 60 * 60 * 1000
        },
        {
            id: 2,
            avatar: '🏥',
            sender: 'Centre Banc de Sang',
            message: 'Recordatori: Tens una cita confirmada per demà a les 10:00h',
            time: 'Fa 3 hores',
            date: 'Avui',
            unread: true,
            sent: false,
            timestamp: Date.now() - 3 * 60 * 60 * 1000
        },
        {
            id: 3,
            avatar: '👥',
            sender: 'Equip de suport',
            message: 'Hem rebut la teva consulta i et respondrem en breu',
            time: 'Ahir',
            date: 'Ahir',
            unread: false,
            sent: false,
            timestamp: Date.now() - 24 * 60 * 60 * 1000
        },
        {
            id: 4,
            avatar: '👩‍⚕️',
            sender: 'Dra. Maria López',
            message: 'Tot perfecte amb la teva última donació. Pots tornar a donar d\'aquí 3 mesos',
            time: 'Ahir',
            date: 'Ahir',
            unread: false,
            sent: false,
            timestamp: Date.now() - 26 * 60 * 60 * 1000
        },
        {
            id: 5,
            avatar: '🏥',
            sender: 'Centre Banc de Sang',
            message: 'La teva sang ha ajudat a salvar vides. Gràcies per la teva generositat!',
            time: 'Fa 2 dies',
            date: 'Fa 2 dies',
            unread: false,
            sent: false,
            timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000
        },
        {
            id: 6,
            avatar: '👥',
            sender: 'Equip de suport',
            message: 'Recordatori: Revisa el teu perfil per mantenir les dades actualitzades',
            time: 'Fa 3 dies',
            date: 'Fa 3 dies',
            unread: false,
            sent: false,
            timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000
        },
        {
            id: 7,
            avatar: '🎁',
            sender: 'Sistema de premis',
            message: 'Estàs participant en el sorteig d\'aquest mes. Molta sort!',
            time: 'Fa 5 dies',
            date: 'Fa 5 dies',
            unread: false,
            sent: false,
            timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000
        },
        {
            id: 8,
            avatar: '👨‍⚕️',
            sender: 'Dr. Joan Martínez',
            message: 'Benvingut al programa de donació de sang. Gràcies per unir-te!',
            time: 'Fa 1 setmana',
            date: 'Fa 1 setmana',
            unread: false,
            sent: false,
            timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000
        }
    ],

    // Inicialitzar missatges
    init() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) {
            this.saveMessages(this.defaultMessages);
        }
    },

    // Obtenir tots els missatges
    getAll() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : this.defaultMessages;
    },

    // Obtenir missatges no llegits
    getUnread() {
        return this.getAll().filter(m => m.unread);
    },

    // Obtenir missatges enviats
    getSent() {
        return this.getAll().filter(m => m.sent);
    },

    // Obtenir només els més recents (per al submenu)
    getRecent(limit = 3) {
        return this.getAll()
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    },

    // Marcar com llegit
    markAsRead(id) {
        const messages = this.getAll();
        const message = messages.find(m => m.id === id);
        if (message) {
            message.unread = false;
            this.saveMessages(messages);
        }
    },

    // Marcar tots com llegits
    markAllAsRead() {
        const messages = this.getAll();
        messages.forEach(m => m.unread = false);
        this.saveMessages(messages);
    },

    // Eliminar missatge
    remove(id) {
        const messages = this.getAll().filter(m => m.id !== id);
        this.saveMessages(messages);
    },

    // Afegir nou missatge
    add(message) {
        const messages = this.getAll();
        messages.unshift(message); // Afegir al principi
        this.saveMessages(messages);
    },

    // Guardar missatges
    saveMessages(messages) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(messages));
        // Disparar event per actualitzar totes les vistes
        window.dispatchEvent(new CustomEvent('messagesUpdated'));
    },

    // Obtenir nombre de no llegits
    getUnreadCount() {
        return this.getUnread().length;
    }
};

// Inicialitzar en carregar
MessagesManager.init();
