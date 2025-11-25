// ---

function renderProfile() {
    const user = UserDataManager.getCurrentUserData();
    if (!user) return;
    const profile = user.profile || {};
    // Amics (chats.contacts)
    const friendsList = document.getElementById('friendsList');
    if (friendsList) {
        const contacts = (user.chats && Array.isArray(user.chats.contacts)) ? user.chats.contacts : [];
        friendsList.innerHTML = '';
        if (contacts.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Encara no tens cap amic.';
            friendsList.appendChild(li);
        } else {
            contacts.forEach((friend, idx) => {
                const li = document.createElement('li');
                li.innerHTML = '👤 ' + (friend.name || friend.email || friend.id || 'Amic');
                // Afegir botó per eliminar amic
                const removeBtn = document.createElement('button');
                removeBtn.textContent = '✖';
                removeBtn.className = 'remove-friend-btn';
                removeBtn.title = 'Elimina amic';
                removeBtn.onclick = function() {
                    contacts.splice(idx, 1);
                    user.chats.contacts = contacts;
                    UserDataManager.saveCurrentUserData(user);
                    renderProfile();
                };
                li.appendChild(removeBtn);
                friendsList.appendChild(li);
            });
        }
    }
    // Achievements
    const achievementsList = document.getElementById('achievementsList');
    if (achievementsList) {
        const achievements = (user.achievements && Array.isArray(user.achievements.unlocked)) ? user.achievements.unlocked : [];
        achievementsList.innerHTML = '';
        if (achievements.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Encara no tens cap assoliment.';
            achievementsList.appendChild(li);
        } else {
            achievements.forEach(a => {
                const li = document.createElement('li');
                li.innerHTML = '🏆 ' + a;
                achievementsList.appendChild(li);
            });
        }
    }
    // Carrega el nom del localStorage
    const name = profile.name || '';
    document.getElementById('displayName').textContent = name || '—';
    document.getElementById('nameInput').value = name;
    // Avatar
    const avatar = document.querySelector('.profile-avatar');
    if (avatar) {
        let firstLetter = 'U';
        if (name && typeof name === 'string') {
            const match = name.trim().match(/[A-Za-zÀ-ÿ]/);
            if (match) firstLetter = match[0].toUpperCase();
        }
        avatar.textContent = firstLetter;
    }
    // Email
    const email = profile.email || '—';
    const emailEl = document.getElementById('profileEmail');
    if (emailEl) emailEl.textContent = email;
    // Donacions totals
    const donations = user.donations && typeof user.donations.totalCount === 'number' ? user.donations.totalCount : (user.donations && user.donations.list ? user.donations.list.length : '—');
    const donationsEl = document.getElementById('profileDonations');
    if (donationsEl) donationsEl.textContent = donations !== undefined ? donations : '—';
    // Última donació
    let lastDonation = '—';
    if (user.donations && user.donations.lastDonationDate) {
        const d = new Date(user.donations.lastDonationDate);
        if (!isNaN(d)) lastDonation = d.toLocaleDateString('ca-ES');
    } else if (user.donations && user.donations.list && user.donations.list.length > 0) {
        const d = new Date(user.donations.list[0].date || user.donations.list[0].timestamp);
        if (!isNaN(d)) lastDonation = d.toLocaleDateString('ca-ES');
    }
    const lastDonationEl = document.getElementById('profileLastDonation');
    if (lastDonationEl) lastDonationEl.textContent = lastDonation;
}


document.addEventListener('DOMContentLoaded', () => {
    if (!AuthManager.requireAuth()) return;
    renderProfile();
    // Formulari per afegir amics
    const addFriendForm = document.getElementById('addFriendForm');
    if (addFriendForm) {
        addFriendForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('friendName').value.trim();
            const email = document.getElementById('friendEmail').value.trim();
            if (!name && !email) {
                document.getElementById('friendName').classList.add('input-error');
                setTimeout(() => document.getElementById('friendName').classList.remove('input-error'), 1200);
                return;
            }
            const userData = UserDataManager.getCurrentUserData();
            if (!userData.chats) userData.chats = { contacts: [], conversations: {} };
            if (!Array.isArray(userData.chats.contacts)) userData.chats.contacts = [];
            userData.chats.contacts.push({
                name: name || undefined,
                email: email || undefined,
                id: Date.now()
            });
            UserDataManager.saveCurrentUserData(userData);
            document.getElementById('friendName').value = '';
            document.getElementById('friendEmail').value = '';
            renderProfile();
        });
    }
    // Botó DESAR nom
    document.getElementById('saveName').addEventListener('click', () => {
        const nameInput = document.getElementById('nameInput');
        const name = nameInput.value.trim();
        if (!name) {
            nameInput.classList.add('input-error');
            setTimeout(() => nameInput.classList.remove('input-error'), 1200);
            return;
        }
        // Guarda el nom a localStorage (banc_sang_user_data.profile.name)
        const userData = UserDataManager.getCurrentUserData();
        userData.profile.name = name;
        UserDataManager.saveCurrentUserData(userData);
        // Actualitzar també el nom a l'autenticació
        const session = AuthManager.getCurrentSession();
        if (session) {
            session.name = name;
            localStorage.setItem('banc_sang_session', JSON.stringify(session));
        }
        renderProfile();
    });
    document.getElementById('resetName').addEventListener('click', () => {
        const session = AuthManager.getCurrentSession();
        if (session) {
            const userData = UserDataManager.getCurrentUserData();
            userData.profile.name = session.email.split('@')[0];
            UserDataManager.saveCurrentUserData(userData);
            renderProfile();
        }
    });
    // Refresca la vista si hi ha canvis a localStorage
    window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith('banc_sang_user_data')) {
            renderProfile();
        }
    });
});
