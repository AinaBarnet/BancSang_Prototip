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
                    <div class="custom-modal-message">${message.replace(/\n/g, '<br>')}</div>
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
            icon: '<div class="modal-icon-check"></div>',
            type: 'success'
        });
    }

    error(message, title = 'Error') {
        return this.show({
            title,
            message,
            icon: '<div class="modal-icon-error"></div>',
            type: 'error'
        });
    }

    warning(message, title = 'Avís') {
        return this.show({
            title,
            message,
            icon: '<div class="modal-icon-warning"></div>',
            type: 'warning'
        });
    }

    confirm(message, title = 'Confirmar') {
        return this.show({
            title,
            message,
            type: 'info',
            confirmText: 'Acceptar',
            cancelText: 'Cancel·lar'
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
