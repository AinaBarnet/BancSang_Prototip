// Script para alternar entre `home.html` y `xat.html` con un solo botón
document.addEventListener('DOMContentLoaded', () => {
    try {
        const path = window.location.pathname.split('/').pop();

        // Crear el botón toggle
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'pageToggleBtn';
        toggleBtn.className = 'page-toggle-btn';

        function applyStyle(btn, label, title) {
            btn.textContent = label;
            btn.title = title;
            btn.style.padding = '6px 10px';
            btn.style.borderRadius = '8px';
            btn.style.border = 'none';
            btn.style.cursor = 'pointer';
            btn.style.fontSize = '14px';
            btn.style.background = '#6b6cff';
            btn.style.color = '#fff';
            btn.style.display = 'inline-flex';
            btn.style.alignItems = 'center';
            btn.style.gap = '6px';
        }

        if (path === 'xat.html') {
            // En la pàgina de xat: mostrar el toggle "Premi" i fer-lo anar a la pàgina d'inici
            applyStyle(toggleBtn, '🎁 Premi', 'Anar a Inici');
            toggleBtn.addEventListener('click', () => {
                window.location.href = 'home.html';
            });

            // Afegir al header-right per evitar tapar elements a l'esquerra (ex: user-menu)
            const headerRight = document.querySelector('header .header-right');
            if (headerRight) {
                headerRight.appendChild(toggleBtn);
            } else {
                // Si no existeix, com a fallback afegim a header-left
                const headerLeft = document.querySelector('header .header-left');
                if (headerLeft) headerLeft.appendChild(toggleBtn);
            }
        } else if (path === 'home.html') {
            // No insertamos el toggle de Xat en la página de inicio; el header de home
            // gestiona sus botones de forma estática (evita duplicar o inyectar el botón Xat).
            // No hacemos nada aquí a propósito.
        } else {
            // Para otras páginas no autenticadas/landing: no hacer nada
        }
    } catch (e) {
        console.error('page-toggle init error', e);
    }
});
