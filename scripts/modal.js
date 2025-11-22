// Sistema de modals personalitzats per substituir alerts
class ModalManager {
    constructor() {
        this.modalContainer = null;
        this.init();
    }

    init() {
        // Crear el contenidor del modal si no existeix
        if (!document.getElementById('customModalContainer')) {
            const container = document.createElement('div');
            container.id = 'customModalContainer';
            document.body.appendChild(container);
            this.modalContainer = container;
        } else {
            this.modalContainer = document.getElementById('customModalContainer');
        }
    }

    show(options) {
        const {
            title = '',
            message = '',
            icon = '',
            type = 'info', // info, success, warning, error
            confirmText = 'Acceptar',
            cancelText = null,
            onConfirm = null,
            onCancel = null
        } = options;

        return new Promise((resolve) => {
            // Crear el modal
            const modal = document.createElement('div');
            modal.className = 'custom-modal-overlay';

            const iconHtml = icon ? `<div class="custom-modal-icon ${type}">${icon}</div>` : '';

            const cancelButton = cancelText ?
                `<button class="custom-modal-btn custom-modal-btn-cancel">${cancelText}</button>` : '';

            modal.innerHTML = `
                <div class="custom-modal">
                    ${iconHtml}
                    ${title ? `<h3 class="custom-modal-title">${title}</h3>` : ''}
                    <div class="custom-modal-message">${message}</div>
                    <div class="custom-modal-buttons">
                        ${cancelButton}
                        <button class="custom-modal-btn custom-modal-btn-confirm">${confirmText}</button>
                    </div>
                </div>
            `;

            this.modalContainer.appendChild(modal);

            // Animar l'entrada
            setTimeout(() => modal.classList.add('show'), 10);

            // Manejadors d'esdeveniments
            const confirmBtn = modal.querySelector('.custom-modal-btn-confirm');
            const cancelBtn = modal.querySelector('.custom-modal-btn-cancel');

            const closeModal = (result) => {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.remove();
                    resolve(result);
                }, 300);
            };

            confirmBtn.addEventListener('click', () => {
                if (onConfirm) onConfirm();
                closeModal(true);
            });

            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    if (onCancel) onCancel();
                    closeModal(false);
                });
            }

            // Tancar amb ESC
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    closeModal(false);
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
        });
    }

    // Mètodes de conveniència
    alert(message, title = '') {
        return this.show({
            title,
            message,
            type: 'info'
        });
    }

    success(message, title = 'Èxit') {
        return this.show({
            title,
            message,
            type: 'success'
        });
    }

    error(message, title = 'Error') {
        return this.show({
            title,
            message,
            type: 'error'
        });
    }

    warning(message, title = 'Avís') {
        return this.show({
            title,
            message,
            type: 'warning'
        });
    }

    confirm(message, onConfirm = null, title = 'Confirmar') {
        return this.show({
            title,
            message,
            type: 'info',
            confirmText: 'Acceptar',
            cancelText: 'Cancel·lar',
            onConfirm
        });
    }

    // Modal personalitzat amb HTML i botons personalitzats
    custom(htmlContent, title = '', buttons = []) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'custom-modal-overlay';

            // Crear botons
            let buttonsHTML = '';
            if (buttons.length > 0) {
                buttonsHTML = '<div class="custom-modal-buttons">';
                buttons.forEach((btn, index) => {
                    const btnClass = btn.class === 'primary' ? 'custom-modal-btn-confirm' : 'custom-modal-btn-cancel';
                    buttonsHTML += `<button class="custom-modal-btn ${btnClass}" data-index="${index}">${btn.text}</button>`;
                });
                buttonsHTML += '</div>';
            }

            modal.innerHTML = `
                <div class="custom-modal">
                    ${title ? `<h3 class="custom-modal-title">${title}</h3>` : ''}
                    <div class="custom-modal-content">${htmlContent}</div>
                    ${buttonsHTML}
                </div>
            `;

            this.modalContainer.appendChild(modal);

            // Animar l'entrada
            setTimeout(() => modal.classList.add('show'), 10);

            const closeModal = (result) => {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.remove();
                    resolve(result);
                }, 300);
            };

            // Manejadors per cada botó
            const btnElements = modal.querySelectorAll('.custom-modal-btn');
            btnElements.forEach((btn, index) => {
                btn.addEventListener('click', () => {
                    const buttonConfig = buttons[index];
                    if (buttonConfig && buttonConfig.action) {
                        const result = buttonConfig.action();
                        // Si la acció retorna false, no tancar el modal
                        if (result !== false) {
                            closeModal(result);
                        }
                    } else {
                        closeModal(false);
                    }
                });
            });

            // Tancar amb ESC
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    closeModal(false);
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
        });
    }
}

// Crear instància global
const modalManager = new ModalManager();

// Funció global per compatibilitat
function showModal(options) {
    return modalManager.show(options);
}

// Exportar per a ús en altres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModalManager, modalManager, showModal };
}
