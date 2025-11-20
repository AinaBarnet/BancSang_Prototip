// Protegir la pàgina - requerir autenticació
if (!AuthManager.requireAuth()) {
    throw new Error('Accés no autoritzat');
}

// Variables globals
let currentDate = new Date();
let selectedDate = null;
let events = [];
let userFriends = [];
let editingEvent = null;

// Elements del DOM
const calendarGrid = document.getElementById('calendarGrid');
const currentMonthEl = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const todayBtn = document.getElementById('todayBtn');
const addEventBtn = document.getElementById('addEventBtn');
const eventModal = document.getElementById('eventModal');
const eventDetailsModal = document.getElementById('eventDetailsModal');
const eventForm = document.getElementById('eventForm');
const eventsList = document.getElementById('eventsList');

// Noms dels mesos en català
const monthNames = [
    'Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
    'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'
];

// Inicialitzar l'aplicació
document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
    loadDonations();
    loadFriends();
    generateCalendar();
    setupEventListeners();
});

// Carregar esdeveniments del localStorage (ara per usuari)
function loadEvents() {
    events = UserDataManager.loadDonationsToCalendar();
    console.log('Esdeveniments carregats:', events.length);
}

// Guardar esdeveniments al localStorage (ara per usuari)
function saveEvents() {
    UserDataManager.saveCalendarAppointments(events);
}

// Carregar donacions històriques i crear esdeveniments (ja gestionat per UserDataManager)
function loadDonations() {
    // Aquest mètode ara és gestionat per UserDataManager.loadDonationsToCalendar()
    // que ja s'executa a loadEvents()
}

// Carregar amics de l'usuari
function loadFriends() {
    try {
        userFriends = UserDataManager.getFriends() || [];
        console.log('Amics carregats:', userFriends.length);
    } catch (error) {
        console.error('Error carregant amics:', error);
        userFriends = [];
    }
}

// Renderitzar llista d'amics amb checkboxes
function renderFriendsList() {
    const container = document.getElementById('friendsListContainer');

    if (userFriends.length === 0) {
        container.innerHTML = '<p style="color: #5f6368; padding: 1rem; text-align: center;">Encara no tens amics afegits. Afegeix-ne un!</p>';
        return;
    }

    container.innerHTML = userFriends.map(friend => `
        <div class="friend-checkbox-item">
            <input type="checkbox" id="friend-${friend.id}" value="${friend.id}" class="friend-checkbox">
            <label for="friend-${friend.id}">${friend.name}</label>
        </div>
    `).join('');
}

// Afegir nou amic
function addNewFriend() {
    const friendName = prompt('Nom del nou amic:');

    if (friendName && friendName.trim()) {
        const newFriend = {
            id: `friend-${Date.now()}`,
            name: friendName.trim(),
            createdAt: Date.now()
        };

        userFriends.push(newFriend);
        UserDataManager.addFriend(newFriend);
        renderFriendsList();

        modalManager.success(`${friendName} afegit com a amic!`, 'Amic afegit');
    }
}

// Obtenir amics seleccionats
function getSelectedFriends() {
    try {
        const checkboxes = document.querySelectorAll('.friend-checkbox:checked');
        if (!checkboxes || checkboxes.length === 0) {
            return [];
        }
        return Array.from(checkboxes).map(cb => {
            const friendId = cb.value;
            const friend = userFriends.find(f => f.id === friendId);
            return friend ? friend.name : null;
        }).filter(name => name !== null);
    } catch (error) {
        console.error('Error obtenint amics seleccionats:', error);
        return [];
    }
}

// Generar calendari
function generateCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Actualitzar títol
    currentMonthEl.textContent = `${monthNames[month]} ${year}`;

    // Primer dia del mes (0 = diumenge, 1 = dilluns, ...)
    const firstDay = new Date(year, month, 1).getDay();
    // Ajustar per començar en dilluns (0 = dilluns)
    const firstDayAdjusted = firstDay === 0 ? 6 : firstDay - 1;

    // Últim dia del mes
    const lastDate = new Date(year, month + 1, 0).getDate();

    // Dies del mes anterior
    const prevLastDate = new Date(year, month, 0).getDate();

    // Netejar grid
    calendarGrid.innerHTML = '';

    // Dies del mes anterior
    for (let i = firstDayAdjusted - 1; i >= 0; i--) {
        const day = prevLastDate - i;
        const dayEl = createDayElement(day, 'other-month');
        calendarGrid.appendChild(dayEl);
    }

    // Dies del mes actual
    for (let day = 1; day <= lastDate; day++) {
        const date = new Date(year, month, day);
        const dayEl = createDayElement(day, '', date);
        calendarGrid.appendChild(dayEl);
    }

    // Dies del mes següent per omplir la graella
    const totalCells = calendarGrid.children.length;
    const remainingCells = 35 - totalCells; // Mínim 5 setmanes

    for (let day = 1; day <= remainingCells; day++) {
        const dayEl = createDayElement(day, 'other-month');
        calendarGrid.appendChild(dayEl);
    }

    // Actualitzar llista d'esdeveniments
    updateEventsList();
}

// Crear element de dia
function createDayElement(day, className, date) {
    const dayEl = document.createElement('div');
    dayEl.className = `calendar-day ${className}`;

    // Afegir classe 'today' si és avui
    if (date && isToday(date)) {
        dayEl.classList.add('today');
    }

    // Número del dia
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayEl.appendChild(dayNumber);

    // Esdeveniments del dia
    if (date && !className.includes('other-month')) {
        const dayEvents = getDayEvents(date);
        if (dayEvents.length > 0) {
            const eventsContainer = document.createElement('div');
            eventsContainer.className = 'day-events';

            // Mostrar primers 2 esdeveniments
            dayEvents.slice(0, 2).forEach(event => {
                const eventEl = document.createElement('div');
                eventEl.className = `day-event ${event.type}`;
                eventEl.textContent = event.title;
                eventEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showEventDetails(event);
                });
                eventsContainer.appendChild(eventEl);
            });

            // Si hi ha més esdeveniments, mostrar comptador
            if (dayEvents.length > 2) {
                const countEl = document.createElement('div');
                countEl.className = 'day-event-count';
                countEl.textContent = `+${dayEvents.length - 2} més`;
                eventsContainer.appendChild(countEl);
            }

            dayEl.appendChild(eventsContainer);
        }
    }

    // Click per afegir esdeveniment
    if (date && !className.includes('other-month')) {
        dayEl.addEventListener('click', () => {
            selectedDate = date;
            openEventModal();
        });
    }

    return dayEl;
}

// Comprovar si una data és avui
function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
}

// Obtenir esdeveniments d'un dia
function getDayEvents(date) {
    // Utilitzar format local per evitar problemes amb UTC
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    return events.filter(event => event.date === dateStr)
        .sort((a, b) => a.time.localeCompare(b.time));
}

// Actualitzar llista d'esdeveniments del mes
function updateEventsList() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Filtrar esdeveniments del mes actual
    const monthEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === month && eventDate.getFullYear() === year;
    }).sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
    });

    // Netejar llista
    eventsList.innerHTML = '';

    if (monthEvents.length === 0) {
        eventsList.innerHTML = '<div class="no-events">No hi ha esdeveniments aquest mes</div>';
        return;
    }

    // Crear targetes d'esdeveniments
    monthEvents.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = `event-card ${event.type}`;

        // Parsejar la data correctament en format local (YYYY-MM-DD)
        const [year, month, day] = event.date.split('-').map(Number);
        const eventDate = new Date(year, month - 1, day);
        const dateStr = eventDate.toLocaleDateString('ca-ES', {
            day: 'numeric',
            month: 'long',
            weekday: 'short'
        });

        eventCard.innerHTML = `
            <div class="event-date">${dateStr} - ${event.time}</div>
            <div class="event-title">${event.title}</div>
            <div class="event-location">${event.center || ''}</div>
        `;

        eventCard.addEventListener('click', () => showEventDetails(event));
        eventsList.appendChild(eventCard);
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Navegació del calendari
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        loadEvents(); // Recarregar esdeveniments
        generateCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        loadEvents(); // Recarregar esdeveniments
        generateCalendar();
    });

    todayBtn.addEventListener('click', () => {
        currentDate = new Date();
        loadEvents(); // Recarregar esdeveniments
        generateCalendar();
    });

    // Botó afegir esdeveniment
    addEventBtn.addEventListener('click', () => {
        selectedDate = new Date();
        openEventModal();
    });

    // Modal d'esdeveniment
    document.getElementById('closeModalBtn').addEventListener('click', closeEventModal);
    document.getElementById('cancelBtn').addEventListener('click', closeEventModal);

    eventModal.addEventListener('click', (e) => {
        if (e.target === eventModal) closeEventModal();
    });

    // Formulari d'esdeveniment
    eventForm.addEventListener('submit', handleEventSubmit);

    // Actualitzar hora final automàticament (1 hora després)
    document.getElementById('eventTime').addEventListener('change', (e) => {
        const startTime = e.target.value;
        if (startTime) {
            const [hours, minutes] = startTime.split(':').map(Number);
            const endHours = (hours + 1) % 24;
            const endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            document.getElementById('eventEndTime').value = endTime;
            updateDurationText();
        }
    });

    // Actualitzar text de duració
    document.getElementById('eventEndTime').addEventListener('change', updateDurationText);

    // Toggle camps de col·laboradors
    document.getElementById('toggleCollaboratorsBtn').addEventListener('click', () => {
        const collaboratorsFieldsContainer = document.getElementById('collaboratorsFieldsContainer');
        if (collaboratorsFieldsContainer.style.display === 'none' || !collaboratorsFieldsContainer.style.display) {
            collaboratorsFieldsContainer.style.display = 'block';
            renderFriendsList();
        } else {
            collaboratorsFieldsContainer.style.display = 'none';
        }
    });

    // Botó afegir nou amic
    document.getElementById('addNewFriendBtn').addEventListener('click', addNewFriend);

    // Modal de detalls
    document.getElementById('closeDetailsBtn').addEventListener('click', closeEventDetails);

    eventDetailsModal.addEventListener('click', (e) => {
        if (e.target === eventDetailsModal) closeEventDetails();
    });

    // Botons d'editar i eliminar
    document.getElementById('editEventBtn').addEventListener('click', editCurrentEvent);
    document.getElementById('deleteEventBtn').addEventListener('click', deleteCurrentEvent);
}

// Actualitzar text de duració
function updateDurationText() {
    const startTime = document.getElementById('eventTime').value;
    const endTime = document.getElementById('eventEndTime').value;
    const durationText = document.getElementById('durationText');

    if (startTime && endTime) {
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);

        let duration = (endH * 60 + endM) - (startH * 60 + startM);
        if (duration < 0) duration += 24 * 60; // Si travessa mitjanit

        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;

        if (hours > 0 && minutes > 0) {
            durationText.textContent = `(${hours}h ${minutes}min)`;
        } else if (hours > 0) {
            durationText.textContent = `(${hours}h)`;
        } else if (minutes > 0) {
            durationText.textContent = `(${minutes}min)`;
        }
    } else {
        durationText.textContent = '–';
    }
}

// Obrir modal d'esdeveniment
function openEventModal(eventToEdit = null) {
    editingEvent = eventToEdit;

    if (eventToEdit) {
        // Mode edició: carregar dades de l'esdeveniment
        document.getElementById('eventTitle').value = eventToEdit.title || '';
        document.getElementById('eventCategory').value = eventToEdit.category || '';
        document.getElementById('eventDate').value = eventToEdit.date || '';
        document.getElementById('eventTime').value = eventToEdit.time || '10:00';
        document.getElementById('eventEndTime').value = eventToEdit.endTime || '11:00';
        document.getElementById('eventCenter').value = eventToEdit.center || '';
        document.getElementById('eventNotes').value = eventToEdit.notes || '';

        // Mostrar col·laboradors si n'hi ha
        if (eventToEdit.hasCollaborators && eventToEdit.collaboratorsData && eventToEdit.collaboratorsData.list) {
            document.getElementById('collaboratorsFieldsContainer').style.display = 'block';
            renderFriendsList();

            // Marcar els amics seleccionats
            setTimeout(() => {
                eventToEdit.collaboratorsData.list.forEach(friendName => {
                    const friend = userFriends.find(f => f.name === friendName);
                    if (friend) {
                        const checkbox = document.getElementById(`friend-${friend.id}`);
                        if (checkbox) checkbox.checked = true;
                    }
                });
            }, 100);
        } else {
            document.getElementById('collaboratorsFieldsContainer').style.display = 'none';
        }

        updateDurationText();
    } else {
        // Mode creació: valors per defecte
        eventForm.reset();

        // Establir data seleccionada (format local)
        const dateToUse = selectedDate || new Date();
        const year = dateToUse.getFullYear();
        const month = String(dateToUse.getMonth() + 1).padStart(2, '0');
        const day = String(dateToUse.getDate()).padStart(2, '0');
        document.getElementById('eventDate').value = `${year}-${month}-${day}`;

        // Establir hora per defecte
        document.getElementById('eventTime').value = '10:00';
        document.getElementById('eventEndTime').value = '11:00';
        updateDurationText();

        // Netejar títol
        document.getElementById('eventTitle').value = '';

        // Amagar camps de col·laboradors per defecte
        document.getElementById('collaboratorsFieldsContainer').style.display = 'none';
    }

    eventModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Tancar modal d'esdeveniment
function closeEventModal() {
    eventModal.classList.remove('active');
    document.body.style.overflow = '';
    selectedDate = null;
    editingEvent = null;
}

// Gestionar enviament del formulari
function handleEventSubmit(e) {
    e.preventDefault();

    console.log('Formulari enviat');

    const eventTitle = document.getElementById('eventTitle').value.trim();
    const eventCategory = document.getElementById('eventCategory').value.trim();
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const endTime = document.getElementById('eventEndTime').value;
    const center = document.getElementById('eventCenter').value.trim();
    const notes = document.getElementById('eventNotes').value.trim();
    const selectedFriends = getSelectedFriends();
    const hasCollaborators = selectedFriends.length > 0;

    console.log('Dades recollides:', { eventTitle, center, date, time });

    // Validar títol
    if (!eventTitle) {
        modalManager.error('Si us plau, introdueix un títol per l\'esdeveniment.', 'Error');
        document.getElementById('eventTitle').focus();
        return;
    }

    // Validar centre
    if (!center) {
        modalManager.error('Si us plau, introdueix una ubicació.', 'Error');
        document.getElementById('eventCenter').focus();
        return;
    }

    let collaboratorsData = null;

    // Processar dades de col·laboradors
    if (hasCollaborators) {
        collaboratorsData = {
            list: selectedFriends
        };
    }

    if (editingEvent) {
        // Mode edició: actualitzar esdeveniment existent
        const updatedEvent = {
            ...editingEvent,
            title: eventTitle,
            category: eventCategory || '',
            date: date,
            time: time,
            endTime: endTime,
            center: center,
            notes: notes,
            hasCollaborators: hasCollaborators,
            collaboratorsData: collaboratorsData,
            type: hasCollaborators ? 'group-appointment' : editingEvent.type === 'group-appointment' ? 'appointment' : editingEvent.type
        };

        // Eliminar l'esdeveniment antic i afegir l'actualitzat
        UserDataManager.removeCalendarAppointment(editingEvent.id);
        UserDataManager.addCalendarAppointment(updatedEvent);

        // Recarregar tots els esdeveniments
        loadEvents();

        // Actualitzar calendari
        generateCalendar();

        // Tancar modal
        closeEventModal();

        // Mostrar confirmació
        let confirmMessage = `Data: ${new Date(date).toLocaleDateString('ca-ES')}\nHora: ${time}\nCentre: ${center}`;
        if (eventCategory) {
            confirmMessage += `\nCategoria: ${eventCategory}`;
        }
        if (hasCollaborators && collaboratorsData && collaboratorsData.list) {
            confirmMessage += `\n\nCol·laboradors: ${collaboratorsData.list.join(', ')}`;
        }

        modalManager.success(confirmMessage, 'Esdeveniment actualitzat correctament!');
    } else {
        // Mode creació: crear nou esdeveniment
        let eventType = hasCollaborators ? 'group-appointment' : 'appointment';

        const newEvent = {
            id: `event-${Date.now()}`,
            type: eventType,
            title: eventTitle,
            category: eventCategory || '',
            date: date,
            time: time,
            endTime: endTime,
            center: center,
            notes: notes,
            hasCollaborators: hasCollaborators,
            collaboratorsData: collaboratorsData
        };

        // Afegir amb UserDataManager per crear notificació
        UserDataManager.addCalendarAppointment(newEvent);

        // Recarregar tots els esdeveniments
        loadEvents();

        // Actualitzar calendari
        generateCalendar();

        // Tancar modal
        closeEventModal();

        // Mostrar confirmació
        let confirmMessage = `Data: ${new Date(date).toLocaleDateString('ca-ES')}\nHora: ${time}\nCentre: ${center}`;
        if (eventCategory) {
            confirmMessage += `\nCategoria: ${eventCategory}`;
        }
        if (hasCollaborators && collaboratorsData && collaboratorsData.list) {
            confirmMessage += `\n\nCol·laboradors: ${collaboratorsData.list.join(', ')}`;
        }

        modalManager.success(confirmMessage, 'Esdeveniment afegit correctament!');
    }
}

// Mostrar detalls d'un esdeveniment
let currentEventForDeletion = null;

function showEventDetails(event) {
    currentEventForDeletion = event;

    // Parsejar la data correctament en format local (YYYY-MM-DD)
    const [year, month, day] = event.date.split('-').map(Number);
    const eventDate = new Date(year, month - 1, day);
    const dateStr = eventDate.toLocaleDateString('ca-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const content = document.getElementById('eventDetailsContent');
    const modalHeader = document.querySelector('#eventDetailsModal .modal-header');
    const modalTitle = document.getElementById('detailsTitle');

    // Configurar modal segons el tipus d'esdeveniment
    let typeLabel = 'Cita programada';
    let headerClass = 'appointment';
    let titleText = 'Detalls de l\'esdeveniment';
    let showCenter = true;
    let showDonationType = true;

    if (event.type === 'group-appointment') {
        typeLabel = 'Esdeveniment amb col·laboradors';
        headerClass = 'group';
    } else if (event.type === 'donation') {
        typeLabel = 'Donació realitzada';
        headerClass = 'donation';
        titleText = 'Donació completada';
    } else if (event.type === 'available') {
        typeLabel = 'Ja pots tornar a donar!';
        headerClass = 'available';
        titleText = 'Recordatori de disponibilitat';
        showCenter = false;
        showDonationType = false;
    }

    // Actualitzar títol i estil del header
    modalTitle.textContent = titleText;
    modalHeader.className = `modal-header ${headerClass}`;

    content.innerHTML = `
        <div class="event-detail-item">
            <div class="event-detail-info">
                <h4>Tipus</h4>
                <p>${typeLabel}</p>
            </div>
        </div>
        ${event.category ? `
        <div class="event-detail-item">
            <div class="event-detail-info">
                <h4>Categoria</h4>
                <p>${event.category}</p>
            </div>
        </div>
        ` : ''}
        ${event.hasCollaborators && event.collaboratorsData && event.collaboratorsData.list ? `
        <div class="event-detail-item group-highlight">
            <div class="event-detail-info">
                <h4>Col·laboradors</h4>
                <p class="participants-list">${event.collaboratorsData.list.join(', ')}</p>
            </div>
        </div>
        ` : ''}
        <div class="event-detail-item">
            <div class="event-detail-info">
                <h4>Data</h4>
                <p>${dateStr}</p>
            </div>
        </div>
        ${event.time !== '00:00' ? `
        <div class="event-detail-item">
            <div class="event-detail-info">
                <h4>Hora</h4>
                <p>${event.time}</p>
            </div>
        </div>
        ` : ''}
        ${showCenter ? `
        <div class="event-detail-item">
            <div class="event-detail-info">
                <h4>Centre</h4>
                <p>${event.center || 'No especificat'}</p>
            </div>
        </div>
        ` : ''}
        ${showDonationType && event.donationType ? `
        <div class="event-detail-item">
            <div class="event-detail-info">
                <h4>Tipus de donació</h4>
                <p>${event.donationType}</p>
            </div>
        </div>
        ` : ''}
        ${event.notes ? `
        <div class="event-detail-item">
            <div class="event-detail-info">
                <h4>Notes</h4>
                <p>${event.notes}</p>
            </div>
        </div>
        ` : ''}
    `;

    // Mostrar botons editar i eliminar per cites i esdeveniments de disponibilitat (no per donacions reals)
    const deleteBtn = document.getElementById('deleteEventBtn');
    const editBtn = document.getElementById('editEventBtn');

    if (event.type === 'appointment' || event.type === 'group-appointment' || event.type === 'available') {
        deleteBtn.style.display = 'block';
        editBtn.style.display = 'flex';
        // Canviar text del botó segons el tipus
        deleteBtn.textContent = event.type === 'available' ? 'Eliminar recordatori' : 'Eliminar';
    } else {
        deleteBtn.style.display = 'none';
        editBtn.style.display = 'none';
    }

    eventDetailsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Tancar modal de detalls
function closeEventDetails() {
    eventDetailsModal.classList.remove('active');
    document.body.style.overflow = '';
    currentEventForDeletion = null;
}

// Editar esdeveniment actual
function editCurrentEvent() {
    if (!currentEventForDeletion) return;

    // Guardar referència de l'esdeveniment abans de tancar
    const eventToEdit = currentEventForDeletion;

    // Tancar modal de detalls
    closeEventDetails();

    // Obrir modal d'edició amb les dades de l'esdeveniment
    openEventModal(eventToEdit);
}

// Eliminar esdeveniment actual
function deleteCurrentEvent() {
    if (!currentEventForDeletion) return;

    // Personalitzar el missatge segons el tipus d'esdeveniment
    let confirmMessage = 'Estàs segur que vols eliminar aquesta cita?';
    let successMessage = 'La cita s\'ha eliminat correctament del teu calendari.';

    if (currentEventForDeletion.type === 'available') {
        confirmMessage = 'Vols eliminar aquest recordatori de disponibilitat?';
        successMessage = 'El recordatori s\'ha eliminat correctament.';
    }

    // Utilitzar modal de confirmació
    modalManager.confirm(
        confirmMessage,
        'Confirmar eliminació',
        () => {
            // Si l'usuari confirma, eliminar l'esdeveniment
            UserDataManager.removeCalendarAppointment(currentEventForDeletion.id);

            // Recarregar tots els esdeveniments
            loadEvents();

            // Actualitzar calendari
            generateCalendar();

            // Tancar modal de detalls
            closeEventDetails();

            // Mostrar missatge d'èxit
            modalManager.success(successMessage, 'Eliminat correctament');
        },
        () => {
            // Si l'usuari cancel·la, no fer res
        }
    );
}
