// Protegir la pàgina - requerir autenticació
if (!AuthManager.requireAuth()) {
    throw new Error('Accés no autoritzat');
}

// Inicialització
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    loadPreferences();
    setupEventListeners();
});

// Carregar informació del perfil de l'usuari
function loadUserProfile() {
    const userData = UserDataManager.getCurrentUserData();
    const session = AuthManager.getCurrentSession();

    if (!userData || !session) {
        console.error('No s\'han pogut carregar les dades de l\'usuari');
        return;
    }

    // Actualitzar informació del perfil al header
    const headerUserName = document.getElementById('headerUserName');
    const userName = userData.profile.name || session.email.split('@')[0];
    headerUserName.textContent = userName.split(' ')[0] || userName;

    // Actualitzar informació del perfil a la secció
    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileDonations = document.getElementById('profileDonations');
    const profileLastDonation = document.getElementById('profileLastDonation');

    const firstLetter = (userName || 'U').trim()[0].toUpperCase();
    profileAvatar.textContent = firstLetter;
    profileName.textContent = userName;
    profileEmail.textContent = session.email;
    profileDonations.textContent = userData.profile.donations || 0;
    profileLastDonation.textContent = userData.profile.lastDonation || 'Mai';
}

// Carregar preferències de l'usuari
function loadPreferences() {
    const userData = UserDataManager.getCurrentUserData();

    if (!userData) return;

    // Preferències de notificacions
    const notifPrefs = userData.notifications.preferences || {};
    document.getElementById('notificationsEnabled').checked = userData.preferences.notificationsEnabled !== false;
    document.getElementById('notifEvents').checked = notifPrefs.enableEvents !== false;
    document.getElementById('notifReminders').checked = notifPrefs.enableReminders !== false;
    document.getElementById('notifAchievements').checked = notifPrefs.enableAchievements !== false;
    document.getElementById('notifInfo').checked = notifPrefs.enableInfo !== false;

    // Preferències d'idioma
    document.getElementById('languageSelect').value = userData.preferences.language || 'ca';

    // Preferències de privacitat
    document.getElementById('publicProfile').checked = userData.preferences.publicProfile !== false;
    document.getElementById('showStats').checked = userData.preferences.showStats !== false;

    // Preferències generals
    document.getElementById('themeSelect').value = userData.preferences.theme || 'light';
    document.getElementById('showTutorials').checked = userData.preferences.showTutorials !== false;
}

// Configurar event listeners
function setupEventListeners() {
    // Notificacions
    document.getElementById('notificationsEnabled').addEventListener('change', (e) => {
        savePreference('notificationsEnabled', e.target.checked);

        if (e.target.checked) {
            modalManager.success('Notificacions activades correctament', '✓ Activades');
        } else {
            modalManager.alert('Notificacions desactivades. No rebràs avisos.', '🔕 Desactivades');
        }
    });

    document.getElementById('notifEvents').addEventListener('change', (e) => {
        saveNotificationPreference('enableEvents', e.target.checked);
    });

    document.getElementById('notifReminders').addEventListener('change', (e) => {
        saveNotificationPreference('enableReminders', e.target.checked);
    });

    document.getElementById('notifAchievements').addEventListener('change', (e) => {
        saveNotificationPreference('enableAchievements', e.target.checked);
    });

    document.getElementById('notifInfo').addEventListener('change', (e) => {
        saveNotificationPreference('enableInfo', e.target.checked);
    });

    // Idioma
    document.getElementById('languageSelect').addEventListener('change', (e) => {
        savePreference('language', e.target.value);
        modalManager.success('Idioma canviat correctament. Recàrrega la pàgina per aplicar els canvis.', '🌐 Idioma actualitzat');
    });

    // Privacitat
    document.getElementById('publicProfile').addEventListener('change', (e) => {
        savePreference('publicProfile', e.target.checked);

        if (e.target.checked) {
            modalManager.success('El teu perfil ara és públic', '👁️ Perfil públic');
        } else {
            modalManager.success('El teu perfil ara és privat', '🔒 Perfil privat');
        }
    });

    document.getElementById('showStats').addEventListener('change', (e) => {
        savePreference('showStats', e.target.checked);
    });

    // Tema
    document.getElementById('themeSelect').addEventListener('change', (e) => {
        savePreference('theme', e.target.value);
        applyTheme(e.target.value);
        modalManager.success('Tema aplicat correctament', '🎨 Tema canviat');
    });

    // Tutorials
    document.getElementById('showTutorials').addEventListener('change', (e) => {
        savePreference('showTutorials', e.target.checked);
    });

    // Botons
    document.getElementById('changePasswordBtn').addEventListener('click', handleChangePassword);
    document.getElementById('aboutBtn').addEventListener('click', handleAbout);
    document.getElementById('helpBtn').addEventListener('click', handleHelp);
    document.getElementById('termsBtn').addEventListener('click', handleTerms);
    document.getElementById('privacyBtn').addEventListener('click', handlePrivacy);
    document.getElementById('deleteAccountBtn').addEventListener('click', handleDeleteAccount);
}

// Guardar preferència general
function savePreference(key, value) {
    const userData = UserDataManager.getCurrentUserData();
    if (!userData) return;

    userData.preferences[key] = value;
    UserDataManager.saveCurrentUserData(userData);
}

// Guardar preferència de notificació
function saveNotificationPreference(key, value) {
    const userData = UserDataManager.getCurrentUserData();
    if (!userData) return;

    userData.notifications.preferences[key] = value;
    UserDataManager.saveCurrentUserData(userData);
}

// Aplicar tema
function applyTheme(theme) {
    // Aquesta funcionalitat es pot ampliar en el futur
    document.body.setAttribute('data-theme', theme);

    if (theme === 'dark') {
        document.body.style.backgroundColor = '#1a1a1a';
        document.body.style.color = '#ffffff';
    } else {
        document.body.style.backgroundColor = '#f6f6f6';
        document.body.style.color = '#333333';
    }
}

// Gestors d'esdeveniments per als botons

function handleChangePassword() {
    modalManager.alert(
        'Per canviar la contrasenya, contacta amb el suport tècnic o utilitza l\'opció "He oblidat la contrasenya" a la pàgina d\'inici de sessió.',
        '🔐 Canviar contrasenya'
    );
}

function handleAbout() {
    const version = '1.0.0';
    const year = new Date().getFullYear();

    modalManager.alert(
        `BancSang - Aplicació de gestió de donacions de sang\n\n` +
        `Versió: ${version}\n` +
        `© ${year} Banc de Sang i Teixits\n\n` +
        `Aquesta aplicació permet gestionar les teves donacions de sang, trobar centres de donació propers, ` +
        `rebre notificacions i participar en sortejos mensuals.\n\n` +
        `Gràcies per salvar vides! 🩸`,
        'ℹ️ Sobre l\'aplicació'
    );
}

function handleHelp() {
    modalManager.alert(
        'Centre d\'ajuda\n\n' +
        '📱 Utilitzar l\'aplicació:\n' +
        '• Consulta el calendari per veure les teves cites\n' +
        '• Registra donacions des del menú principal\n' +
        '• Troba centres de donació propers\n\n' +
        '🔔 Notificacions:\n' +
        '• Configura les teves preferències aquí\n' +
        '• Gestiona les notificacions des del menú\n\n' +
        '📧 Contacte:\n' +
        '• Email: suport@bancsang.cat\n' +
        '• Telèfon: 900 123 456\n\n' +
        '(En desenvolupament)',
        '❓ Centre d\'ajuda'
    );
}

function handleTerms() {
    modalManager.alert(
        'Termes i condicions\n\n' +
        '1. Ús de l\'aplicació:\n' +
        '• L\'aplicació és d\'ús gratuït per a donants de sang\n' +
        '• Les dades són confidencials i protegides\n\n' +
        '2. Responsabilitats:\n' +
        '• Mantenir la informació actualitzada\n' +
        '• Complir amb els requisits mèdics per donar sang\n\n' +
        '3. Privacitat:\n' +
        '• Les teves dades no es compartiran amb tercers\n' +
        '• Pots eliminar el teu compte en qualsevol moment\n\n' +
        '(Text complet disponible a www.bancsang.cat/termes)',
        '📄 Termes i condicions'
    );
}

function handlePrivacy() {
    modalManager.alert(
        'Política de privacitat\n\n' +
        '🔒 Protecció de dades:\n' +
        '• Les teves dades estan encriptades i protegides\n' +
        '• Complim amb el RGPD europeu\n\n' +
        '📊 Dades recollides:\n' +
        '• Nom i email (obligatoris)\n' +
        '• Historial de donacions (opcional)\n' +
        '• Preferències de notificacions\n\n' +
        '👁️ Ús de les dades:\n' +
        '• Gestió de cites i donacions\n' +
        '• Enviament de notificacions\n' +
        '• Millora del servei\n\n' +
        '✅ Drets:\n' +
        '• Accés, rectificació i supressió de dades\n' +
        '• Portabilitat de dades\n\n' +
        '(Text complet disponible a www.bancsang.cat/privacitat)',
        '🔐 Política de privacitat'
    );
}

function handleDeleteAccount() {
    modalManager.confirm(
        'Estàs segur que vols eliminar el teu compte?\n\n' +
        '⚠️ ATENCIÓ:\n' +
        '• Perdràs tot l\'historial de donacions\n' +
        '• S\'eliminaran totes les teves dades\n' +
        '• Aquesta acció no es pot desfer\n\n' +
        'Si estàs segur, contacta amb suport@bancsang.cat per confirmar l\'eliminació.',
        (confirmed) => {
            if (confirmed) {
                modalManager.alert(
                    'Per eliminar el teu compte, si us plau contacta amb:\n\n' +
                    '📧 Email: suport@bancsang.cat\n' +
                    '📞 Telèfon: 900 123 456\n\n' +
                    'Necessitarem verificar la teva identitat abans de procedir amb l\'eliminació.',
                    '⚠️ Eliminar compte'
                );
            }
        },
        '🗑️ Eliminar compte'
    );
}
