// Protegir la pàgina - requerir autenticació
if (!AuthManager.requireAuth()) {
    throw new Error('Accés no autoritzat');
}

// Gestor de xat per BancSang - estil WhatsApp
const ChatManager = {
    STORAGE_KEY: 'bancSang_chat',
    CONTACTS_KEY: 'bancSang_chat_contacts',

    // Contactes per defecte (buida per començar)
    defaultContacts: [],


    // Missatges d'exemple (buit per començar)
    defaultMessages: {},

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
const groupSearchInput = document.getElementById('groupSearchInput');

let selectedGroupContacts = [];
// Elements per editar contacte/grup
const editContactBtn = document.getElementById('editContactBtn');
const editContactModal = document.getElementById('editContactModal');
const closeEditContactModal = document.getElementById('closeEditContactModal');
const editContactName = document.getElementById('editContactName');
const editContactRole = document.getElementById('editContactRole');
const editAvatarSelector = document.getElementById('editAvatarSelector');
const editContactAvatar = document.getElementById('editContactAvatar');
const cancelEditContactBtn = document.getElementById('cancelEditContactBtn');
const saveEditContactBtn = document.getElementById('saveEditContactBtn');

// Key to persist groups
const GROUPS_STORAGE_KEY = 'bancSang_groups';

// Mock groups default list
const defaultMockGroups = [
    {
        id: 'group-amants-deporte',
        name: "Amants de l'esport",
        description: 'Grup per a persones actives i aficionades a l’esport. Comparteix sortides, reptes i motivació per mantenir-te en forma!',
        avatar: '🏃',
        messages: [
            { sender: 'System', text: 'Quedem diumenge per córrer?', time: '08:00' }
        ],
        members: [37]
    },
    {
        id: 'group-gamers',
        name: 'Gamers',
        description: 'Si t’agraden els videojocs, aquest és el teu grup! Organitzem partides, compartim novetats i fem pinya entre gamers.',
        avatar: '🎮',
        messages: [
            { sender: 'System', text: 'Algu pot fer una partida?', time: '20:00' }
        ],
        members: [12]
    },
    {
        id: 'group-donants-maresme',
        name: 'Sóc donant del Maresme',
        description: 'Grup per fer pinya entre donants de la comarca del Maresme  i organitzar sortides conjuntes per donar sang.',
        avatar: '🩸',
        messages: [
            { sender: 'System', text: 'Grup per fer pinya entre donants de la comarca del Maresme', time: '09:00' }
        ],
        members: [46]
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
        // Esborrar sempre la clau de grups mock a cada recàrrega de la pàgina
        localStorage.removeItem('bancSang_groups');
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
                const addContactFromEditGroupBottomBtn = document.getElementById('addContactFromEditGroupBottomBtn');
                if (addContactFromEditGroupBottomBtn) addContactFromEditGroupBottomBtn.addEventListener('click', openAddContactModal);
            // Botons 'Afegir contacte' a seccions de membres/contactes
            const addContactFromNewChatBtn = document.getElementById('addContactFromNewChatBtn');
            if (addContactFromNewChatBtn) addContactFromNewChatBtn.addEventListener('click', openAddContactModal);
            const addContactFromNewGroupBtn = document.getElementById('addContactFromNewGroupBtn');
            if (addContactFromNewGroupBtn) addContactFromNewGroupBtn.addEventListener('click', openAddContactModal);
            const addContactFromEditGroupBtn = document.getElementById('addContactFromEditGroupBtn');
            if (addContactFromEditGroupBtn) addContactFromEditGroupBtn.addEventListener('click', openAddContactModal);
        // Obrir modal d'edició de contacte/grup
        if (editContactBtn) {
            editContactBtn.addEventListener('click', openEditContactModal);
        }
        if (closeEditContactModal) closeEditContactModal.addEventListener('click', closeEditContactModalFunc);
        if (cancelEditContactBtn) cancelEditContactBtn.addEventListener('click', closeEditContactModalFunc);
        if (editContactModal) editContactModal.addEventListener('click', (e) => {
            if (e.target === editContactModal) closeEditContactModalFunc();
        });
        if (saveEditContactBtn) saveEditContactBtn.addEventListener('click', handleSaveEditContact);
    // Obrir modal d'edició i carregar dades del contacte/grup
    function openEditContactModal() {
        if (!currentChatId) return;
        const contact = ChatManager.getContact(currentChatId);
        if (!contact) return;
        // Carregar dades bàsiques
        editContactName.value = contact.name || '';
        editContactRole.value = contact.role || '';
        editContactAvatar.value = contact.avatar || '👤';
        // Generar opcions d'avatar
        const avatars = ['👤','👧🏼','🧒🏽','👦🏻','👩🏼','👩🏽','🧔🏽','👵🏼','🧓🏿','👴🏻','👱🏽','👨🏼','🧑🏽'];
        editAvatarSelector.innerHTML = '';
        avatars.forEach(av => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'avatar-option' + (contact.avatar === av ? ' selected' : '');
            btn.textContent = av;
            btn.dataset.avatar = av;
            btn.onclick = () => {
                editContactAvatar.value = av;
                editAvatarSelector.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            };
            editAvatarSelector.appendChild(btn);
        });

        // Si és grup, mostrar secció de membres
        const groupMembersSection = document.getElementById('editGroupMembersSection');
        if (contact.role && contact.role.toLowerCase().includes('grup')) {
            groupMembersSection.style.display = '';
            // Carregar membres i contactes
            const allContacts = ChatManager.getContacts();
            // Sempre inicialitzar la llista de membres a partir de contact.members (no reutilitzar _editMembers)
            let groupMembers = Array.isArray(contact.members) ? contact.members.slice() : [];
            // Mostrar contactes per afegir
            const membersListDiv = document.getElementById('editGroupMembersList');
            const selectedDiv = document.getElementById('editSelectedGroupMembers');
            const searchInput = document.getElementById('editGroupMemberSearch');
            let filter = '';
            function renderMembersList() {
                membersListDiv.innerHTML = '';
                allContacts.forEach(c => {
                    if (c.id === contact.id) return; // No afegir el grup a ell mateix
                    if (c.role && c.role.toLowerCase().includes('grup')) return; // No mostrar altres grups
                    if (filter && !c.name.toLowerCase().includes(filter.toLowerCase())) return;
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'member-option' + (groupMembers.includes(c.id) ? ' selected' : '');
                    btn.textContent = c.avatar + ' ' + c.name;
                    btn.onclick = () => {
                        const idx = groupMembers.indexOf(c.id);
                        if (idx === -1) groupMembers.push(c.id);
                        else groupMembers.splice(idx, 1);
                        renderMembersList();
                        renderSelected();
                    };
                    membersListDiv.appendChild(btn);
                });
            }
            function renderSelected() {
                selectedDiv.innerHTML = '';
                if (groupMembers.length === 0) {
                    selectedDiv.textContent = 'Cap membre seleccionat.';
                    return;
                }
                groupMembers.forEach(id => {
                    const c = allContacts.find(x => x.id === id);
                    if (!c) return;
                    const span = document.createElement('span');
                    span.className = 'selected-member';
                    span.textContent = c.avatar + ' ' + c.name;
                    // Botó per eliminar
                    const removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.textContent = '✕';
                    removeBtn.onclick = () => {
                        const idx = groupMembers.indexOf(id);
                        if (idx !== -1) groupMembers.splice(idx, 1);
                        renderMembersList();
                        renderSelected();
                    };
                    span.appendChild(removeBtn);
                    selectedDiv.appendChild(span);
                });
            }
            searchInput.value = '';
            searchInput.oninput = (e) => {
                filter = e.target.value;
                renderMembersList();
            };
            renderMembersList();
            renderSelected();
            // Guardar membres editats a _editMembers per a la següent desada
            contact._editMembers = groupMembers;
            // Quan es fa clic a guardar, s'agafarà el valor actual de _editMembers
        } else {
            groupMembersSection.style.display = 'none';
        }
        // Mostrar modal
        editContactModal.style.display = 'flex';
    }

    function closeEditContactModalFunc() {
        editContactModal.style.display = 'none';
    }

    // Guardar canvis d'edició de contacte/grup
    function handleSaveEditContact() {
        if (!currentChatId) return;
        const contacts = ChatManager.getContacts();
        const idx = contacts.findIndex(c => c.id === currentChatId);
        if (idx === -1) return;
        // Actualitzar dades
        contacts[idx].name = editContactName.value.trim() || contacts[idx].name;
        contacts[idx].role = editContactRole.value.trim() || contacts[idx].role;
        contacts[idx].avatar = editContactAvatar.value || contacts[idx].avatar;
        // Si és grup, guardar membres
        if (contacts[idx].role && contacts[idx].role.toLowerCase().includes('grup')) {
            // Guardar membres editats
            if (typeof contacts[idx]._editMembers !== 'undefined') {
                contacts[idx].members = contacts[idx]._editMembers.slice();
                delete contacts[idx]._editMembers;
            }
        }
        ChatManager.saveContacts(contacts);
        // Actualitzar UI
        openChat(currentChatId);
        loadConversations();
        closeEditContactModalFunc();
    }
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

    if (contact.role && contact.role.toLowerCase().includes('grup')) {
        // Mostrar membres del grup i el recompte
        let membersCount = 0;
        let memberNames = [];
        if (Array.isArray(contact.members)) {
            if (contact.members.length === 1 && typeof contact.members[0] === 'number') {
                membersCount = contact.members[0];
            } else {
                membersCount = contact.members.length;
                const allContacts = ChatManager.getContacts();
                memberNames = contact.members.map(id => {
                    const c = allContacts.find(x => x.id === id);
                    return c ? (c.avatar + ' ' + c.name) : '';
                }).filter(Boolean);
            }
        } else if (typeof contact.members === 'number') {
            membersCount = contact.members;
        }
        // Si no hi ha membres, buscar a defaultMockGroups pel cas mock
        if (membersCount <= 0) {
            if (typeof defaultMockGroups !== 'undefined') {
                const mock = defaultMockGroups.find(g => g.id === contact.id);
                if (mock && Array.isArray(mock.members) && mock.members.length === 1 && typeof mock.members[0] === 'number') {
                    membersCount = mock.members[0];
                } else if (mock && typeof mock.members === 'number') {
                    membersCount = mock.members;
                }
            }
        }
        if (membersCount > 0) {
            if (memberNames.length > 0) {
                chatStatus.textContent = `${membersCount} ${membersCount === 1 ? 'membre' : 'membres'}: ${memberNames.join(', ')}`;
            } else {
                chatStatus.textContent = `${membersCount} ${membersCount === 1 ? 'membre' : 'membres'}`;
            }
        } else {
            chatStatus.textContent = 'Sense membres';
        }
        chatStatus.classList.remove('online');
    } else if (contact.online) {
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
let lastGroupsFilter = '';
function openSearchGroupsModal() {
    if (!searchGroupsModal) return;
    searchGroupsModal.style.display = 'flex';
    if (groupSearchInput) groupSearchInput.value = '';
    lastGroupsFilter = '';
    loadMockGroups();
    if (groupSearchInput) {
        groupSearchInput.removeEventListener('input', handleGroupSearchInput);
        groupSearchInput.addEventListener('input', handleGroupSearchInput);
    }
}

function handleGroupSearchInput(e) {
    lastGroupsFilter = e.target.value.trim().toLowerCase();
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

    let groups = getSavedGroups();
    if (lastGroupsFilter) {
        groups = groups.filter(g => g.name && g.name.toLowerCase().includes(lastGroupsFilter));
    }

    if (groups.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.textAlign = 'center';
        emptyMsg.style.color = '#b71c34';
        emptyMsg.style.padding = '1.5rem 0';
        emptyMsg.textContent = 'No s\'ha trobat cap grup.';
        groupsList.appendChild(emptyMsg);
        return;
    }

    groups.forEach(g => {
        const item = document.createElement('div');
        item.className = 'group-item';
        item.dataset.groupId = g.id;
        let membersCount = 0;
        if (Array.isArray(g.members)) {
            // Si és array, pot ser d'IDs o d'un sol número (mal format)
            if (g.members.length === 1 && typeof g.members[0] === 'number') {
                membersCount = g.members[0];
            } else {
                membersCount = g.members.length;
            }
        } else if (typeof g.members === 'number') {
            membersCount = g.members;
        }
        item.innerHTML = `
            <div class="group-avatar">${g.avatar || '👥'}</div>
            <div class="group-info">
                <h4 style="color:#b71c34;font-weight:700;">${escapeHtml(g.name)}</h4>
                <div class="group-description" style="color:#b71c34;font-weight:500; margin-bottom:0.15rem; margin-top:0.1rem; opacity:0.85;">${escapeHtml(g.description || '')}</div>
                <div class="group-members-count" style="color:#b71c34;font-size:0.95em;opacity:0.7;">
                    ${membersCount} ${membersCount === 1 ? 'membre' : 'membres'}
                </div>
            </div>
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

    // També afegir-lo a la llista d'amics del calendari si no existeix
    try {
        const userFriends = UserDataManager.getFriends() || [];
        const already = userFriends.find(f => f.name && f.name.toLowerCase() === name.toLowerCase());
        if (!already) {
            // El model d'amic del calendari pot ser més simple, però afegim el mínim necessari
            const newFriend = {
                id: `friend-${Date.now()}`,
                name: name,
                createdAt: Date.now()
            };
            userFriends.push(newFriend);
            UserDataManager.addFriend(newFriend);
        }
    } catch (err) {
        console.error('No s\'ha pogut sincronitzar amb la llista d\'amics del calendari:', err);
    }

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
    const allContacts = ChatManager.getContacts();
    // Filter to show only friends (exclude groups)
    const friends = allContacts.filter(contact => contact.role !== 'Grup');
    contactsList.innerHTML = '';

    // Add "Add Friend" button at the top
    const addFriendBtn = document.createElement('div');
    addFriendBtn.className = 'contact-item add-friend-item';
    addFriendBtn.innerHTML = `
        <div class="contact-avatar add-friend-avatar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
        </div>
        <div class="contact-info">
            <h4>Afegir amic</h4>
            <p>Afegeix un nou contacte a la teva llista d'amics</p>
        </div>
    `;

    addFriendBtn.addEventListener('click', () => {
        closeNewChatModalFunc();
        openAddContactModal();
    });

    contactsList.appendChild(addFriendBtn);

    // Show message if no friends yet
    if (friends.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'empty-friends-message';
        emptyMsg.innerHTML = `
            <p style="text-align: center; color: #666; padding: 2rem 1rem;">
                Encara no tens amics afegits.<br>
                Clica a "Afegir amic" per començar!
            </p>
        `;
        contactsList.appendChild(emptyMsg);
        return;
    }

    // Add all friends to the list
    friends.forEach(contact => {
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
`;
document.head.appendChild(style);

// --- User menu & notification badge logic for xat.html ---
function updateNotificationBadgeXat() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;

    const notifications = (typeof UserDataManager !== 'undefined' && typeof UserDataManager.getNotifications === 'function')
        ? UserDataManager.getNotifications()
        : [];

    const unreadNotifications = notifications.filter(n => n.unread);
    const urgentNotifications = notifications.filter(n => n.priority === 'high' && n.unread);

    const unreadCount = unreadNotifications.length;
    const urgentCount = urgentNotifications.length;

    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'inline-block';
        badge.style.visibility = 'visible';
        badge.style.opacity = '1';

        if (urgentCount > 0) {
            badge.style.background = 'linear-gradient(135deg, #ff5252 0%, #d32f2f 100%)';
            badge.style.animation = 'pulse 2s ease-in-out infinite';
        } else {
            badge.style.background = '#d32f2f';
            badge.style.animation = 'none';
        }
    } else {
        badge.style.display = 'none';
    }
}

function setupUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const logoutBtn = document.getElementById('logoutBtn');
    const configMenuItem = document.getElementById('configMenuItem');
    const registerDonationBtn = document.getElementById('registerDonationBtn');

    if (!userMenuBtn || !dropdownMenu) return;

    // Set user name if available
    try {
        const nameEl = userMenuBtn.querySelector('.user-name');
        if (nameEl && typeof AuthManager !== 'undefined' && typeof AuthManager.getCurrentUserName === 'function') {
            nameEl.textContent = AuthManager.getCurrentUserName().toUpperCase();
        }
    } catch (e) {
        // ignore
    }

    userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('active');
        userMenuBtn.classList.toggle('active');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!userMenuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('active');
            userMenuBtn.classList.remove('active');
        }
    });

    // Prevent clicks inside menu from closing
    dropdownMenu.addEventListener('click', (e) => e.stopPropagation());

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Segur que vols tancar la sessió?')) {
                if (typeof AuthManager !== 'undefined' && typeof AuthManager.logout === 'function') {
                    AuthManager.logout();
                }
            }
        });
    }

    if (configMenuItem) {
        configMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'configuracio.html';
        });
    }

    if (registerDonationBtn) {
        registerDonationBtn.addEventListener('click', (e) => {
            // link already points to registrar-donacio.html, but ensure navigation
            e.preventDefault();
            window.location.href = 'registrar-donacio.html';
        });
    }

    // Hook notifications update events if available
    window.addEventListener('notificationsUpdated', updateNotificationBadgeXat);
    window.addEventListener('focus', updateNotificationBadgeXat);
    // Initial badge update
    setTimeout(updateNotificationBadgeXat, 10);
}

document.addEventListener('DOMContentLoaded', () => {
    setupUserMenu();
});
