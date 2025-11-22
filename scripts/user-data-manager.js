// Sistema centralitzat de gestió de dades d'usuari
// Gestiona totes les dades específiques de cada usuari de forma consistent

const UserDataManager = {
    // Clau per emmagatzemar totes les dades d'usuaris
    USER_DATA_KEY: 'banc_sang_user_data',

    // Estructura de dades per defecte per a un nou usuari
    getDefaultUserData() {
        return {
            profile: {
                name: '',
                email: '',
                donations: 0,
                lastDonation: null,
                groups: []
            },
            donations: {
                list: [],
                totalCount: 0,
                todayCount: 0,
                lastDonationDate: null
            },
            notifications: {
                list: [],
                trash: [],
                preferences: {
                    enableEvents: true,
                    enableReminders: true,
                    enableAchievements: true,
                    enableInfo: true,
                    autoDeleteOld: false,
                    daysToKeep: 7
                }
            },
            calendar: {
                appointments: []
            },
            chats: {
                contacts: [],
                conversations: {}
            },
            achievements: {
                unlocked: [],
                progress: {}
            },
            preferences: {
                language: 'ca',
                theme: 'light',
                notificationsEnabled: true
            }
        };
    },

    // Obtenir totes les dades dels usuaris
    getAllUsersData() {
        const data = localStorage.getItem(this.USER_DATA_KEY);
        return data ? JSON.parse(data) : {};
    },

    // Guardar totes les dades dels usuaris
    saveAllUsersData(data) {
        localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(data));
    },

    // Obtenir dades d'un usuari específic pel seu ID
    getUserData(userId) {
        const allData = this.getAllUsersData();

        if (!allData[userId]) {
            // Si l'usuari no té dades, crear-les amb valors per defecte
            allData[userId] = this.getDefaultUserData();
            this.saveAllUsersData(allData);
        }

        return allData[userId];
    },

    // Guardar dades d'un usuari específic
    saveUserData(userId, userData) {
        const allData = this.getAllUsersData();
        allData[userId] = userData;
        this.saveAllUsersData(allData);

        // Disparar event per notificar canvis
        window.dispatchEvent(new CustomEvent('userDataUpdated', { detail: { userId } }));
    },

    // Eliminar dades d'un usuari específic
    deleteUserData(userId) {
        const allData = this.getAllUsersData();
        delete allData[userId];
        this.saveAllUsersData(allData);

        // Disparar event per notificar l'eliminació
        window.dispatchEvent(new CustomEvent('userDataDeleted', { detail: { userId } }));
    },

    // Actualitzar una secció específica de les dades d'un usuari
    updateUserSection(userId, section, data) {
        const userData = this.getUserData(userId);
        userData[section] = { ...userData[section], ...data };
        this.saveUserData(userId, userData);
    },

    // Obtenir l'usuari actual des de la sessió
    getCurrentUser() {
        const session = AuthManager.getCurrentSession();
        return session ? session.userId : null;
    },

    // Obtenir dades de l'usuari actual
    getCurrentUserData() {
        const userId = this.getCurrentUser();
        if (!userId) {
            console.error('No hi ha cap usuari autenticat');
            return null;
        }
        return this.getUserData(userId);
    },

    // Guardar dades de l'usuari actual
    saveCurrentUserData(userData) {
        const userId = this.getCurrentUser();
        if (!userId) {
            console.error('No hi ha cap usuari autenticat');
            return;
        }
        this.saveUserData(userId, userData);
    },

    // Actualitzar perfil de l'usuari actual
    updateCurrentUserProfile(profileData) {
        const userId = this.getCurrentUser();
        if (!userId) return;

        this.updateUserSection(userId, 'profile', profileData);
    },

    // Afegir una donació a l'usuari actual
    addDonation(donation) {
        const userData = this.getCurrentUserData();
        if (!userData) return { success: false, error: 'No hi ha usuari autenticat' };

        // VALIDACIÓ: Comprovar que han passat 3 mesos des de l'última donació
        if (userData.donations.list.length > 0) {
            const lastDonation = userData.donations.list[0]; // Ja està ordenat per data
            const lastDate = new Date(lastDonation.date || lastDonation.timestamp);
            const newDonationDate = new Date(donation.date || Date.now());

            // Calcular propera data disponible (3 mesos després)
            const nextAvailableDate = new Date(lastDate);
            nextAvailableDate.setMonth(nextAvailableDate.getMonth() + 3);

            if (newDonationDate < nextAvailableDate) {
                const formattedNextDate = this.formatDate(nextAvailableDate.toISOString());
                const formattedLastDate = this.formatDate(lastDate.toISOString());
                return {
                    success: false,
                    error: `No pots donar sang encara. L'última donació va ser el ${formattedLastDate}. Podràs tornar a donar a partir del ${formattedNextDate} (3 mesos després).`,
                    nextAvailableDate: formattedNextDate,
                    lastDonationDate: formattedLastDate
                };
            }
        }

        // Afegir timestamp si no existeix
        if (!donation.timestamp) {
            donation.timestamp = Date.now();
        }

        // Afegir la donació a la llista
        userData.donations.list.push(donation);
        userData.donations.totalCount++;

        // Ordenar donacions per data (més recent primer)
        userData.donations.list.sort((a, b) => {
            const dateA = new Date(a.date || a.timestamp);
            const dateB = new Date(b.date || b.timestamp);
            return dateB - dateA; // Ordre descendent (més recent primer)
        });

        // Actualitzar última donació (ara sabem que [0] és la més recent)
        const mostRecentDonation = userData.donations.list[0];
        userData.donations.lastDonationDate = mostRecentDonation.date || new Date().toISOString();
        userData.profile.lastDonation = this.formatDate(userData.donations.lastDonationDate);
        userData.profile.donations = userData.donations.totalCount;

        // Actualitzar comptador diari: comptar només donacions amb data d'AVUI
        const todayStr = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        userData.donations.todayCount = userData.donations.list.filter(d => {
            const donationDateStr = d.date ? d.date.split('T')[0] : new Date(d.timestamp).toISOString().split('T')[0];
            return donationDateStr === todayStr;
        }).length;

        this.saveCurrentUserData(userData);

        // Crear coherència: afegir al calendari i crear notificacions
        this.syncDonationToCalendar(donation);
        this.createDonationNotifications(donation);

        return { success: true, donations: userData.donations };
    },

    // Obtenir donacions de l'usuari actual
    getDonations() {
        const userData = this.getCurrentUserData();
        return userData ? userData.donations : null;
    },

    // Obtenir la propera data disponible per donar (null si ja pot donar)
    getNextAvailableDonationDate() {
        const userData = this.getCurrentUserData();
        if (!userData || userData.donations.list.length === 0) {
            return null; // Primera donació, pot donar quan vulgui
        }

        const lastDonation = userData.donations.list[0]; // Ja està ordenat
        const lastDate = new Date(lastDonation.date || lastDonation.timestamp);
        const nextAvailableDate = new Date(lastDate);
        nextAvailableDate.setMonth(nextAvailableDate.getMonth() + 3);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        nextAvailableDate.setHours(0, 0, 0, 0);

        // Si ja pot donar, retornar null
        if (today >= nextAvailableDate) {
            return null;
        }

        return nextAvailableDate;
    },

    // Afegir notificació a l'usuari actual
    addNotification(notification) {
        const userData = this.getCurrentUserData();
        if (!userData) return;

        // Generar ID únic basat en les notificacions existents
        const maxId = userData.notifications.list.reduce((max, n) => Math.max(max, n.id || 0), 0);
        notification.id = maxId + 1;
        notification.timestamp = Date.now();
        notification.unread = true;

        userData.notifications.list.unshift(notification);
        this.saveCurrentUserData(userData);

        window.dispatchEvent(new CustomEvent('newNotification', { detail: notification }));
    },

    // Obtenir notificacions de l'usuari actual
    getNotifications() {
        const userData = this.getCurrentUserData();
        return userData ? userData.notifications.list : [];
    },

    // Guardar notificacions de l'usuari actual
    saveNotifications(notifications) {
        const userId = this.getCurrentUser();
        if (!userId) return;

        this.updateUserSection(userId, 'notifications', { list: notifications });
    },

    // Obtenir preferències de notificacions
    getNotificationPreferences() {
        const userData = this.getCurrentUserData();
        return userData ? userData.notifications.preferences : this.getDefaultUserData().notifications.preferences;
    },

    // Guardar preferències de notificacions
    saveNotificationPreferences(preferences) {
        const userId = this.getCurrentUser();
        if (!userId) return;

        const userData = this.getUserData(userId);
        userData.notifications.preferences = preferences;
        this.saveUserData(userId, userData);
    },

    // Obtenir paperera de notificacions
    getNotificationTrash() {
        const userData = this.getCurrentUserData();
        return userData ? userData.notifications.trash : [];
    },

    // Guardar paperera de notificacions
    saveNotificationTrash(trash) {
        const userId = this.getCurrentUser();
        if (!userId) return;

        const userData = this.getUserData(userId);
        userData.notifications.trash = trash;
        this.saveUserData(userId, userData);
    },

    // Afegir grup al perfil de l'usuari actual
    addGroup(group) {
        const userData = this.getCurrentUserData();
        if (!userData) return;

        if (!userData.profile.groups) {
            userData.profile.groups = [];
        }

        userData.profile.groups.push(group);
        this.saveCurrentUserData(userData);
    },

    // Obtenir grups de l'usuari actual
    getGroups() {
        const userData = this.getCurrentUserData();
        return userData && userData.profile.groups ? userData.profile.groups : [];
    },

    // Afegir amic
    addFriend(friend) {
        const userId = this.getCurrentUser();
        if (!userId) return;

        const userData = this.getUserData(userId);
        if (!userData.profile.friends) {
            userData.profile.friends = [];
        }

        userData.profile.friends.push(friend);
        this.saveUserData(userId, userData);
    },

    // Obtenir amics de l'usuari actual
    getFriends() {
        const userData = this.getCurrentUserData();
        return userData && userData.profile.friends ? userData.profile.friends : [];
    },

    // Guardar contactes de xat
    saveChatContacts(contacts) {
        const userId = this.getCurrentUser();
        if (!userId) return;

        this.updateUserSection(userId, 'chats', { contacts });
    },

    // Obtenir contactes de xat
    getChatContacts() {
        const userData = this.getCurrentUserData();
        return userData && userData.chats.contacts ? userData.chats.contacts : [];
    },

    // Guardar converses de xat
    saveChatConversations(conversations) {
        const userId = this.getCurrentUser();
        if (!userId) return;

        this.updateUserSection(userId, 'chats', { conversations });
    },

    // Obtenir converses de xat
    getChatConversations() {
        const userData = this.getCurrentUserData();
        return userData && userData.chats.conversations ? userData.chats.conversations : {};
    },

    // Migrar dades existents d'un usuari (per DEMO USER)
    migrateExistingData(userId) {
        const userData = this.getUserData(userId);

        // Migrar dades de perfil si existeixen
        const oldProfile = localStorage.getItem('profileData');
        if (oldProfile && !userData.profile.name) {
            try {
                const profile = JSON.parse(oldProfile);
                userData.profile = {
                    ...userData.profile,
                    name: profile.name || '',
                    donations: profile.donations || 0,
                    lastDonation: profile.lastDonation || null,
                    groups: profile.groups || []
                };
            } catch (e) {
                console.error('Error migrant profileData:', e);
            }
        }

        // Migrar donacions de l'usuari
        const oldDonations = localStorage.getItem('userDonations');
        if (oldDonations && userData.donations.list.length === 0) {
            try {
                const donations = JSON.parse(oldDonations);
                userData.donations.list = donations;
                userData.donations.totalCount = donations.length;
            } catch (e) {
                console.error('Error migrant userDonations:', e);
            }
        }

        // Migrar notificacions
        const oldNotifications = localStorage.getItem('bancSang_notifications');
        if (oldNotifications && userData.notifications.list.length === 0) {
            try {
                const notifications = JSON.parse(oldNotifications);
                userData.notifications.list = notifications;
            } catch (e) {
                console.error('Error migrant notifications:', e);
            }
        }

        // Migrar preferències de notificacions
        const oldPrefs = localStorage.getItem('bancSang_notificationPreferences');
        if (oldPrefs) {
            try {
                const prefs = JSON.parse(oldPrefs);
                userData.notifications.preferences = prefs;
            } catch (e) {
                console.error('Error migrant notification preferences:', e);
            }
        }

        // Migrar paperera de notificacions
        const oldTrash = localStorage.getItem('bancSang_notificationTrash');
        if (oldTrash) {
            try {
                const trash = JSON.parse(oldTrash);
                userData.notifications.trash = trash;
            } catch (e) {
                console.error('Error migrant notification trash:', e);
            }
        }

        // Migrar contactes de xat
        const oldContacts = localStorage.getItem('bancSang_chat_contacts');
        if (oldContacts && userData.chats.contacts.length === 0) {
            try {
                const contacts = JSON.parse(oldContacts);
                userData.chats.contacts = contacts;
            } catch (e) {
                console.error('Error migrant chat contacts:', e);
            }
        }

        // Migrar converses de xat
        const oldConversations = localStorage.getItem('bancSang_chat');
        if (oldConversations && Object.keys(userData.chats.conversations).length === 0) {
            try {
                const conversations = JSON.parse(oldConversations);
                userData.chats.conversations = conversations;
            } catch (e) {
                console.error('Error migrant chat conversations:', e);
            }
        }

        this.saveUserData(userId, userData);
        console.log('Dades migrades correctament per l\'usuari:', userId);
    },

    // Inicialitzar amb notificacions per defecte per a un nou usuari
    initializeDefaultNotifications(userId) {
        const userData = this.getUserData(userId);

        if (userData.notifications.list.length === 0) {
            // Notificacions per defecte per a nous usuaris
            userData.notifications.list = [
                {
                    id: 1,
                    type: 'info',
                    icon: '👋',
                    iconClass: 'info',
                    title: 'Benvingut a BancSang!',
                    description: 'Gràcies per registrar-te. Aquí podràs gestionar les teves donacions, trobar centres propers i participar en els nostres sortejos mensuals.',
                    time: 'Ara mateix',
                    date: 'Avui',
                    category: 'Informació',
                    unread: true,
                    priority: 'medium',
                    timestamp: Date.now(),
                    actions: [
                        { label: 'Trobar centres', action: 'findLocations', url: 'localitzacions.html' }
                    ]
                },
                {
                    id: 2,
                    type: 'events',
                    icon: '📅',
                    iconClass: 'new-event',
                    title: 'Noves places disponibles!',
                    description: 'Hi ha places disponibles per donar sang aquesta setmana. Troba el teu centre més proper.',
                    time: 'Fa 1 hora',
                    date: 'Avui',
                    category: 'Cita',
                    unread: true,
                    priority: 'high',
                    timestamp: Date.now() - 60 * 60 * 1000,
                    actions: [
                        { label: 'Reservar cita', action: 'reserveAppointment', url: 'localitzacions.html' }
                    ]
                }
            ];

            this.saveUserData(userId, userData);
        }
    },

    // Formatar data per mostrar
    formatDate(dateString) {
        if (!dateString) return null;

        const date = new Date(dateString);
        return date.toLocaleDateString('ca-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },

    // Netejar dades d'usuari (per testing)
    clearUserData(userId) {
        const allData = this.getAllUsersData();
        delete allData[userId];
        this.saveAllUsersData(allData);
    },

    // Obtenir estadístiques de l'usuari actual
    getUserStats() {
        const userData = this.getCurrentUserData();
        if (!userData) return null;

        return {
            totalDonations: userData.donations.totalCount,
            todayDonations: userData.donations.todayCount,
            lastDonation: userData.profile.lastDonation,
            unreadNotifications: userData.notifications.list.filter(n => n.unread).length,
            groupsCount: userData.profile.groups ? userData.profile.groups.length : 0
        };
    },

    // ============================================================
    // GESTIÓ DE COHERÈNCIA ENTRE DONACIONS, CALENDARI I NOTIFICACIONS
    // ============================================================

    // Sincronitzar donació amb el calendari
    syncDonationToCalendar(donation) {
        const userData = this.getCurrentUserData();
        if (!userData) return;

        const donationDate = new Date(donation.date || donation.timestamp);
        const donationDateStr = this.dateToLocalString(donationDate);

        // Crear esdeveniment de donació al calendari
        const donationEvent = {
            id: `donation-${donation.timestamp}`,
            type: 'donation',
            title: `Donació de ${donation.type || 'sang'}`,
            date: donationDateStr,
            time: '10:00',
            center: donation.center,
            donationType: donation.type || 'Sang',
            notes: donation.observations || ''
        };

        // Afegir només si no existeix ja
        const exists = userData.calendar.appointments.some(e =>
            e.type === 'donation' && e.date === donationDateStr
        );

        if (!exists) {
            userData.calendar.appointments.push(donationEvent);
        }

        // Calcular propera data disponible (3 mesos després)
        const nextAvailable = new Date(donationDate);
        nextAvailable.setMonth(nextAvailable.getMonth() + 3);

        // Eliminar recordatoris anteriors de disponibilitat
        userData.calendar.appointments = userData.calendar.appointments.filter(e =>
            e.type !== 'available'
        );

        // Afegir només si és futur
        if (nextAvailable > new Date()) {
            const nextAvailableDateStr = this.dateToLocalString(nextAvailable);
            const availableEvent = {
                id: `available-${nextAvailable.getTime()}`,
                type: 'available',
                title: 'Ja pots tornar a donar!',
                date: nextAvailableDateStr,
                time: '00:00',
                center: 'Qualsevol centre',
                notes: 'Han passat 3 mesos des de la teva última donació'
            };
            userData.calendar.appointments.push(availableEvent);
        }

        this.saveCurrentUserData(userData);
    },

    // Crear notificacions relacionades amb una donació
    createDonationNotifications(donation) {
        const donationDate = new Date(donation.date || donation.timestamp);
        const centerName = donation.center || 'centre de donació';

        // 1. Notificació de confirmació de donació
        this.addNotification({
            type: 'achievements',
            icon: '🩸',
            iconClass: 'achievement',
            title: 'Gràcies per salvar vides!',
            description: `Donació completada amb èxit el ${this.formatDate(donationDate)} a ${centerName}. La teva sang arribarà a qui més ho necessita i pot salvar fins a 3 vides.`,
            category: 'Assoliment',
            priority: 'medium',
            actions: [
                { label: 'Veure historial', action: 'viewDetails', url: 'personalizacion.html' }
            ]
        });

        // 2. Calcular propera data disponible (3 mesos després)
        const nextAvailable = new Date(donationDate);
        nextAvailable.setMonth(nextAvailable.getMonth() + 3);

        // Programar notificació per quan pugui tornar a donar
        if (nextAvailable > new Date()) {
            const nextAvailableStr = this.formatDate(nextAvailable);

            // Notificació informativa
            this.addNotification({
                type: 'info',
                icon: '📅',
                iconClass: 'info',
                title: 'Propera donació disponible',
                description: `Podràs tornar a donar sang a partir del ${nextAvailableStr}. T'enviarem un recordatori quan s'apropi la data.`,
                category: 'Informació',
                priority: 'low',
                actions: [
                    { label: 'Afegir al calendari', action: 'viewCalendar', url: 'calendari.html' }
                ]
            });
        }

        // 3. Comprovar assoliments segons nombre de donacions
        const userData = this.getCurrentUserData();
        const totalDonations = userData.donations.totalCount;

        this.checkDonationAchievements(totalDonations);
    },

    // Comprovar i crear notificacions d'assoliments
    checkDonationAchievements(totalDonations) {
        const achievements = {
            1: { title: 'Primera donació! 🎉', level: 'Bronze', icon: '🥉', lives: 3 },
            3: { title: 'Donant bronze! 🥉', level: 'Bronze', icon: '🥉', lives: 9 },
            5: { title: 'Donant plata! 🥈', level: 'Plata', icon: '🥈', lives: 15 },
            10: { title: 'Donant or! 🥇', level: 'Or', icon: '🥇', lives: 30 },
            25: { title: 'Heroi solidari! 🏆', level: 'Platí', icon: '🏆', lives: 75 },
            50: { title: 'Llegenda de la solidaritat! 👑', level: 'Diamant', icon: '👑', lives: 150 }
        };

        if (achievements[totalDonations]) {
            const achievement = achievements[totalDonations];

            this.addNotification({
                type: 'achievements',
                icon: achievement.icon,
                iconClass: 'achievement',
                title: `Felicitats, ${achievement.title}`,
                description: `Has completat la teva ${totalDonations}ª donació i has salvat fins a ${achievement.lives} vides. Ets un exemple de solidaritat. Continua així!`,
                category: 'Assoliment',
                priority: 'high',
                actions: [
                    { label: 'Veure tots els assoliments', action: 'viewAchievements', url: 'personalizacion.html' }
                ]
            });
        }
    },

    // Crear notificació de recordatori per cita programada
    createAppointmentReminder(appointment) {
        const appointmentDate = new Date(appointment.date);
        const dateStr = this.formatDate(appointmentDate);
        const timeStr = appointment.time || '10:00';

        let description = `Tens una cita programada per ${dateStr} a les ${timeStr} a ${appointment.center}. Recorda portar el DNI, esmorzar bé i hidratar-te.`;
        let title = 'Recordatori de cita';
        let icon = '📅';

        // Personalitzar per a esdeveniments socials
        if (appointment.isSocial && appointment.socialData) {
            title = `${appointment.socialData.activityLabel} + Donació`;
            icon = '✨';
            description = `Tens un esdeveniment social programat per ${dateStr}! `;

            if (appointment.socialData.time) {
                description += `Activitat a les ${appointment.socialData.time}`;
                if (appointment.socialData.location) {
                    description += ` a ${appointment.socialData.location}`;
                }
                description += `. `;
            }

            description += `Després anireu a donar sang a les ${timeStr} a ${appointment.center}.`;

            if (appointment.isGroup && appointment.groupData) {
                description += ` Grup: ${appointment.groupData.name}.`;
                if (appointment.groupData.participants && appointment.groupData.participants.length > 0) {
                    description += ` Participants: ${appointment.groupData.participants.join(', ')}.`;
                }
            }

            description += ' Gaudiu de l\'experiència junts i feu una acció solidària!';
        }
        // Personalitzar per a donacions en grup (sense component social)
        else if (appointment.isGroup && appointment.groupData) {
            title = `Donació en grup: ${appointment.groupData.name}`;
            icon = '👥';
            description = `Tens una donació en grup programada amb "${appointment.groupData.name}" per ${dateStr} a les ${timeStr} a ${appointment.center}.`;

            if (appointment.groupData.participants && appointment.groupData.participants.length > 0) {
                description += ` Participants: ${appointment.groupData.participants.join(', ')}.`;
            }

            description += ' Animeu-vos mútuament i gaudiu de l\'experiència junts!';
        }

        this.addNotification({
            type: 'events',
            icon: icon,
            iconClass: 'new-event',
            title: title,
            description: description,
            category: 'Cita',
            priority: 'high',
            actions: [
                { label: 'Veure calendari', action: 'viewCalendar', url: 'calendari.html' },
                { label: 'Informació abans de donar', action: 'viewDetails', url: 'abans-donar.html' }
            ]
        });
    },

    // Crear notificació quan es pot tornar a donar
    createAvailableToDonateNotification() {
        const userData = this.getCurrentUserData();
        if (!userData || userData.donations.list.length === 0) return;

        const lastDonation = userData.donations.list[userData.donations.list.length - 1];
        const lastDate = new Date(lastDonation.date || lastDonation.timestamp);
        const nextAvailable = new Date(lastDate);
        nextAvailable.setMonth(nextAvailable.getMonth() + 3);

        // Només crear si ja es pot donar
        if (nextAvailable <= new Date()) {
            this.addNotification({
                type: 'reminders',
                icon: '🔔',
                iconClass: 'reminder',
                title: 'Ja pots tornar a donar sang!',
                description: 'Han passat 3 mesos des de la teva última donació. La teva ajuda és valuosa. ¿Reservem una cita?',
                category: 'Recordatori',
                priority: 'high',
                actions: [
                    { label: 'Centres propers', action: 'findLocations', url: 'localitzacions.html' },
                    { label: 'Reservar cita', action: 'reserveAppointment', url: 'calendari.html' }
                ]
            });
        }
    },

    // Obtenir cites del calendari
    getCalendarAppointments() {
        const userData = this.getCurrentUserData();
        return userData ? userData.calendar.appointments : [];
    },

    // Guardar cites del calendari
    saveCalendarAppointments(appointments) {
        const userId = this.getCurrentUser();
        if (!userId) return;

        this.updateUserSection(userId, 'calendar', { appointments });
    },

    // Afegir cita al calendari
    addCalendarAppointment(appointment) {
        const userData = this.getCurrentUserData();
        if (!userData) return;

        // Afegir timestamp si no existeix
        if (!appointment.id) {
            appointment.id = `event-${Date.now()}`;
        }

        userData.calendar.appointments.push(appointment);
        this.saveCurrentUserData(userData);

        // Crear notificació de confirmació
        this.createAppointmentReminder(appointment);
    },

    // Eliminar cita del calendari
    removeCalendarAppointment(appointmentId) {
        const userData = this.getCurrentUserData();
        if (!userData) return;

        userData.calendar.appointments = userData.calendar.appointments.filter(
            a => a.id !== appointmentId
        );
        this.saveCurrentUserData(userData);
    },

    // Carregar donacions i cites al calendari (per compatibilitat amb calendari.js)
    // Funció auxiliar per convertir una data a format YYYY-MM-DD en zona horària local
    dateToLocalString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    loadDonationsToCalendar() {
        const userData = this.getCurrentUserData();
        if (!userData) return [];

        const events = [...userData.calendar.appointments];

        // Afegir donacions com a esdeveniments si no existeixen
        userData.donations.list.forEach(donation => {
            const donationDate = new Date(donation.date || donation.timestamp);
            const dateStr = this.dateToLocalString(donationDate);

            const exists = events.some(e =>
                e.type === 'donation' && e.date === dateStr
            );

            if (!exists) {
                events.push({
                    id: `donation-${donation.timestamp}`,
                    type: 'donation',
                    title: `Donació de ${donation.type || 'sang'}`,
                    date: dateStr,
                    time: '10:00',
                    center: donation.center,
                    donationType: donation.type || 'Sang',
                    notes: donation.observations || ''
                });
            }

            // Crear esdeveniment de "disponible" 3 mesos després de CADA donació
            const nextAvailable = new Date(donationDate);
            nextAvailable.setMonth(nextAvailable.getMonth() + 3);
            const availableDateStr = this.dateToLocalString(nextAvailable);

            const availableExists = events.some(e =>
                e.type === 'available' && e.date === availableDateStr
            );

            if (!availableExists) {
                events.push({
                    id: `available-${donation.timestamp}`,
                    type: 'available',
                    title: 'Ja pots tornar a donar!',
                    date: availableDateStr,
                    time: '00:00',
                    center: 'Qualsevol centre',
                    notes: 'Han passat 3 mesos des de la teva última donació'
                });
            }
        });

        return events;
    }
};

// Exportar per usar en altres scripts
if (typeof window !== 'undefined') {
    window.UserDataManager = UserDataManager;
}
