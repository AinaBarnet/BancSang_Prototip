// Protecció de pàgines privades
// Afegir aquest script a totes les pàgines que requereixin autenticació

// Aquest codi ha d'estar al principi del fitxer JS de cada pàgina privada:

// Protegir la pàgina - requerir autenticació
if (!AuthManager.requireAuth()) {
    // Si no està autenticat, requireAuth redirigirà a login
    throw new Error('Accés no autoritzat');
}

// INSTRUCCIONS PER PROTEGIR PÀGINES:
// ===================================

// 1. Afegir el script auth.js ABANS del script principal de la pàgina:
//    <script src="scripts/auth.js"></script>
//    <script src="scripts/nom-del-script.js"></script>

// 2. Al principi del fitxer JS de la pàgina, afegir:
//    if (!AuthManager.requireAuth()) {
//        throw new Error('Accés no autoritzat');
//    }

// 3. (Opcional) Mostrar el nom de l'usuari:
//    const userName = AuthManager.getCurrentUserName();
//    document.querySelector('.user-name').textContent = userName.toUpperCase();

// 4. (Opcional) Afegir botó de tancar sessió:
//    const logoutBtn = document.getElementById('logoutBtn');
//    if (logoutBtn) {
//        logoutBtn.addEventListener('click', (e) => {
//            e.preventDefault();
//            if (confirm('Segur que vols tancar la sessió?')) {
//                AuthManager.logout();
//            }
//        });
//    }

// PÀGINES QUE NECESSITEN PROTECCIÓ:
// ==================================
// - home.html ✓ (ja protegida)
// - calendari.html
// - notificacions.html
// - xat.html
// - registrar-donacio.html
// - localitzacions.html
// - abans-donar.html
// - prize.html

// PÀGINES PÚBLIQUES (no necessiten protecció):
// ============================================
// - index.html (landing page)
// - login.html
// - register.html
