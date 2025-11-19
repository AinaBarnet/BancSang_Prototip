// Protegir la pàgina - requerir autenticació
if (!AuthManager.requireAuth()) {
    throw new Error('Accés no autoritzat');
}

// Gestor de xat per BancSang - estil WhatsApp
const ChatManager = {
    STORAGE_KEY: 'bancSang_chat',
    CONTACTS_KEY: 'bancSang_chat_contacts',

    // Contactes per defecte (doctors, staff del banc de sang, etc.)
    defaultContacts: [
        {
            id: 'dr-joan',
            name: 'Dr. Joan Martínez',
            avatar: '👨‍⚕️',
            role: 'Metge responsable',
            online: true,
            lastSeen: null
        },
        {
            id: 'dra-maria',
            name: 'Dra. Maria López',
            avatar: '👩‍⚕️',
            role: 'Coordinadora',
            online: false,
            lastSeen: new Date(Date.now() - 3600000).getTime() // fa 1 hora
        },
        {
            id: 'suport',
            name: 'Suport BancSang',
            avatar: '🩸',
            role: 'Atenció al donant',
            online: true,
            lastSeen: null
        },
        {
            id: 'anna-puig',
            name: 'Anna Puig',
            avatar: '👤',
            role: 'Donant regular',
            online: false,
            lastSeen: new Date(Date.now() - 7200000).getTime() // fa 2 hores
        },
        {
            id: 'marc-soler',
            name: 'Marc Soler',
            avatar: '👤',
            role: 'Donant',
            online: true,
            lastSeen: null
        }
    ],

    // Missatges d'exemple
    defaultMessages: {
        'dr-joan': [
            {
                id: 'msg-1',
                text: 'Hola! Volia recordar-te que la teva pròxima donació està programada per divendres.',
                sender: 'dr-joan',
                timestamp: new Date(Date.now() - 86400000).getTime(), // ahir
                read: true,
                sent: true
            },
            {
                id: 'msg-2',
                text: 'Gràcies per l\'avís! Hi seré puntual.',
                sender: 'me',
                timestamp: new Date(Date.now() - 82800000).getTime(),
                read: true,
                sent: true
            },
            {
                id: 'msg-3',
                text: 'Perfecte! Recorda estar ben descansat i haver menjat bé.',
                sender: 'dr-joan',
                timestamp: new Date(Date.now() - 82200000).getTime(),
                read: true,
                sent: true
            }
        ],
        'suport': [
            {
                id: 'msg-4',
                text: 'Benvingut al servei de suport de BancSang! Com et podem ajudar?',
                sender: 'suport',
                timestamp: new Date(Date.now() - 7200000).getTime(), // fa 2 hores
                read: false,
                sent: true
            }
        ],
        'dra-maria': [
            {
                id: 'msg-5',
                text: 'Els teus resultats de l\'última donació són excel·lents!',
                sender: 'dra-maria',
                timestamp: new Date(Date.now() - 172800000).getTime(), // fa 2 dies
                read: true,
                sent: true
            },
            {
                id: 'msg-6',
                text: 'Moltes gràcies per la informació! 😊',
                sender: 'me',
                timestamp: new Date(Date.now() - 169200000).getTime(),
                read: true,
                sent: true
            }
        ]
    },

    // Inicialitzar el sistema (ara per usuari)
    init() {
        const contacts = UserDataManager.getChatContacts();
        const conversations = UserDataManager.getChatConversations();

        if (contacts.length === 0) {
            this.saveContacts(this.defaultContacts);
        }
        if (Object.keys(conversations).length === 0) {
            this.saveAllConversations(this.defaultMessages);
        }
    },

    // Obtenir tots els contactes (ara per usuari)
    getContacts() {
        const contacts = UserDataManager.getChatContacts();
        return contacts.length > 0 ? contacts : this.defaultContacts;
    },

    // Guardar contactes (ara per usuari)
    saveContacts(contacts) {
        UserDataManager.saveChatContacts(contacts);
    },

    // Obtenir un contacte per ID
    getContact(contactId) {
        const contacts = this.getContacts();
        return contacts.find(c => c.id === contactId);
    },

    // Obtenir totes les converses (ara per usuari)
    getAllConversations() {
        const conversations = UserDataManager.getChatConversations();
        return Object.keys(conversations).length > 0 ? conversations : this.defaultMessages;
    },

    // Guardar totes les converses (ara per usuari)
    saveAllConversations(conversations) {
        UserDataManager.saveChatConversations(conversations);
    },

    // Obtenir missatges d'una conversa
    getConversation(contactId) {
        const conversations = this.getAllConversations();
        return conversations[contactId] || [];
    },

    // Afegir un missatge a una conversa
    addMessage(contactId, text, isFromMe = true) {
        const conversations = this.getAllConversations();

        if (!conversations[contactId]) {
            conversations[contactId] = [];
        }

        const newMessage = {
            id: `msg-${Date.now()}`,
            text: text,
            sender: isFromMe ? 'me' : contactId,
            timestamp: Date.now(),
            read: isFromMe,
            sent: true,
            delivered: true
        };

        conversations[contactId].push(newMessage);
        this.saveAllConversations(conversations);

        return newMessage;
    },

    // Afegir un missatge d'un sender específic (útil per grups mock)
    addMessageFromSender(contactId, senderId, text) {
        const conversations = this.getAllConversations();

        if (!conversations[contactId]) {
            conversations[contactId] = [];
        }

        const newMessage = {
            id: `msg-${Date.now()}`,
            text: text,
            sender: senderId,
            timestamp: Date.now(),
            read: false,
            sent: false,
            delivered: true
        };

        conversations[contactId].push(newMessage);
        this.saveAllConversations(conversations);

        return newMessage;
    },

    // Marcar missatges com llegits
    markAsRead(contactId) {
        const conversations = this.getAllConversations();
        const conversation = conversations[contactId];

        if (conversation) {
            conversation.forEach(msg => {
                if (msg.sender !== 'me') {
                    msg.read = true;
                }
            });
            this.saveAllConversations(conversations);
        }
    },

    // Obtenir el darrer missatge d'una conversa
    getLastMessage(contactId) {
        const conversation = this.getConversation(contactId);
        return conversation.length > 0 ? conversation[conversation.length - 1] : null;
    },

    // Comptar missatges no llegits
    getUnreadCount(contactId) {
        const conversation = this.getConversation(contactId);
        return conversation.filter(msg => !msg.read && msg.sender !== 'me').length;
    },

    // Comptar tots els missatges no llegits
    getTotalUnreadCount() {
        const conversations = this.getAllConversations();
        let total = 0;

        Object.keys(conversations).forEach(contactId => {
            total += this.getUnreadCount(contactId);
        });

        return total;
    },

    // Obtenir llista de converses ordenades per darrer missatge
    getConversationsList() {
        const conversations = this.getAllConversations();
        const contacts = this.getContacts();
        const list = [];

        Object.keys(conversations).forEach(contactId => {
            const contact = contacts.find(c => c.id === contactId);
            const lastMessage = this.getLastMessage(contactId);
            const unreadCount = this.getUnreadCount(contactId);

            if (contact && lastMessage) {
                list.push({
                    contact: contact,
                    lastMessage: lastMessage,
                    unreadCount: unreadCount,
                    timestamp: lastMessage.timestamp
                });
            }
        });

        // Ordenar per timestamp descendent (més recent primer)
        list.sort((a, b) => b.timestamp - a.timestamp);

        return list;
    },

    // Simular resposta automàtica (per proves)
    simulateResponse(contactId, delay = 2000, senderId = null) {
        const responses = [
            'D\'acord, entenc.',
            'Moltes gràcies per la informació!',
            'Perfecte, quedo a l\'espera.',
            'Cap problema, estic disponible.',
            'Ho tinc en compte, gràcies!',
            'Entesos, ens veiem aviat.'
        ];

        setTimeout(() => {
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            if (senderId) {
                // If a specific senderId is provided, add message from that sender (useful for groups)
                this.addMessageFromSender(contactId, senderId, randomResponse);
            } else {
                this.addMessage(contactId, randomResponse, false);
            }

            // Trigger event per actualitzar la UI
            window.dispatchEvent(new CustomEvent('newMessage', {
                detail: { contactId, isFromMe: false }
            }));
        }, delay);
    },

    // Afegir nou contacte
    addContact(name, avatar = '👤', role = 'Contacte') {
        const contacts = this.getContacts();
        const newContact = {
            id: `contact-${Date.now()}`,
            name: name,
            avatar: avatar,
            role: role,
            online: false,
            lastSeen: Date.now()
        };

        contacts.push(newContact);
        this.saveContacts(contacts);

        return newContact;
    },

    // Eliminar conversa
    deleteConversation(contactId) {
        const conversations = this.getAllConversations();
        delete conversations[contactId];
        this.saveAllConversations(conversations);
    },

    // Cercar missatges
    searchMessages(query) {
        const conversations = this.getAllConversations();
        const contacts = this.getContacts();
        const results = [];

        Object.keys(conversations).forEach(contactId => {
            const contact = contacts.find(c => c.id === contactId);
            const messages = conversations[contactId];

            messages.forEach(msg => {
                if (msg.text.toLowerCase().includes(query.toLowerCase())) {
                    results.push({
                        contact: contact,
                        message: msg,
                        contactId: contactId
                    });
                }
            });
        });

        return results;
    },

    // Formatar hora per mostrar
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            // Avui: mostrar hora
            return date.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Ahir';
        } else if (diffDays < 7) {
            return date.toLocaleDateString('ca-ES', { weekday: 'long' });
        } else {
            return date.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' });
        }
    },

    // Formatar última connexió
    formatLastSeen(timestamp) {
        if (!timestamp) return 'En línia';

        const date = new Date(timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffMinutes < 1) return 'Ara mateix';
        if (diffMinutes < 60) return `fa ${diffMinutes} min`;

        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `fa ${diffHours}h`;

        const diffDays = Math.floor(diffHours / 24);
        return `fa ${diffDays} dies`;
    },

    // Exportar contactes a JSON
    exportContacts() {
        const contacts = this.getContacts();
        const dataStr = JSON.stringify(contacts, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `BancSang_Contactes_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return contacts.length;
    }
};

// Lògica del xat tipus WhatsApp per BancSang
let currentChatId = null;
let isTyping = false;
let typingTimeout = null;

// Elements del DOM
const conversationsList = document.getElementById('conversationsList');
const chatWelcome = document.getElementById('chatWelcome');
const chatActive = document.getElementById('chatActive');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatName = document.getElementById('chatName');
const chatStatus = document.getElementById('chatStatus');
const chatAvatar = document.getElementById('chatAvatar');
const typingIndicator = document.getElementById('typingIndicator');
const typingAvatar = document.getElementById('typingAvatar');
const searchInput = document.getElementById('searchInput');
const newChatBtn = document.getElementById('newChatBtn');
const newChatModal = document.getElementById('newChatModal');
const closeNewChatModal = document.getElementById('closeNewChatModal');
const contactsList = document.getElementById('contactsList');
const contactSearchInput = document.getElementById('contactSearchInput');
const emojiBtn = document.getElementById('emojiBtn');
const emojiPanel = document.getElementById('emojiPanel');
const chatMenuBtn = document.getElementById('chatMenuBtn');
const contextMenu = document.getElementById('contextMenu');
const newGroupBtn = document.getElementById('newGroupBtn');
const newGroupModal = document.getElementById('newGroupModal');
const closeNewGroupModal = document.getElementById('closeNewGroupModal');
const groupContactsList = document.getElementById('groupContactsList');
const groupContactSearchInput = document.getElementById('groupContactSearchInput');
const createGroupBtn = document.getElementById('createGroupBtn');
const cancelGroupBtn = document.getElementById('cancelGroupBtn');
const selectedContactsList = document.getElementById('selectedContactsList');
const selectedContactsDiv = document.getElementById('selectedContacts');
const addContactBtn = document.getElementById('addContactBtn');
const exportContactsBtn = document.getElementById('exportContactsBtn');
const addContactModal = document.getElementById('addContactModal');
const closeAddContactModal = document.getElementById('closeAddContactModal');
const saveContactBtn = document.getElementById('saveContactBtn');
const cancelContactBtn = document.getElementById('cancelContactBtn');
const searchGroupsBtn = document.getElementById('searchGroupsBtn');
const searchGroupsModal = document.getElementById('searchGroupsModal');
const closeSearchGroupsModal = document.getElementById('closeSearchGroupsModal');
const groupsList = document.getElementById('groupsList');

let selectedGroupContacts = [];

// Key to persist groups
const GROUPS_STORAGE_KEY = 'bancSang_groups';

// Mock groups default list
const defaultMockGroups = [
    {
        id: 'group-amantes-deporte',
        name: 'amantes del deporte',
        avatar: '🏃',
        messages: [
            { sender: 'system', text: 'Benvinguts al grup d\'amants de l\'esport!', time: '08:00' },
            { sender: 'ana', text: 'Quedem diumenge per córrer?', time: '08:05' }
        ],
        members: []
    },
    {
        id: 'group-gamers',
        name: 'gamers',
        avatar: '🎮',
        messages: [
            { sender: 'system', text: 'Sala de jocs oberta!', time: '20:00' },
            { sender: 'marc', text: 'Algu pot fer una partida?', time: '20:10' }
        ],
        members: []
    }
];

function getSavedGroups() {
    try {
        const raw = localStorage.getItem(GROUPS_STORAGE_KEY);
        if (!raw) return defaultMockGroups.slice();
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return defaultMockGroups.slice();
        return parsed;
    } catch (e) {
        console.error('Error reading saved groups', e);
        return defaultMockGroups.slice();
    }
}

function saveGroups(groups) {
    try {
        localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
    } catch (e) {
        console.error('Error saving groups', e);
    }
}

// Inicialitzar
document.addEventListener('DOMContentLoaded', () => {
    // Ensure ChatManager defaults exist
    if (typeof ChatManager.init === 'function') ChatManager.init();

    loadConversations();
    setupEventListeners();

    // Escoltar nous missatges
    window.addEventListener('newMessage', (e) => {
        const { contactId, isFromMe } = e.detail;

        // Actualitzar llista de converses
        loadConversations();

        // Si la conversa està oberta, actualitzar missatges
        if (currentChatId === contactId) {
            loadMessages(contactId);
            scrollToBottom();

            // Mostrar indicador d'escriptura si és de l'altre
            if (!isFromMe) {
                showTypingIndicator(contactId, 1000);
            }
        }

        // Reproduir so de notificació (opcional)
        playNotificationSound();
    });
    // If page was opened with ?contactId=..., open that chat automatically
    const params = new URLSearchParams(window.location.search);
    const contactParam = params.get('contactId');
    if (contactParam) {
        // Delay a bit to allow UI to render
        setTimeout(() => {
            openChat(contactParam);
        }, 120);
    }
});

// Configurar event listeners
function setupEventListeners() {
    // Enviar missatge
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Autoajustar altura del textarea
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
    });

    // Cerca de converses
    searchInput.addEventListener('input', (e) => {
        filterConversations(e.target.value);
    });

    // Nova conversa
    newChatBtn.addEventListener('click', openNewChatModal);
    closeNewChatModal.addEventListener('click', closeNewChatModalFunc);
    newChatModal.addEventListener('click', (e) => {
        if (e.target === newChatModal) {
            closeNewChatModalFunc();
        }
    });

    // Cerca de contactes
    contactSearchInput.addEventListener('input', (e) => {
        filterContacts(e.target.value);
    });

    // Panel d'emojis
    emojiBtn.addEventListener('click', toggleEmojiPanel);
    document.addEventListener('click', (e) => {
        if (!emojiPanel.contains(e.target) && e.target !== emojiBtn) {
            emojiPanel.style.display = 'none';
        }
    });

    // Seleccionar emoji
    emojiPanel.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            messageInput.value += e.target.textContent;
            messageInput.focus();
        });
    });

    // Menú contextual
    chatMenuBtn.addEventListener('click', (e) => {
        toggleContextMenu(e);
    });

    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target) && e.target !== chatMenuBtn) {
            contextMenu.style.display = 'none';
        }
    });

    // Accions del menú contextual
    contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
        item.addEventListener('click', handleContextMenuAction);
    });

    // Nou grup
    newGroupBtn.addEventListener('click', openNewGroupModal);
    closeNewGroupModal.addEventListener('click', closeNewGroupModalFunc);
    cancelGroupBtn.addEventListener('click', closeNewGroupModalFunc);
    newGroupModal.addEventListener('click', (e) => {
        if (e.target === newGroupModal) {
            closeNewGroupModalFunc();
        }
    });

    // Buscar grups (mock)
    if (searchGroupsBtn) searchGroupsBtn.addEventListener('click', openSearchGroupsModal);
    if (closeSearchGroupsModal) closeSearchGroupsModal.addEventListener('click', closeSearchGroupsModalFunc);
    if (searchGroupsModal) searchGroupsModal.addEventListener('click', (e) => {
        if (e.target === searchGroupsModal) closeSearchGroupsModalFunc();
    });

    // Cerca de contactes per grup
    groupContactSearchInput.addEventListener('click', (e) => {
        filterGroupContacts(e.target.value);
    });

    // Crear grup
    createGroupBtn.addEventListener('click', handleCreateGroup);

    // Gestió de contactes
    addContactBtn.addEventListener('click', openAddContactModal);
    closeAddContactModal.addEventListener('click', closeAddContactModalFunc);
    cancelContactBtn.addEventListener('click', closeAddContactModalFunc);
    addContactModal.addEventListener('click', (e) => {
        if (e.target === addContactModal) {
            closeAddContactModalFunc();
        }
    });
    saveContactBtn.addEventListener('click', handleSaveContact);
    exportContactsBtn.addEventListener('click', handleExportContacts);
}

// Carregar llista de converses
function loadConversations() {
    const conversations = ChatManager.getConversationsList();
    conversationsList.innerHTML = '';

    if (conversations.length === 0) {
        conversationsList.innerHTML = `
            <div class="empty-conversations">
                <p>No tens cap conversa encara</p>
                <p class="subtitle">Clica el botó + per començar</p>
            </div>
        `;
        return;
    }

    conversations.forEach(conv => {
        const item = createConversationItem(conv);
        conversationsList.appendChild(item);
    });
}

// Crear element de conversa
function createConversationItem(conv) {
    const div = document.createElement('div');
    div.className = `conversation-item${conv.unreadCount > 0 ? ' unread' : ''}`;
    div.dataset.contactId = conv.contact.id;

    let lastMessageText = '';
    try {
        if (conv.contact && conv.contact.role === 'Grup' && conv.lastMessage && conv.lastMessage.sender !== 'me') {
            lastMessageText = `${getSenderDisplayName(conv.lastMessage.sender)}: ${conv.lastMessage.text}`;
        } else if (conv.lastMessage && conv.lastMessage.sender === 'me') {
            lastMessageText = `Tu: ${conv.lastMessage.text}`;
        } else if (conv.lastMessage) {
            lastMessageText = conv.lastMessage.text;
        }
    } catch (e) {
        lastMessageText = conv.lastMessage ? conv.lastMessage.text : '';
    }

    const timeStr = ChatManager.formatTime(conv.lastMessage.timestamp);

    div.innerHTML = `
        <div class="conversation-avatar">${conv.contact.avatar}</div>
        <div class="conversation-content">
            <div class="conversation-header">
                <h4>${conv.contact.name}</h4>
                <span class="conversation-time">${timeStr}</span>
            </div>
            <div class="conversation-preview">
                <p>${truncateText(lastMessageText, 50)}</p>
                ${conv.unreadCount > 0 ? `<span class="unread-badge">${conv.unreadCount}</span>` : ''}
            </div>
        </div>
    `;

    div.addEventListener('click', () => {
        openChat(conv.contact.id);
    });

    return div;
}

// Obrir xat
function openChat(contactId) {
    currentChatId = contactId;
    const contact = ChatManager.getContact(contactId);

    if (!contact) return;

    // Actualitzar capçalera
    chatAvatar.textContent = contact.avatar;
    chatName.textContent = contact.name;

    if (contact.online) {
        chatStatus.textContent = 'En línia';
        chatStatus.classList.add('online');
    } else {
        chatStatus.textContent = ChatManager.formatLastSeen(contact.lastSeen);
        chatStatus.classList.remove('online');
    }

    // Marcar com llegit
    ChatManager.markAsRead(contactId);

    // Carregar missatges
    loadMessages(contactId);

    // Mostrar xat actiu
    chatWelcome.style.display = 'none';
    chatActive.style.display = 'flex';

    // Actualitzar converses per treure el badge
    loadConversations();

    // Scroll al final
    setTimeout(scrollToBottom, 100);

    // Focus al input
    messageInput.focus();
}

// Carregar missatges
function loadMessages(contactId) {
    const messages = ChatManager.getConversation(contactId);
    chatMessages.innerHTML = '';

    let currentDate = null;

    messages.forEach(msg => {
        // Afegir separador de data si cal
        const msgDate = new Date(msg.timestamp).toLocaleDateString('ca-ES');
        if (msgDate !== currentDate) {
            currentDate = msgDate;
            const dateSeparator = createDateSeparator(msg.timestamp);
            chatMessages.appendChild(dateSeparator);
        }

        const messageEl = createMessageElement(msg);
        chatMessages.appendChild(messageEl);
    });
}

// Crear separador de data
function createDateSeparator(timestamp) {
    const div = document.createElement('div');
    div.className = 'date-separator';

    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateText;
    if (date.toDateString() === today.toDateString()) {
        dateText = 'Avui';
    } else if (date.toDateString() === yesterday.toDateString()) {
        dateText = 'Ahir';
    } else {
        dateText = date.toLocaleDateString('ca-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    div.innerHTML = `<span>${dateText}</span>`;
    return div;
}

// Crear element de missatge
function createMessageElement(msg) {
    const div = document.createElement('div');
    const isSent = msg.sender === 'me';
    div.className = `message ${isSent ? 'sent' : 'received'}`;

    const time = new Date(msg.timestamp).toLocaleTimeString('ca-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const status = isSent ? `<span class="message-status">${msg.read ? '✓✓' : '✓'}</span>` : '';

    // Determine if current chat is a group
    const currentContact = ChatManager.getContact(currentChatId);
    const isGroup = currentContact && currentContact.role === 'Grup';

    // For group chats, show sender name for messages not from 'me'
    let senderHtml = '';
    if (isGroup && !isSent) {
        const senderName = getSenderDisplayName(msg.sender);
        if (senderName) {
            senderHtml = `<div class="message-sender">${escapeHtml(senderName)}</div>`;
        }
    }

    div.innerHTML = `
        <div class="message-bubble">
            ${senderHtml}
            <p>${escapeHtml(msg.text)}</p>
            <div class="message-footer">
                <span class="message-time">${time}</span>
                ${status}
            </div>
        </div>
    `;

    return div;
}

// Enviar missatge
function sendMessage() {
    const text = messageInput.value.trim();

    if (!text || !currentChatId) return;

    const contact = ChatManager.getContact(currentChatId);

    // Always create the user's own message as 'me'
    ChatManager.addMessage(currentChatId, text, true);
    window.dispatchEvent(new CustomEvent('newMessage', { detail: { contactId: currentChatId, isFromMe: true } }));

    // If chat is a group, schedule a mocked reply from a random group member
    if (contact && contact.role === 'Grup') {
        const groups = getSavedGroups();
        const group = groups.find(g => g.id === currentChatId);
        let replySenderId = null;
        if (group && Array.isArray(group.members) && group.members.length > 0) {
            // choose a random member (could be any; optionally exclude 'me' if member ids include it)
            const idx = Math.floor(Math.random() * group.members.length);
            replySenderId = group.members[idx];
        } else {
            const contacts = ChatManager.getContacts();
            replySenderId = (contacts && contacts.length) ? contacts[0].id : 'suport';
        }

        // show typing and simulate response from that member
        showTypingIndicator(currentChatId, 1200);
        ChatManager.simulateResponse(currentChatId, 2000, replySenderId);
    }

    // Netejar input
    messageInput.value = '';
    messageInput.style.height = 'auto';

    // Actualitzar UI
    loadMessages(currentChatId);
    loadConversations();
    scrollToBottom();

    // Simular resposta automàtica (per proves)
    const simContact = ChatManager.getContact(currentChatId);
    // Only trigger the generic simulateResponse for non-group chats.
    // Group replies are handled above (simulated from a random member), so skip here for groups.
    if (simContact && simContact.role !== 'Grup' && Math.random() > 0.3) { // 70% de probabilitat
        showTypingIndicator(currentChatId, 2000);
        ChatManager.simulateResponse(currentChatId, 3000);
    }

    // Focus al input
    messageInput.focus();
}

// Mostrar indicador d'escriptura
function showTypingIndicator(contactId, duration = 2000) {
    if (currentChatId !== contactId) return;

    const contact = ChatManager.getContact(contactId);
    typingAvatar.textContent = contact.avatar;
    typingIndicator.style.display = 'flex';
    scrollToBottom();

    setTimeout(() => {
        typingIndicator.style.display = 'none';
    }, duration);
}

// Scroll al final
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Filtrar converses
function filterConversations(query) {
    const items = conversationsList.querySelectorAll('.conversation-item');
    const lowerQuery = query.toLowerCase();

    items.forEach(item => {
        const contactId = item.dataset.contactId;
        const contact = ChatManager.getContact(contactId);
        const matchesName = contact.name.toLowerCase().includes(lowerQuery);

        item.style.display = matchesName ? 'flex' : 'none';
    });
}

// Obrir modal de nova conversa
function openNewChatModal() {
    newChatModal.classList.add('active');
    loadContactsList();
    contactSearchInput.value = '';
    contactSearchInput.focus();
}

// Tancar modal de nova conversa
function closeNewChatModalFunc() {
    newChatModal.classList.remove('active');
}

// Obrir modal de nou grup
function openNewGroupModal() {
    newGroupModal.classList.add('active');
    selectedGroupContacts = [];
    updateSelectedContactsList();
    loadGroupContactsList();
    groupContactSearchInput.value = '';
    document.getElementById('groupName').value = '';
    document.getElementById('groupDescription').value = '';
}

// Tancar modal de nou grup
function closeNewGroupModalFunc() {
    newGroupModal.classList.remove('active');
    selectedGroupContacts = [];
    updateSelectedContactsList();
}

// Obrir modal de buscar grups mock
function openSearchGroupsModal() {
    if (!searchGroupsModal) return;
    searchGroupsModal.style.display = 'flex';
    // Carregar grups mock
    loadMockGroups();
}

// Tancar modal de buscar grups
function closeSearchGroupsModalFunc() {
    if (!searchGroupsModal) return;
    searchGroupsModal.style.display = 'none';
}

// Renderitza la llista de grups mock
function loadMockGroups() {
    if (!groupsList) return;
    groupsList.innerHTML = '';

    const groups = getSavedGroups();

    groups.forEach(g => {
        const item = document.createElement('div');
        item.className = 'group-item';
        item.dataset.groupId = g.id;
        const lastText = (g.messages && g.messages.length) ? g.messages[g.messages.length - 1].text : '';
        const membersCount = Array.isArray(g.members) ? g.members.length : 0;
        item.innerHTML = `
            <div class="group-avatar">${g.avatar || '👥'}</div>
            <div class="group-info">
                <h4>${escapeHtml(g.name)}</h4>
                <p class="group-preview">${escapeHtml(lastText)}</p>
            </div>
            ${membersCount > 0 ? `<div class="group-badge">${membersCount}</div>` : ''}
        `;

        item.addEventListener('click', () => {
            showMockGroupChat(g.id);
            closeSearchGroupsModalFunc();
        });

        groupsList.appendChild(item);
    });
}

// Mostrar xat d'un grup mock i integrar-lo amb ChatManager (persisteix)
function showMockGroupChat(groupId) {
    const groups = getSavedGroups();
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    // Afegir el grup com a contacte si no existeix
    const contacts = ChatManager.getContacts();
    if (!contacts.find(c => c.id === group.id)) {
        contacts.push({
            id: group.id,
            name: group.name,
            avatar: group.avatar || '👥',
            role: 'Grup',
            online: false,
            lastSeen: Date.now()
        });
        ChatManager.saveContacts(contacts);
    }

    // Afegir converses mock si no existeixen
    const conversations = ChatManager.getAllConversations();
    if (!conversations[group.id]) {
        conversations[group.id] = (group.messages || []).map((m, idx) => ({
            id: `msg-${group.id}-${Date.now()}-${idx}`,
            text: m.text,
            sender: m.sender === 'me' ? 'me' : (m.sender || group.id),
            timestamp: Date.now() - ((group.messages.length - idx) * 60000),
            read: false,
            sent: m.sender === 'me',
            delivered: true
        }));
        ChatManager.saveAllConversations(conversations);
    }

    // Actualitzar UI i obrir la conversa com una conversa normal
    loadConversations();
    openChat(group.id);
}

// Carregar llista de contactes per grup
function loadGroupContactsList() {
    // Only show contacts that are not groups (role !== 'Grup') so you can't add a group as a member
    const allContacts = ChatManager.getContacts();
    const contacts = Array.isArray(allContacts) ? allContacts.filter(c => c.role !== 'Grup') : [];
    groupContactsList.innerHTML = '';

    if (contacts.length === 0) {
        groupContactsList.innerHTML = `<div class="empty-contacts">No hi ha contactes disponibles per afegir al grup</div>`;
        return;
    }

    contacts.forEach(contact => {
        const item = document.createElement('div');
        item.className = 'contact-item';

        const isSelected = selectedGroupContacts.includes(contact.id);

        item.innerHTML = `
            <input type="checkbox" 
                   id="group-contact-${contact.id}" 
                   ${isSelected ? 'checked' : ''}
                   data-contact-id="${contact.id}">
            <div class="contact-avatar">${contact.avatar}</div>
            <div class="contact-info">
                <h4>${contact.name}</h4>
                <p>${contact.role}</p>
            </div>
        `;

        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                if (!selectedGroupContacts.includes(contact.id)) {
                    selectedGroupContacts.push(contact.id);
                }
            } else {
                selectedGroupContacts = selectedGroupContacts.filter(id => id !== contact.id);
            }
            updateSelectedContactsList();
        });

        groupContactsList.appendChild(item);
    });
}

// Actualitzar llista de contactes seleccionats
function updateSelectedContactsList() {
    if (selectedGroupContacts.length === 0) {
        selectedContactsDiv.style.display = 'none';
        return;
    }

    selectedContactsDiv.style.display = 'block';
    selectedContactsList.innerHTML = '';

    const contacts = ChatManager.getContacts();
    selectedGroupContacts.forEach(contactId => {
        const contact = contacts.find(c => c.id === contactId);
        if (contact) {
            const chip = document.createElement('div');
            chip.className = 'selected-contact-chip';
            chip.innerHTML = `
                <span>${contact.name}</span>
                <button data-contact-id="${contactId}">✕</button>
            `;

            const removeBtn = chip.querySelector('button');
            removeBtn.addEventListener('click', () => {
                selectedGroupContacts = selectedGroupContacts.filter(id => id !== contactId);
                updateSelectedContactsList();
                loadGroupContactsList();
            });

            selectedContactsList.appendChild(chip);
        }
    });
}

// Filtrar contactes per grup
function filterGroupContacts(query) {
    const items = groupContactsList.querySelectorAll('.contact-item');
    const lowerQuery = query.toLowerCase();

    items.forEach(item => {
        const name = item.querySelector('h4').textContent.toLowerCase();
        item.style.display = name.includes(lowerQuery) ? 'flex' : 'none';
    });
}

// Gestionar creació de grup
function handleCreateGroup() {
    const groupName = document.getElementById('groupName').value.trim();
    const groupDescription = document.getElementById('groupDescription').value.trim();

    if (!groupName) {
        showFeedback('Si us plau, introdueix un nom per al grup');
        return;
    }

    if (selectedGroupContacts.length === 0) {
        showFeedback('Si us plau, selecciona almenys un participant');
        return;
    }

    // Crear objecte del grup i persistir-lo
    const groups = getSavedGroups();
    const newGroup = {
        id: `group-${Date.now()}`,
        name: groupName,
        description: groupDescription,
        avatar: '👥',
        messages: [],
        members: selectedGroupContacts.slice()
    };

    groups.push(newGroup);
    saveGroups(groups);

    showFeedback(`Grup "${groupName}" creat amb ${selectedGroupContacts.length} participants!`);
    closeNewGroupModalFunc();

    // Si la modal de buscar grups està oberta, recarregar la llista per mostrar el nou grup
    if (searchGroupsModal && searchGroupsModal.style.display === 'flex') {
        loadMockGroups();
    }

    // Add the new group as a contact in ChatManager so it appears in the conversations selector
    const contacts = ChatManager.getContacts();
    if (!contacts.find(c => c.id === newGroup.id)) {
        contacts.push({
            id: newGroup.id,
            name: newGroup.name,
            avatar: newGroup.avatar || '👥',
            role: 'Grup',
            online: false,
            lastSeen: Date.now()
        });
        ChatManager.saveContacts(contacts);
    }

    // Ensure there's a conversation entry for the group (empty or with initial messages)
    const conversations = ChatManager.getAllConversations();
    if (!conversations[newGroup.id]) {
        conversations[newGroup.id] = (newGroup.messages || []).map((m, idx) => ({
            id: `msg-${newGroup.id}-${Date.now()}-${idx}`,
            text: m.text,
            sender: m.sender === 'me' ? 'me' : (m.sender || newGroup.id),
            timestamp: Date.now() - ((newGroup.messages.length - idx) * 60000),
            read: false,
            sent: m.sender === 'me',
            delivered: true
        }));
        ChatManager.saveAllConversations(conversations);
    }

    // Refresh conversations list so the new group appears immediately
    loadConversations();
}

// Obrir modal d'afegir contacte
function openAddContactModal() {
    addContactModal.classList.add('active');
    document.getElementById('contactName').value = '';
    document.getElementById('contactRole').value = '';
    document.getElementById('contactAvatar').value = '👤';

    // Reset selecció d'avatars
    document.querySelectorAll('.avatar-option').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.avatar === '👤') {
            btn.classList.add('selected');
        }
    });

    // Gestionar selecció d'avatars
    document.querySelectorAll('.avatar-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            document.getElementById('contactAvatar').value = btn.dataset.avatar;
        });
    });
}

// Tancar modal d'afegir contacte
function closeAddContactModalFunc() {
    addContactModal.classList.remove('active');
}

// Guardar nou contacte
function handleSaveContact() {
    const name = document.getElementById('contactName').value.trim();
    const role = document.getElementById('contactRole').value.trim() || 'Contacte';
    const avatar = document.getElementById('contactAvatar').value.trim() || '👤';

    if (!name) {
        showFeedback('Si us plau, introdueix un nom per al contacte');
        return;
    }

    // Afegir contacte al ChatManager
    const newContact = ChatManager.addContact(name, avatar, role);

    showFeedback(`Contacte "${name}" afegit correctament!`);
    closeAddContactModalFunc();

    // Recarregar llista de converses
    loadConversations();
}

// Exportar contactes
function handleExportContacts() {
    ChatManager.exportContacts();
}

// Carregar llista de contactes
function loadContactsList() {
    const contacts = ChatManager.getContacts();
    contactsList.innerHTML = '';

    contacts.forEach(contact => {
        const item = document.createElement('div');
        item.className = 'contact-item';
        item.innerHTML = `
            <div class="contact-avatar">${contact.avatar}</div>
            <div class="contact-info">
                <h4>${contact.name}</h4>
                <p>${contact.role}</p>
            </div>
        `;

        item.addEventListener('click', () => {
            closeNewChatModalFunc();
            openChat(contact.id);
        });

        contactsList.appendChild(item);
    });
}

// Filtrar contactes
function filterContacts(query) {
    const items = contactsList.querySelectorAll('.contact-item');
    const lowerQuery = query.toLowerCase();

    items.forEach(item => {
        const name = item.querySelector('h4').textContent.toLowerCase();
        item.style.display = name.includes(lowerQuery) ? 'flex' : 'none';
    });
}

// Toggle panel d'emojis
function toggleEmojiPanel() {
    const isVisible = emojiPanel.style.display === 'flex';
    emojiPanel.style.display = isVisible ? 'none' : 'flex';
}

// Toggle menú contextual
function toggleContextMenu(e) {
    e.stopPropagation();
    const isVisible = contextMenu.style.display === 'block';

    if (isVisible) {
        contextMenu.style.display = 'none';
    } else {
        contextMenu.style.display = 'block';
        contextMenu.style.top = (e.clientY) + 'px';
        contextMenu.style.left = (e.clientX - 200) + 'px';
    }
}

// Gestionar accions del menú contextual
function handleContextMenuAction(e) {
    const action = e.currentTarget.dataset.action;

    switch (action) {
        case 'info':
            showContactInfo();
            break;
        case 'mute':
            muteConversation();
            break;
        case 'clear':
            clearChat();
            break;
        case 'delete':
            deleteConversation();
            break;
    }

    contextMenu.style.display = 'none';
}

// Mostrar informació del contacte
function showContactInfo() {
    const contact = ChatManager.getContact(currentChatId);
    modalManager.alert(`Contacte: ${contact.name}\nRol: ${contact.role}\nEstat: ${contact.online ? 'En línia' : 'Fora de línia'}`, 'Informació del contacte');
}

// Silenciar conversa
function muteConversation() {
    showFeedback('Notificacions silenciades');
}

// Esborrar xat
function clearChat() {
    if (confirm('Vols esborrar tots els missatges d\'aquesta conversa?')) {
        // Implementar lògica per esborrar missatges
        showFeedback('Xat esborrat');
    }
}

// Eliminar conversa
function deleteConversation() {
    if (confirm('Vols eliminar aquesta conversa?')) {
        ChatManager.deleteConversation(currentChatId);
        loadConversations();

        // Tornar a l'estat inicial
        chatActive.style.display = 'none';
        chatWelcome.style.display = 'flex';
        currentChatId = null;

        showFeedback('Conversa eliminada');
    }
}

// Mostrar feedback
function showFeedback(message) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback-toast';
    feedback.textContent = message;
    feedback.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10000;
        animation: fadeInUp 0.3s ease;
    `;

    document.body.appendChild(feedback);

    setTimeout(() => {
        feedback.style.animation = 'fadeOutDown 0.3s ease';
        setTimeout(() => feedback.remove(), 300);
    }, 2000);
}

// Reproduir so de notificació (opcional)
function playNotificationSound() {
    // Opcional: afegir un so de notificació
    // const audio = new Audio('sounds/notification.mp3');
    // audio.play().catch(() => {});
}

// Utilitats
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Mostrar nom d'un sender: si és un id de contacte, recuperar nom; si és 'me' -> 'Tu'; si és text pla, capitalitzar
function getSenderDisplayName(sender) {
    if (!sender) return '';
    if (sender === 'me') return 'Tu';
    // Si és id d'un contacte existent
    const contact = ChatManager.getContact(sender);
    if (contact) return contact.name;
    // Si és 'system'
    if (sender === 'system') return 'Sistema';
    // Si és una cadena normal, tornar-la amb capitalització simple
    if (typeof sender === 'string') {
        return sender.charAt(0).toUpperCase() + sender.slice(1);
    }
    return String(sender);
}

// Afegir estils d'animació
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translate(-50%, 20px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
    
    @keyframes fadeOutDown {
        from {
            opacity: 1;
            transform: translate(-50%, 0);
        }
        to {
            opacity: 0;
            transform: translate(-50%, 20px);
        }
    }
    /* Styles per la llista de grups (Buscar grups) */
    .groups-list .group-item {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 10px;
        border-radius: 10px;
        background: rgba(0,0,0,0.03);
        margin-bottom: 8px;
        cursor: pointer;
        transition: background 0.12s ease, transform 0.08s ease;
    }
    .groups-list .group-item:hover {
        background: rgba(0,0,0,0.06);
        transform: translateY(-1px);
    }
    .groups-list .group-avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f0f0f0;
        font-size: 20px;
    }
    .groups-list .group-info h4 {
        margin: 0 0 4px 0;
        font-size: 15px;
    }
    .groups-list .group-info .group-preview {
        margin: 0;
        color: #666;
        font-size: 13px;
    }
    .groups-list .group-item .group-badge {
        font-size: 11px;
        color: #fff;
        background: #6b6cff;
        padding: 2px 6px;
        border-radius: 6px;
        margin-left: auto;
    }
`;
document.head.appendChild(style);
