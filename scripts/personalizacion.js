// Obtenir perfil de l'usuari actual
function getProfile() {
    const userData = UserDataManager.getCurrentUserData();
    if (!userData) {
        console.error('No s\'han pogut obtenir les dades de l\'usuari');
        return {
            name: '',
            donations: 0,
            lastDonation: '',
            groups: []
        };
    }

    return {
        name: userData.profile.name || '',
        donations: userData.profile.donations || 0,
        lastDonation: userData.profile.lastDonation || '',
        groups: userData.profile.groups || []
    };
}

function saveProfile(profile) {
    UserDataManager.updateCurrentUserProfile(profile);
}

function renderProfile() {
    const p = getProfile();
    document.getElementById('displayName').textContent = p.name;
    document.getElementById('headerUserName').textContent = p.name.split(' ')[0] || p.name;
    document.getElementById('donationCount').textContent = p.donations;
    document.getElementById('lastDonation').textContent = p.lastDonation;
    document.getElementById('nameInput').value = p.name;

    const ul = document.getElementById('groupsList');
    ul.innerHTML = '';
    // Prepare mock chats to sync with xat page
    const mockChats = p.groups.map((g, idx) => ({
        id: `chat-${idx + 1}`,
        name: g.name,
        joined: g.joined,
        messages: [
            { sender: 'system', text: `Benvingut a ${g.name}`, time: '10:00' },
            { sender: p.name, text: 'Hola a tothom!', time: '10:02' }
        ]
    }));
    try {
        // Build contacts and conversations in the structure expected by ChatManager
        // Load existing from UserDataManager
        let existingContacts = UserDataManager.getChatContacts();
        let existingConvs = UserDataManager.getChatConversations();

        mockChats.forEach((ch, idx) => {
            const contactId = ch.id; // e.g. chat-1

            // Add contact if not exists
            if (!existingContacts.find(c => c.id === contactId)) {
                existingContacts.push({
                    id: contactId,
                    name: ch.name,
                    avatar: (ch.name || 'U').trim()[0].toUpperCase(),
                    role: 'Grup',
                    online: false,
                    lastSeen: null
                });
            }

            // Add conversation if not exists
            if (!existingConvs[contactId]) {
                // map messages to ChatManager format
                const now = Date.now();
                const msgs = (ch.messages || []).map((m, mi) => {
                    const sender = (m.sender === p.name || m.sender === 'me') ? 'me' : contactId;
                    return {
                        id: `msg-${contactId}-${mi}-${Date.now()}`,
                        text: m.text || m.message || '',
                        sender: sender,
                        timestamp: now - ((ch.messages.length - mi) * 60000),
                        read: sender === 'me',
                        sent: true
                    };
                });

                existingConvs[contactId] = msgs;
            }
        });

        // Save merged data back to UserDataManager
        UserDataManager.saveChatContacts(existingContacts);
        UserDataManager.saveChatConversations(existingConvs);
    } catch (e) { console.error(e) }

    // Render the groups list with links to xat using contactId param
    mockChats.forEach(ch => {
        const li = document.createElement('li');
        li.className = 'group-item';
        li.innerHTML = `<a class="group-link" href="xat.html?contactId=${encodeURIComponent(ch.id)}"><div class=\"group-name\">${escapeHtml(ch.name)}</div><div class=\"group-date\">${escapeHtml(ch.joined)}</div></a>`;
        ul.appendChild(li);
    });

    const avatar = document.querySelector('.profile-avatar');
    if (avatar) avatar.textContent = (p.name || 'U').trim()[0].toUpperCase();
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": "&#39;" })[m];
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Protegir la pàgina
    if (!AuthManager.requireAuth()) {
        return;
    }

    renderProfile();

    document.getElementById('saveName').addEventListener('click', () => {
        const name = document.getElementById('nameInput').value.trim();
        if (!name) return modalManager.warning('Si us plau, introdueix un nom vàlid.', '⚠️ Nom buit');
        const p = getProfile();
        p.name = name;
        saveProfile(p);

        // Actualitzar també el nom a l'autenticació
        const session = AuthManager.getCurrentSession();
        if (session) {
            session.name = name;
            localStorage.setItem('banc_sang_session', JSON.stringify(session));
        }

        renderProfile();
    });

    document.getElementById('resetName').addEventListener('click', () => {
        // En lloc d'eliminar, restaurar al nom de registre
        const session = AuthManager.getCurrentSession();
        if (session) {
            const userData = UserDataManager.getCurrentUserData();
            userData.profile.name = session.email.split('@')[0];
            UserDataManager.saveCurrentUserData(userData);
            renderProfile();
        }
    });
});
