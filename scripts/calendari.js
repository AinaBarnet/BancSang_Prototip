// Protegir la pàgina - requerir autenticació
if (!AuthManager.requireAuth()) {
    throw new Error('Accés no autoritzat');
}

// Variables globals
let currentDate = new Date();
let selectedDate = null;
let events = [];

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

    // Modal de detalls
    document.getElementById('closeDetailsBtn').addEventListener('click', closeEventDetails);
    document.getElementById('closeDetailsActionBtn').addEventListener('click', closeEventDetails);

    eventDetailsModal.addEventListener('click', (e) => {
        if (e.target === eventDetailsModal) closeEventDetails();
    });

    // Botó eliminar
    document.getElementById('deleteEventBtn').addEventListener('click', deleteCurrentEvent);
}

// Obrir modal d'esdeveniment
function openEventModal() {
    eventForm.reset();

    // Establir data seleccionada (format local)
    const dateToUse = selectedDate || new Date();
    const year = dateToUse.getFullYear();
    const month = String(dateToUse.getMonth() + 1).padStart(2, '0');
    const day = String(dateToUse.getDate()).padStart(2, '0');
    document.getElementById('eventDate').value = `${year}-${month}-${day}`;

    // Establir hora per defecte
    document.getElementById('eventTime').value = '10:00';

    eventModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Tancar modal d'esdeveniment
function closeEventModal() {
    eventModal.classList.remove('active');
    document.body.style.overflow = '';
    selectedDate = null;
}

// Gestionar enviament del formulari
function handleEventSubmit(e) {
    e.preventDefault();

    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const center = document.getElementById('eventCenter').value;
    const type = document.getElementById('eventType').value;
    const notes = document.getElementById('eventNotes').value;

    // Crear nou esdeveniment
    const newEvent = {
        id: `event-${Date.now()}`,
        type: 'appointment',
        title: `Cita: ${type}`,
        date: date,
        time: time,
        center: center,
        donationType: type,
        notes: notes
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
    modalManager.success(`Data: ${new Date(date).toLocaleDateString('ca-ES')}\nHora: ${time}\nCentre: ${center}`, '✅ Cita afegida correctament!');
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

    let typeIcon = '📅';
    let typeLabel = 'Cita programada';

    if (event.type === 'donation') {
        typeIcon = '🩸';
        typeLabel = 'Donació realitzada';
    } else if (event.type === 'available') {
        typeIcon = '✅';
        typeLabel = 'Disponible per donar';
    }

    content.innerHTML = `
        <div class="event-detail-item">
            <div class="event-detail-icon">${typeIcon}</div>
            <div class="event-detail-info">
                <h4>Tipus</h4>
                <p>${typeLabel}</p>
            </div>
        </div>
        <div class="event-detail-item">
            <div class="event-detail-icon">📅</div>
            <div class="event-detail-info">
                <h4>Data</h4>
                <p>${dateStr}</p>
            </div>
        </div>
        ${event.time !== '00:00' ? `
        <div class="event-detail-item">
            <div class="event-detail-icon">🕐</div>
            <div class="event-detail-info">
                <h4>Hora</h4>
                <p>${event.time}</p>
            </div>
        </div>
        ` : ''}
        <div class="event-detail-item">
            <div class="event-detail-icon">🏥</div>
            <div class="event-detail-info">
                <h4>Centre</h4>
                <p>${event.center || 'No especificat'}</p>
            </div>
        </div>
        ${event.donationType ? `
        <div class="event-detail-item">
            <div class="event-detail-icon">💉</div>
            <div class="event-detail-info">
                <h4>Tipus de donació</h4>
                <p>${event.donationType}</p>
            </div>
        </div>
        ` : ''}
        ${event.notes ? `
        <div class="event-detail-item">
            <div class="event-detail-icon">📝</div>
            <div class="event-detail-info">
                <h4>Notes</h4>
                <p>${event.notes}</p>
            </div>
        </div>
        ` : ''}
    `;

    // Mostrar botó eliminar només per cites (no per donacions passades)
    const deleteBtn = document.getElementById('deleteEventBtn');
    if (event.type === 'appointment') {
        deleteBtn.style.display = 'block';
    } else {
        deleteBtn.style.display = 'none';
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

// Eliminar esdeveniment actual
function deleteCurrentEvent() {
    if (!currentEventForDeletion) return;

    const confirmed = confirm('Estàs segur que vols eliminar aquesta cita?');
    if (!confirmed) return;

    // Eliminar esdeveniment amb UserDataManager
    UserDataManager.removeCalendarAppointment(currentEventForDeletion.id);

    // Recarregar tots els esdeveniments
    loadEvents();

    // Actualitzar calendari
    generateCalendar();

    // Tancar modal
    closeEventDetails();

    modalManager.success('La cita s\'ha eliminat correctament del teu calendari.', '✅ Cita eliminada');
}
