// Sistema de gestió de sessions sense backend
// Utilitza localStorage per emmagatzemar usuaris i sessions

const AuthManager = {
    // Claus per localStorage
    USERS_KEY: 'banc_sang_users',
    SESSION_KEY: 'banc_sang_session',

    // Inicialitzar amb un usuari demo
    init() {
        if (!localStorage.getItem(this.USERS_KEY)) {
            const users = [
                {
                    id: 1,
                    email: 'demo@exemple.com',
                    password: 'password1234',
                    name: 'Usuari Demo',
                    registerDate: new Date().toISOString()
                }
            ];
            localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
        }
    },

    // Obtenir tots els usuaris
    getUsers() {
        const users = localStorage.getItem(this.USERS_KEY);
        return users ? JSON.parse(users) : [];
    },

    // Registrar nou usuari
    register(email, password, name = '') {
        const users = this.getUsers();

        // Comprovar si l'email ja existeix
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'Aquest email ja està registrat' };
        }

        // Crear nou usuari
        const newUser = {
            id: Date.now(),
            email,
            password, // En producció, això hauria d'estar encriptat
            name: name || email.split('@')[0],
            registerDate: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

        return { success: true, message: 'Usuari registrat correctament', user: newUser };
    },

    // Iniciar sessió
    login(email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return { success: false, message: 'Email o contrasenya incorrectes' };
        }

        // Crear sessió
        const session = {
            userId: user.id,
            email: user.email,
            name: user.name,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

        return { success: true, message: 'Sessió iniciada correctament', user: session };
    },

    // Tancar sessió
    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        window.location.href = 'login.html';
    },

    // Obtenir sessió actual
    getCurrentSession() {
        const session = localStorage.getItem(this.SESSION_KEY);
        return session ? JSON.parse(session) : null;
    },

    // Comprovar si l'usuari està autenticat
    isAuthenticated() {
        return this.getCurrentSession() !== null;
    },

    // Protegir pàgina (redirigir a login si no està autenticat)
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    // Obtenir nom de l'usuari actual
    getCurrentUserName() {
        const session = this.getCurrentSession();
        return session ? session.name : 'Usuari';
    }
};

// Inicialitzar el sistema
AuthManager.init();
