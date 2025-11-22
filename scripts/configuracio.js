// Protegir la pàgina - requerir autenticació
if (!AuthManager.requireAuth()) {
    throw new Error('Accés no autoritzat');
}

// Inicialització
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    loadPreferences();
    setupEventListeners();

    // Aplicar el tema guardat a l'inici
    const userData = UserDataManager.getCurrentUserData();
    if (userData && userData.preferences.theme) {
        applyTheme(userData.preferences.theme);
    }

    // Escoltar canvis en la preferència del sistema per al mode automàtic
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const userData = UserDataManager.getCurrentUserData();
        if (userData && userData.preferences.theme === 'auto') {
            applyTheme('auto');
        }
    });
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
}

// Configurar event listeners
function setupEventListeners() {
    // Notificacions
    document.getElementById('notificationsEnabled').addEventListener('change', (e) => {
        savePreference('notificationsEnabled', e.target.checked);
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
    });

    // Privacitat
    document.getElementById('publicProfile').addEventListener('change', (e) => {
        savePreference('publicProfile', e.target.checked);
    });

    document.getElementById('showStats').addEventListener('change', (e) => {
        savePreference('showStats', e.target.checked);
    });

    // Tema
    document.getElementById('themeSelect').addEventListener('change', (e) => {
        savePreference('theme', e.target.value);
        applyTheme(e.target.value);
    });

    // Botons
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');

    if (changePasswordBtn) {
        console.log('Botó canviar contrasenya trobat, afegint event listener');
        changePasswordBtn.addEventListener('click', handleChangePassword);
    } else {
        console.error('No s\'ha trobat el botó changePasswordBtn');
    }

    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', handleDeleteAccount);
    } else {
        console.error('No s\'ha trobat el botó deleteAccountBtn');
    }
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
    document.body.setAttribute('data-theme', theme);

    // Obtenir el tema efectiu (si és automàtic, detectar preferència del sistema)
    let effectiveTheme = theme;
    if (theme === 'auto') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    if (effectiveTheme === 'dark') {
        // Tema fosc
        document.documentElement.style.setProperty('--bg', '#1a1a1a');
        document.documentElement.style.setProperty('--card', '#2d2d2d');
        document.documentElement.style.setProperty('--text-primary', '#ffffff');
        document.documentElement.style.setProperty('--text-secondary', '#b0b0b0');
        document.documentElement.style.setProperty('--text-muted', '#808080');
        document.documentElement.style.setProperty('--border', '#404040');

        // Aplicar estils al body i elements principals
        document.body.style.backgroundColor = '#1a1a1a';
        document.body.style.color = '#ffffff';

        // Actualitzar header
        const header = document.querySelector('header');
        if (header) {
            header.style.background = 'linear-gradient(135deg, #8e1628 0%, #b71c34 100%)';
        }

        // Actualitzar seccions de configuració
        const sections = document.querySelectorAll('.config-section');
        sections.forEach(section => {
            section.style.backgroundColor = '#2d2d2d';
            section.style.color = '#ffffff';
        });

        // Actualitzar opcions
        const options = document.querySelectorAll('.config-option');
        options.forEach(option => {
            option.style.backgroundColor = '#3d3d3d';
        });

        // Actualitzar títols
        const titles = document.querySelectorAll('.option-title, .section-header h2');
        titles.forEach(title => {
            title.style.color = '#ffffff';
        });

        // Actualitzar descripcions
        const descriptions = document.querySelectorAll('.option-description');
        descriptions.forEach(desc => {
            desc.style.color = '#b0b0b0';
        });

        // Actualitzar inputs i selects
        const inputs = document.querySelectorAll('.config-select');
        inputs.forEach(input => {
            input.style.backgroundColor = '#3d3d3d';
            input.style.color = '#ffffff';
            input.style.borderColor = '#404040';
        });

    } else {
        // Tema clar (per defecte)
        document.documentElement.style.setProperty('--bg', '#f6f6f6');
        document.documentElement.style.setProperty('--card', '#ffffff');
        document.documentElement.style.setProperty('--text-primary', '#333');
        document.documentElement.style.setProperty('--text-secondary', '#666');
        document.documentElement.style.setProperty('--text-muted', '#999');
        document.documentElement.style.setProperty('--border', '#e0e0e0');

        // Restaurar estils originals
        document.body.style.backgroundColor = '#f6f6f6';
        document.body.style.color = '#333';

        // Restaurar header
        const header = document.querySelector('header');
        if (header) {
            header.style.background = 'linear-gradient(135deg, #b71c34 0%, #d32f2f 100%)';
        }

        // Restaurar seccions
        const sections = document.querySelectorAll('.config-section');
        sections.forEach(section => {
            section.style.backgroundColor = '#ffffff';
            section.style.color = '#333';
        });

        // Restaurar opcions
        const options = document.querySelectorAll('.config-option');
        options.forEach(option => {
            option.style.backgroundColor = '#fafafa';
        });

        // Restaurar títols
        const titles = document.querySelectorAll('.option-title, .section-header h2');
        titles.forEach(title => {
            title.style.color = '#333';
        });

        // Restaurar descripcions
        const descriptions = document.querySelectorAll('.option-description');
        descriptions.forEach(desc => {
            desc.style.color = '#666';
        });

        // Restaurar inputs i selects
        const inputs = document.querySelectorAll('.config-select');
        inputs.forEach(input => {
            input.style.backgroundColor = 'white';
            input.style.color = '#333';
            input.style.borderColor = '#e0e0e0';
        });
    }

    // Afegir transicions suaus
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
}

// Gestors d'esdeveniments per als botons

function handleChangePassword() {
    // Crear formulari de canvi de contrasenya
    const formHTML = `
        <div style="text-align: left; padding: 1.75rem 1.75rem 1rem;">
            <div style="margin-bottom: 1.25rem;">
                <label style="display: block; font-weight: 600; margin-bottom: 0.6rem; color: #333; font-size: 0.95rem;">Contrasenya actual:</label>
                <input type="password" id="currentPassword" style="width: 100%; padding: 0.9rem 1rem; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 0.95rem; transition: border-color 0.2s;" placeholder="Introdueix la contrasenya actual">
            </div>
            <div style="margin-bottom: 1.25rem;">
                <label style="display: block; font-weight: 600; margin-bottom: 0.6rem; color: #333; font-size: 0.95rem;">Nova contrasenya:</label>
                <input type="password" id="newPassword" style="width: 100%; padding: 0.9rem 1rem; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 0.95rem; transition: border-color 0.2s;" placeholder="Mínim 6 caràcters">
            </div>
            <div style="margin-bottom: 1.25rem;">
                <label style="display: block; font-weight: 600; margin-bottom: 0.6rem; color: #333; font-size: 0.95rem;">Confirmar nova contrasenya:</label>
                <input type="password" id="confirmPassword" style="width: 100%; padding: 0.9rem 1rem; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 0.95rem; transition: border-color 0.2s;" placeholder="Repeteix la nova contrasenya">
            </div>
            <div id="passwordError" style="color: #d32f2f; font-size: 0.9rem; font-weight: 600; margin-top: 0.5rem; display: none; padding: 0.75rem; background: #ffe8e8; border-radius: 8px; border-left: 4px solid #d32f2f;"></div>
        </div>
    `;

    modalManager.custom(formHTML, 'Canviar contrasenya', [
        {
            text: 'Acceptar',
            class: 'primary',
            action: () => {
                const currentPassword = document.getElementById('currentPassword').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                const errorDiv = document.getElementById('passwordError');

                // Validacions
                if (!currentPassword || !newPassword || !confirmPassword) {
                    errorDiv.textContent = '⚠️ Si us plau, omple tots els camps';
                    errorDiv.style.display = 'block';
                    return false; // No tancar el modal
                }

                if (newPassword !== confirmPassword) {
                    errorDiv.textContent = '⚠️ Les contrasenyes noves no coincideixen';
                    errorDiv.style.display = 'block';
                    return false;
                }

                if (newPassword.length < 6) {
                    errorDiv.textContent = '⚠️ La contrasenya ha de tenir almenys 6 caràcters';
                    errorDiv.style.display = 'block';
                    return false;
                }

                // Intentar canviar la contrasenya
                const result = AuthManager.changePassword(currentPassword, newPassword);

                if (result.success) {
                    modalManager.success('La teva contrasenya s\'ha canviat correctament', 'Contrasenya actualitzada');
                    return true; // Tancar el modal
                } else {
                    errorDiv.textContent = result.message;
                    errorDiv.style.display = 'block';
                    return false;
                }
            }
        },
        {
            text: 'Cancel·lar',
            class: 'secondary',
            action: () => { }
        }
    ]);

    // Afegir focus i estils als inputs
    setTimeout(() => {
        const inputs = document.querySelectorAll('#currentPassword, #newPassword, #confirmPassword');
        inputs.forEach(input => {
            input.addEventListener('focus', function () {
                this.style.borderColor = '#b71c34';
            });
            input.addEventListener('blur', function () {
                this.style.borderColor = '#e0e0e0';
            });
        });
    }, 100);
}

function handleDeleteAccount() {
    // Primera confirmació
    modalManager.confirm(
        'Vols eliminar el teu compte de Banc de Sang?\n\n' +
        'ATENCIÓ: Aquesta acció és irreversible\n\n' +
        '• Es perdrà tot l\'historial de donacions\n' +
        '• S\'eliminaran les teves dades personals\n' +
        '• No podràs recuperar el teu compte\n' +
        '• Perdràs els teus assoliments i punts\n\n' +
        'Vols continuar amb l\'eliminació?',
        () => {
            // Quan l'usuari prem Acceptar, eliminar immediatament
            const result = AuthManager.deleteAccount();

            if (result.success) {
                // Assegurar-se que la sessió està completament eliminada
                localStorage.removeItem('banc_sang_session');

                // Redirigir immediatament a la pàgina d'inici sense mostrar cap més modal
                window.location.replace('index.html');
            } else {
                // Si hi ha error, mostrar-lo
                modalManager.error(
                    result.message || 'Error en eliminar el compte',
                    'Error'
                );
            }
        },
        'Eliminar compte'
    );
}
