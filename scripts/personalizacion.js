// Datos ficticios iniciales
const defaultProfile = {
    name: 'Laura García',
    donations: 5,
    lastDonation: '10/12/2025',
    groups: [
        { name: "Grup de la Laura", joined: '02/03/2024' },
        { name: 'Voluntaris BCN', joined: '10/11/2024' },
        { name: 'Amics - Donacions', joined: '22/06/2025' }
    ]
};

function getProfile(){
    try{
        const raw = localStorage.getItem('profileData');
        if(!raw) return defaultProfile;
        return JSON.parse(raw);
    }catch(e){
        console.error('Error parsing profile data', e);
        return defaultProfile;
    }
}

function saveProfile(profile){
    localStorage.setItem('profileData', JSON.stringify(profile));
}

function renderProfile(){
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
        id: `chat-${idx+1}`,
        name: g.name,
        joined: g.joined,
        messages: [
            { sender: 'system', text: `Benvingut a ${g.name}`, time: '10:00' },
            { sender: p.name, text: 'Hola a tothom!', time: '10:02' }
        ]
    }));
    try{
        // Build contacts and conversations in the structure expected by ChatManager
        const CONTACTS_KEY = 'bancSang_chat_contacts';
        const CONV_KEY = 'bancSang_chat';

        // Load existing
        const existingContactsRaw = localStorage.getItem(CONTACTS_KEY);
        const existingConvsRaw = localStorage.getItem(CONV_KEY);
        let existingContacts = existingContactsRaw ? JSON.parse(existingContactsRaw) : [];
        let existingConvs = existingConvsRaw ? JSON.parse(existingConvsRaw) : {};

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

        // Save merged data back to localStorage
        localStorage.setItem(CONTACTS_KEY, JSON.stringify(existingContacts));
        localStorage.setItem(CONV_KEY, JSON.stringify(existingConvs));
    }catch(e){console.error(e)}

    // Render the groups list with links to xat using contactId param
    mockChats.forEach(ch =>{
        const li = document.createElement('li');
        li.className = 'group-item';
        li.innerHTML = `<a class="group-link" href="xat.html?contactId=${encodeURIComponent(ch.id)}"><div class=\"group-name\">${escapeHtml(ch.name)}</div><div class=\"group-date\">${escapeHtml(ch.joined)}</div></a>`;
        ul.appendChild(li);
    });

    const avatar = document.querySelector('.profile-avatar');
    if(avatar) avatar.textContent = (p.name || 'U').trim()[0].toUpperCase();
}

function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(m){
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[m];
    });
}

document.addEventListener('DOMContentLoaded', ()=>{
    renderProfile();

    document.getElementById('saveName').addEventListener('click', ()=>{
        const name = document.getElementById('nameInput').value.trim();
        if(!name) return alert('Introdueix un nom vàlid');
        const p = getProfile();
        p.name = name;
        saveProfile(p);
        renderProfile();
    });

    document.getElementById('resetName').addEventListener('click', ()=>{
        localStorage.removeItem('profileData');
        renderProfile();
    });
});
