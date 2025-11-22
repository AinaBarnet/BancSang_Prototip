/**
 * ThemeManager - Gestor global de temes (clar/fosc) per a l'aplicació BancSang
 * Gestiona l'aplicació automàtica del tema a totes les pàgines
 */

const ThemeManager = {
    // Obtenir el tema actual de l'usuari
    getCurrentTheme: function () {
        const userData = UserDataManager.getCurrentUserData();
        if (!userData || !userData.preferences) {
            return 'light'; // Per defecte tema clar
        }
        return userData.preferences.theme || 'light';
    },

    // Guardar el tema de l'usuari
    saveTheme: function (theme) {
        const userData = UserDataManager.getCurrentUserData();
        if (!userData) return false;

        userData.preferences.theme = theme;
        UserDataManager.saveCurrentUserData(userData);
        return true;
    },

    // Obtenir el tema efectiu (resolt si és 'auto')
    getEffectiveTheme: function (theme) {
        if (theme === 'auto') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme;
    },

    // Aplicar el tema a la pàgina
    applyTheme: function (theme) {
        const effectiveTheme = this.getEffectiveTheme(theme);
        document.body.setAttribute('data-theme', theme);
        document.body.setAttribute('data-effective-theme', effectiveTheme);

        if (effectiveTheme === 'dark') {
            this.applyDarkTheme();
        } else {
            this.applyLightTheme();
        }

        // Afegir transició suau
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    },

    // Aplicar tema fosc
    applyDarkTheme: function () {
        // Variables CSS globals
        document.documentElement.style.setProperty('--bg', '#1a1a1a');
        document.documentElement.style.setProperty('--bg-secondary', '#2d2d2d');
        document.documentElement.style.setProperty('--card', '#2d2d2d');
        document.documentElement.style.setProperty('--card-hover', '#3d3d3d');
        document.documentElement.style.setProperty('--text-primary', '#ffffff');
        document.documentElement.style.setProperty('--text-secondary', '#b0b0b0');
        document.documentElement.style.setProperty('--text-muted', '#808080');
        document.documentElement.style.setProperty('--border', '#404040');
        document.documentElement.style.setProperty('--border-light', '#333333');
        document.documentElement.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.5)');
        document.documentElement.style.setProperty('--primary', '#b71c34');
        document.documentElement.style.setProperty('--primary-dark', '#8e1628');
        document.documentElement.style.setProperty('--primary-light', '#d32f2f');

        // Body
        document.body.style.backgroundColor = '#1a1a1a';
        document.body.style.color = '#ffffff';
        document.body.style.background = 'linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%)';

        // Header
        const header = document.querySelector('header');
        if (header) {
            header.style.background = 'linear-gradient(135deg, #8e1628 0%, #b71c34 100%)';
            header.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.5)';
        }

        // Aplicar estils específics a elements comuns
        this.applyDarkStyles();
    },

    // Aplicar tema clar
    applyLightTheme: function () {
        // Variables CSS globals
        document.documentElement.style.setProperty('--bg', '#f6f6f6');
        document.documentElement.style.setProperty('--bg-secondary', '#ffffff');
        document.documentElement.style.setProperty('--card', '#ffffff');
        document.documentElement.style.setProperty('--card-hover', '#fafafa');
        document.documentElement.style.setProperty('--text-primary', '#333');
        document.documentElement.style.setProperty('--text-secondary', '#666');
        document.documentElement.style.setProperty('--text-muted', '#999');
        document.documentElement.style.setProperty('--border', '#e0e0e0');
        document.documentElement.style.setProperty('--border-light', '#f0f0f0');
        document.documentElement.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.15)');
        document.documentElement.style.setProperty('--primary', '#b71c34');
        document.documentElement.style.setProperty('--primary-dark', '#8e1628');
        document.documentElement.style.setProperty('--primary-light', '#d32f2f');

        // Body
        document.body.style.backgroundColor = '#f6f6f6';
        document.body.style.color = '#333';
        document.body.style.background = 'linear-gradient(135deg, #e8e8e8 0%, #f0f0f0 100%)';

        // Header
        const header = document.querySelector('header');
        if (header) {
            header.style.background = '#b71c34';
            header.style.boxShadow = '0 2px 12px rgba(139, 34, 59, 0.15)';
        }

        // Aplicar estils específics a elements comuns
        this.applyLightStyles();
    },

    // Aplicar estils específics de tema fosc
    applyDarkStyles: function () {
        const isDark = true;
        const bgColor = '#2d2d2d';
        const textColor = '#ffffff';
        const textSecondary = '#b0b0b0';
        const borderColor = '#404040';
        const hoverBg = '#3d3d3d';

        // Targetes i contenidors
        const cards = document.querySelectorAll('.config-section, .profile-card, .counter-container, .info-card, .prize-info, .notification-card, .message-card, .location-card, .group-item, .modal-container, .chat-header, .chat-message-list, .contact-item');
        cards.forEach(el => {
            el.style.backgroundColor = bgColor;
            el.style.color = textColor;
            el.style.borderColor = borderColor;
        });

        // Opcions de configuració
        const options = document.querySelectorAll('.config-option');
        options.forEach(el => {
            el.style.backgroundColor = hoverBg;
            el.style.borderColor = borderColor;
        });

        // Títols i text
        const titles = document.querySelectorAll('h1, h2, h3, h4, h5, h6, .option-title, .section-header h2, .prize-title, .location-content h5');
        titles.forEach(el => el.style.color = textColor);

        const descriptions = document.querySelectorAll('.option-description, .muted, .prize-description, p');
        descriptions.forEach(el => el.style.color = textSecondary);

        // Inputs, selects i textareas
        const inputs = document.querySelectorAll('input, select, textarea, .config-select');
        inputs.forEach(el => {
            if (el.type !== 'checkbox' && el.type !== 'radio') {
                el.style.backgroundColor = hoverBg;
                el.style.color = textColor;
                el.style.borderColor = borderColor;
            }
        });

        // Dropdown menus
        const dropdowns = document.querySelectorAll('.dropdown-menu, .submenu');
        dropdowns.forEach(el => {
            el.style.backgroundColor = bgColor;
            el.style.borderColor = borderColor;
        });

        const dropdownItems = document.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(el => {
            el.style.color = textColor;
            el.style.borderColor = borderColor;
        });

        // Calendari
        const calendarCells = document.querySelectorAll('.calendar-cell');
        calendarCells.forEach(el => {
            el.style.backgroundColor = bgColor;
            el.style.color = textColor;
        });

        // Xat
        const chatMessages = document.querySelectorAll('.message-bubble');
        chatMessages.forEach(el => {
            if (el.classList.contains('sent')) {
                el.style.backgroundColor = '#8e1628';
            } else {
                el.style.backgroundColor = hoverBg;
                el.style.color = textColor;
            }
        });

        // Prize info en tema fosc
        const prizeInfo = document.querySelector('.prize-info');
        if (prizeInfo && !prizeInfo.classList.contains('completed')) {
            prizeInfo.style.background = 'linear-gradient(135deg, #332200 0%, #4d3300 50%, #665500 100%)';
            prizeInfo.style.borderColor = '#998800';
        }
    },

    // Aplicar estils específics de tema clar
    applyLightStyles: function () {
        // Restaurar colors originals per als elements
        const cards = document.querySelectorAll('.config-section, .profile-card, .counter-container, .info-card, .notification-card, .message-card, .location-card, .group-item, .modal-container, .chat-header, .chat-message-list, .contact-item');
        cards.forEach(el => {
            el.style.backgroundColor = '';
            el.style.color = '';
            el.style.borderColor = '';
        });

        const options = document.querySelectorAll('.config-option');
        options.forEach(el => {
            el.style.backgroundColor = '';
            el.style.borderColor = '';
        });

        const titles = document.querySelectorAll('h1, h2, h3, h4, h5, h6, .option-title, .section-header h2, .prize-title, .location-content h5');
        titles.forEach(el => el.style.color = '');

        const descriptions = document.querySelectorAll('.option-description, .muted, .prize-description, p');
        descriptions.forEach(el => el.style.color = '');

        const inputs = document.querySelectorAll('input, select, textarea, .config-select');
        inputs.forEach(el => {
            el.style.backgroundColor = '';
            el.style.color = '';
            el.style.borderColor = '';
        });

        const dropdowns = document.querySelectorAll('.dropdown-menu, .submenu');
        dropdowns.forEach(el => {
            el.style.backgroundColor = '';
            el.style.borderColor = '';
        });

        const dropdownItems = document.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(el => {
            el.style.color = '';
            el.style.borderColor = '';
        });

        const calendarCells = document.querySelectorAll('.calendar-cell');
        calendarCells.forEach(el => {
            el.style.backgroundColor = '';
            el.style.color = '';
        });

        const chatMessages = document.querySelectorAll('.message-bubble');
        chatMessages.forEach(el => {
            el.style.backgroundColor = '';
            el.style.color = '';
        });

        const prizeInfo = document.querySelector('.prize-info');
        if (prizeInfo) {
            prizeInfo.style.background = '';
            prizeInfo.style.borderColor = '';
        }
    },

    // Inicialitzar el gestor de temes
    init: function () {
        // Aplicar el tema guardat
        const theme = this.getCurrentTheme();
        this.applyTheme(theme);

        // Escoltar canvis en la preferència del sistema (per al mode automàtic)
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            const currentTheme = this.getCurrentTheme();
            if (currentTheme === 'auto') {
                this.applyTheme('auto');
            }
        });

        // Re-aplicar el tema quan es carregui contingut dinàmic
        const observer = new MutationObserver(() => {
            const theme = this.getCurrentTheme();
            const effectiveTheme = this.getEffectiveTheme(theme);
            if (effectiveTheme === 'dark') {
                this.applyDarkStyles();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    },

    // Canviar el tema
    setTheme: function (theme) {
        this.saveTheme(theme);
        this.applyTheme(theme);
    }
};

// Auto-inicialitzar quan es carregui el DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
    ThemeManager.init();
}
