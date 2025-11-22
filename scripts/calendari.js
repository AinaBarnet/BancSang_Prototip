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
let legendCategories = [];

// Categories de llegenda per defecte
const DEFAULT_LEGEND_CATEGORIES = [
    { id: 'donation', label: 'Donació realitzada', color: '#d32f2f', visible: true, editable: false, deletable: false },
    { id: 'available', label: 'Notificació per tornar a donar', color: '#388e3c', visible: true, editable: false, deletable: false }
];

// Paleta de colors predefinits
const COLOR_PALETTE = [
    '#d32f2f', '#c62828', '#b71c1c', // Vermells
    '#1976d2', '#1565c0', '#0d47a1', // Blaus
    '#388e3c', '#2e7d32', '#1b5e20', // Verds
    '#ff9800', '#f57c00', '#e65100', // Taronges
    '#9c27b0', '#7b1fa2', '#4a148c', // Morats
    '#00796b', '#004d40', '#009688', // Verds marins
    '#e91e63', '#c2185b', '#880e4f', // Roses
    '#795548', '#5d4037', '#3e2723'  // Marrons
];

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
    loadLegendCategories();
    loadEvents();
    loadDonations();
    loadFriends();
    renderLegend();
    renderCategoryOptions();
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

        modalManager.success(`${friendName} s'ha afegit correctament a la teva llista d'amics!`, 'Amic afegit!');
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

                // Aplicar color personalitzat: si té categoryId, usar-lo; sinó, usar el color del type
                let color;
                if (event.categoryId) {
                    color = getCategoryColor(event.categoryId);
                } else {
                    color = getCategoryColor(event.type);
                }
                eventEl.style.background = `linear-gradient(135deg, ${color} 0%, ${adjustColorBrightness(color, 20)} 100%)`;
                eventEl.style.boxShadow = `0 3px 6px ${color}66`;

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

        // Aplicar color personalitzat: si té categoryId, usar-lo; sinó, usar el color del type
        let color;
        if (event.categoryId) {
            color = getCategoryColor(event.categoryId);
        } else {
            color = getCategoryColor(event.type);
        }
        eventCard.style.borderLeftColor = color;
        eventCard.style.borderColor = `${color}26`;
        eventCard.style.boxShadow = `0 2px 8px ${color}1A`;

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

        // Efecte hover amb color personalitzat
        eventCard.addEventListener('mouseenter', () => {
            eventCard.style.boxShadow = `0 6px 20px ${color}33`;
            eventCard.style.borderColor = `${color}4D`;
        });

        eventCard.addEventListener('mouseleave', () => {
            eventCard.style.boxShadow = `0 2px 8px ${color}1A`;
            eventCard.style.borderColor = `${color}26`;
        });

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

    // Canvi de categoria: actualitzar color del select
    document.getElementById('eventCategory').addEventListener('change', (e) => {
        updateCategorySelectColor(e.target.value);
    });

    // Botó d'ubicació actual
    document.getElementById('useCurrentLocationBtn').addEventListener('click', getCurrentLocation);

    // Modal de detalls
    document.getElementById('closeDetailsBtn').addEventListener('click', closeEventDetails);
    document.getElementById('acceptDetailsBtn').addEventListener('click', closeEventDetails);

    eventDetailsModal.addEventListener('click', (e) => {
        if (e.target === eventDetailsModal) closeEventDetails();
    });

    // Llegenda personalitzable
    document.getElementById('editLegendBtn').addEventListener('click', openLegendModal);
    document.getElementById('closeLegendModalBtn').addEventListener('click', closeLegendModal);
    document.getElementById('saveLegendBtn').addEventListener('click', saveLegendCategories);
    document.getElementById('resetLegendBtn').addEventListener('click', resetLegendToDefault);
    document.getElementById('addLegendItemBtn').addEventListener('click', addNewLegendCategory);

    const legendModal = document.getElementById('legendModal');
    legendModal.addEventListener('click', (e) => {
        if (e.target === legendModal) closeLegendModal();
    });
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

        // Carregar categoria: si és una categoria personalitzada, seleccionar-la; sinó, deixar "Sense categoria"
        const categorySelect = document.getElementById('eventCategory');
        if (eventToEdit.categoryId) {
            categorySelect.value = eventToEdit.categoryId;
            updateCategorySelectColor(eventToEdit.categoryId);
        } else {
            categorySelect.value = '';
            updateCategorySelectColor('');
        }

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

// Obtenir ubicació actual de l'usuari
function getCurrentLocation() {
    const btn = document.getElementById('useCurrentLocationBtn');
    const input = document.getElementById('eventCenter');

    if (!('geolocation' in navigator)) {
        modalManager.error('El teu navegador no suporta geolocalització.', '⚠️ No disponible');
        return;
    }

    // Afegir classe de càrrega
    btn.classList.add('loading');
    btn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;

            try {
                // Intentar obtenir l'adreça amb l'API de Nominatim (OpenStreetMap)
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ca`
                );

                if (response.ok) {
                    const data = await response.json();

                    // Extreure informació rellevant
                    let location = '';
                    if (data.address) {
                        const addr = data.address;
                        // Prioritzar: carrer + ciutat, o nom del lloc, o ciutat, o poble
                        if (addr.road && addr.city) {
                            location = `${addr.road}, ${addr.city}`;
                        } else if (addr.amenity) {
                            location = addr.amenity;
                        } else if (addr.city) {
                            location = addr.city;
                        } else if (addr.town) {
                            location = addr.town;
                        } else if (addr.village) {
                            location = addr.village;
                        } else {
                            location = data.display_name.split(',').slice(0, 2).join(',');
                        }
                    } else {
                        location = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                    }

                    input.value = location;

                    // Afegir animació visual
                    input.style.transition = 'all 0.3s ease';
                    input.style.transform = 'scale(1.02)';
                    input.style.borderColor = '#4caf50';
                    setTimeout(() => {
                        input.style.transform = 'scale(1)';
                        input.style.borderColor = '#e0e0e0';
                    }, 300);

                } else {
                    // Si falla l'API, usar coordenades
                    input.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                }

            } catch (error) {
                console.error('Error obtenint adreça:', error);
                // En cas d'error, usar coordenades
                input.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            } finally {
                btn.classList.remove('loading');
                btn.disabled = false;
            }
        },
        (error) => {
            console.error('Error obtenint ubicació:', error);

            let errorMessage = 'No s\'ha pogut obtenir la teva ubicació.';
            if (error.code === error.PERMISSION_DENIED) {
                errorMessage = 'Has denegat l\'accés a la ubicació. Si vols usar aquesta funció, activa els permisos d\'ubicació al teu navegador.';
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                errorMessage = 'La informació d\'ubicació no està disponible en aquest moment.';
            } else if (error.code === error.TIMEOUT) {
                errorMessage = 'La sol·licitud d\'ubicació ha excedit el temps d\'espera.';
            }

            modalManager.error(errorMessage, 'Error d\'ubicació');

            btn.classList.remove('loading');
            btn.disabled = false;
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}

// Actualitzar color del select de categoria
function updateCategorySelectColor(categoryId) {
    const select = document.getElementById('eventCategory');
    if (!select) return;

    if (!categoryId) {
        // Sense categoria
        select.style.borderColor = '#e0e0e0';
        select.style.backgroundColor = '#fafafa';
        select.style.color = '#333';
        return;
    }

    const category = legendCategories.find(cat => cat.id === categoryId);
    if (category) {
        select.style.borderColor = category.color;
        select.style.backgroundColor = `${category.color}15`;
        select.style.color = category.color;
        select.style.fontWeight = '600';
    }
}

// Gestionar enviament del formulari
function handleEventSubmit(e) {
    e.preventDefault();

    const eventTitle = document.getElementById('eventTitle').value.trim();
    const categoryId = document.getElementById('eventCategory').value;
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const endTime = document.getElementById('eventEndTime').value;
    const center = document.getElementById('eventCenter').value.trim();
    const notes = document.getElementById('eventNotes').value.trim();
    const selectedFriends = getSelectedFriends();
    const hasCollaborators = selectedFriends.length > 0;

    // Obtenir nom de la categoria si n'hi ha
    let categoryLabel = '';
    if (categoryId) {
        const category = legendCategories.find(cat => cat.id === categoryId);
        categoryLabel = category ? category.label : '';
    }

    console.log('Dades recollides:', { eventTitle, center, date, time });

    // Validar títol
    if (!eventTitle) {
        modalManager.error('El títol de l\'esdeveniment és obligatori. Si us plau, introdueix un títol descriptiu.', 'Camp obligatori');
        document.getElementById('eventTitle').focus();
        return;
    }

    // Validar centre
    if (!center) {
        modalManager.error('La ubicació és necessària per identificar el centre de donació. Si us plau, indica on es farà l\'esdeveniment.', 'Ubicació requerida');
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
            categoryId: categoryId || '',
            category: categoryLabel || '',
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
        let confirmMessage = `L'esdeveniment s'ha actualitzat amb èxit:\n\n📅 Data: ${new Date(date).toLocaleDateString('ca-ES')}\n🕐 Hora: ${time}\n📍 Centre: ${center}`;
        if (categoryLabel) {
            confirmMessage += `\n🏷️ Categoria: ${categoryLabel}`;
        }
        if (hasCollaborators && collaboratorsData && collaboratorsData.list) {
            confirmMessage += `\n\n👥 Col·laboradors: ${collaboratorsData.list.join(', ')}`;
        }

        modalManager.success(confirmMessage, 'Esdeveniment actualitzat');
    } else {
        // Mode creació: crear nou esdeveniment
        let eventType = hasCollaborators ? 'group-appointment' : 'appointment';

        const newEvent = {
            id: `event-${Date.now()}`,
            type: eventType,
            title: eventTitle,
            categoryId: categoryId || '',
            category: categoryLabel || '',
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
        let confirmMessage = `L'esdeveniment s'ha creat amb èxit:\n\n📅 Data: ${new Date(date).toLocaleDateString('ca-ES')}\n🕐 Hora: ${time}\n📍 Centre: ${center}`;
        if (categoryLabel) {
            confirmMessage += `\n🏷️ Categoria: ${categoryLabel}`;
        }
        if (hasCollaborators && collaboratorsData && collaboratorsData.list) {
            confirmMessage += `\n\n👥 Col·laboradors: ${collaboratorsData.list.join(', ')}`;
        }

        modalManager.success(confirmMessage, 'Esdeveniment creat');
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
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    });

    const content = document.getElementById('eventDetailsContent');

    // Determinar el títol segons el tipus d'esdeveniment
    let titleText = event.title || 'Esdeveniment';
    if (event.type === 'donation') {
        titleText = 'Donació completada';
    } else if (event.type === 'available') {
        titleText = 'Pots tornar a donar';
    }

    // Construir el contingut amb el nou format
    let detailsHTML = `
        <h2 class="details-title">${titleText}</h2>
        <p class="details-subtitle">L'esdeveniment s'ha actualitzat amb èxit:</p>
        <div class="details-list">
    `;

    // Data i Hora (en la mateixa fila)
    let dateTimeValue = dateStr;
    if (event.time && event.time !== '00:00') {
        dateTimeValue += ` ${event.time}`;
    }
    detailsHTML += `
        <div class="detail-row">
            <span class="detail-icon">📅</span>
            <span class="detail-label">Data:</span>
            <span class="detail-value">${dateTimeValue}</span>
        </div>
    `;

    // Localització (Centre)
    if (event.center) {
        detailsHTML += `
        <div class="detail-row">
            <span class="detail-icon">📍</span>
            <span class="detail-label">Localització:</span>
            <span class="detail-value">${event.center}</span>
        </div>
        `;
    }

    // Categoria
    if (event.category) {
        detailsHTML += `
        <div class="detail-row">
            <span class="detail-icon">🏷️</span>
            <span class="detail-label">Categoria:</span>
            <span class="detail-value">${event.category}</span>
        </div>
        `;
    }

    // Col·laboradors
    if (event.hasCollaborators && event.collaboratorsData && event.collaboratorsData.list && event.collaboratorsData.list.length > 0) {
        detailsHTML += `
        <div class="detail-row">
            <span class="detail-icon">👥</span>
            <span class="detail-label">Col·laboradors:</span>
            <span class="detail-value">${event.collaboratorsData.list.join(', ')}</span>
        </div>
        `;
    }

    // Tipus de donació (si és donació real)
    if (event.type === 'donation' && event.donationType) {
        detailsHTML += `
        <div class="detail-row">
            <span class="detail-icon">💉</span>
            <span class="detail-label">Tipus:</span>
            <span class="detail-value">${event.donationType}</span>
        </div>
        `;
    }

    // Notes
    if (event.notes) {
        detailsHTML += `
        <div class="detail-row">
            <span class="detail-icon">📝</span>
            <span class="detail-label">Notes:</span>
            <span class="detail-value">${event.notes}</span>
        </div>
        `;
    }

    detailsHTML += '</div>';

    // Afegir botons d'acció si l'esdeveniment es pot editar/eliminar
    if (event.type === 'appointment' || event.type === 'group-appointment' || event.type === 'available') {
        detailsHTML += `
        <div class="details-actions">
            <button type="button" class="btn-edit-details" id="editDetailsBtn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Editar
            </button>
            <button type="button" class="btn-delete-details" id="deleteDetailsBtn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                ${event.type === 'available' ? 'Eliminar recordatori' : 'Eliminar'}
            </button>
        </div>
        `;
    }

    content.innerHTML = detailsHTML;

    // Afegir event listeners als botons d'acció dins del modal
    const editDetailsBtn = document.getElementById('editDetailsBtn');
    const deleteDetailsBtn = document.getElementById('deleteDetailsBtn');

    if (editDetailsBtn) {
        editDetailsBtn.addEventListener('click', editCurrentEvent);
    }

    if (deleteDetailsBtn) {
        deleteDetailsBtn.addEventListener('click', deleteCurrentEvent);
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
    let confirmMessage = 'Aquesta acció eliminarà la cita del teu calendari de forma permanent. Vols continuar?';
    let successMessage = 'La cita s\'ha eliminat correctament del teu calendari.';

    if (currentEventForDeletion.type === 'available') {
        confirmMessage = 'Aquesta acció eliminarà el recordatori de disponibilitat. Vols continuar?';
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
            modalManager.success(successMessage, 'Eliminat');
        },
        () => {
            // Si l'usuari cancel·la, no fer res
        }
    );
}
// ============================================
// FUNCIONS PER GESTIONAR LA LLEGENDA
// ============================================

// Carregar categories de llegenda
function loadLegendCategories() {
    try {
        const stored = localStorage.getItem('legendCategories');
        if (stored) {
            legendCategories = JSON.parse(stored);

            // Migració de dades: afegir propietat deletable i actualitzar noms
            legendCategories = legendCategories.map(cat => {
                if (cat.deletable === undefined) {
                    // Categories del sistema no es poden eliminar
                    if (cat.id === 'donation' || cat.id === 'available') {
                        cat.deletable = false;
                    } else {
                        // Resta de categories sí es poden eliminar
                        cat.deletable = true;
                    }
                }

                // Actualitzar noms de categories del sistema
                if (cat.id === 'donation' && cat.label !== 'Donació realitzada') {
                    cat.label = 'Donació realitzada';
                }
                if (cat.id === 'available' && cat.label !== 'Notificació per tornar a donar') {
                    cat.label = 'Notificació per tornar a donar';
                }

                return cat;
            });

            // Guardar la migració
            saveLegendToStorage();
        } else {
            legendCategories = JSON.parse(JSON.stringify(DEFAULT_LEGEND_CATEGORIES));
            saveLegendToStorage();
        }
    } catch (error) {
        console.error('Error carregant categories de llegenda:', error);
        legendCategories = JSON.parse(JSON.stringify(DEFAULT_LEGEND_CATEGORIES));
    }
}

// Guardar categories al localStorage
function saveLegendToStorage() {
    try {
        localStorage.setItem('legendCategories', JSON.stringify(legendCategories));
    } catch (error) {
        console.error('Error guardant categories de llegenda:', error);
    }
}

// Renderitzar llegenda
function renderLegend() {
    const container = document.getElementById('legendItems');
    if (!container) return;

    const visibleCategories = legendCategories.filter(cat => cat.visible);

    if (visibleCategories.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 1rem;">No hi ha categories visibles</p>';
        return;
    }

    container.innerHTML = visibleCategories.map(category => `
        <div class="legend-item" data-category-id="${category.id}">
            <span class="legend-color" style="background: ${category.color};"></span>
            <span>${category.label}</span>
        </div>
    `).join('');
}

// Renderitzar opcions de categoria al select
function renderCategoryOptions() {
    const select = document.getElementById('eventCategory');
    if (!select) return;

    // Filtrar categories visibles i editables (exclou les del sistema com donacions i notificacions)
    const userCategories = legendCategories.filter(cat => cat.visible && cat.id !== 'donation' && cat.id !== 'available');

    // Mantenir l'opció "Sense categoria"
    const optionsHTML = userCategories.map(category => `
        <option value="${category.id}" data-color="${category.color}">${category.label}</option>
    `).join('');

    select.innerHTML = '<option value="">Sense categoria</option>' + optionsHTML;
}

// Obrir modal d'edició de llegenda
function openLegendModal() {
    renderLegendEditItems();
    document.getElementById('legendModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Tancar modal de llegenda
function closeLegendModal() {
    document.getElementById('legendModal').classList.remove('active');
    document.body.style.overflow = '';
}

// Renderitzar items editables de llegenda
function renderLegendEditItems() {
    const container = document.getElementById('legendEditContainer');

    container.innerHTML = legendCategories.map((category, index) => `
        <div class="legend-edit-item ${!category.visible ? 'hidden' : ''}" data-index="${index}">
            <div class="legend-color-picker-wrapper">
                <input type="color" 
                       value="${category.color}" 
                       class="legend-color-picker" 
                       data-index="${index}"
                       ${!category.editable ? 'disabled' : ''}>
            </div>
            <input type="text" 
                   value="${category.label}" 
                   class="legend-edit-input" 
                   data-index="${index}"
                   ${!category.editable ? 'disabled' : ''}
                   placeholder="Nom de la categoria">
            <div class="legend-actions">
                <button type="button" class="legend-action-btn hidden-btn ${category.visible ? '' : 'active'}" 
                        data-index="${index}" 
                        title="${category.visible ? 'Amagar' : 'Mostrar'}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        ${category.visible ?
            '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>' :
            '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>'
        }
                    </svg>
                </button>
                ${category.deletable !== false ? `
                <button type="button" class="legend-action-btn delete-btn" 
                        data-index="${index}"
                        title="Eliminar categoria">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
                ` : ''}
            </div>
        </div>
    `).join('');

    // Afegir event listeners
    container.querySelectorAll('.legend-color-picker').forEach(picker => {
        picker.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            legendCategories[index].color = e.target.value;
        });
    });

    container.querySelectorAll('.legend-edit-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            legendCategories[index].label = e.target.value;
        });
    });

    container.querySelectorAll('.hidden-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            legendCategories[index].visible = !legendCategories[index].visible;
            renderLegendEditItems();
        });
    });

    container.querySelectorAll('.delete-btn').forEach((btn, btnIndex) => {
        console.log(`Botó eliminar ${btnIndex} afegit per categoria amb index:`, btn.dataset.index);

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const index = parseInt(this.dataset.index);
            const category = legendCategories[index];

            console.log('Clic al botó eliminar. Index:', index, 'Categoria:', category);

            if (!category) {
                console.error('Categoria no trobada!');
                modalManager.error('No s\'ha pogut trobar la categoria seleccionada. Si us plau, torna-ho a intentar.', 'Error');
                return;
            }

            if (category.deletable === false) {
                modalManager.error('Aquesta categoria és essencial per al sistema i no es pot eliminar. Si no vols que aparegui, pots amagar-la utilitzant el botó de visibilitat.', 'Categoria protegida');
                return;
            }

            const categoryLabel = category.label;

            // Comptar esdeveniments associats a aquesta categoria
            const categoryIdToDelete = category.id;
            const eventsWithCategory = events.filter(event => event.categoryId === categoryIdToDelete);
            const eventsCount = eventsWithCategory.length;

            let confirmMessage = `Aquesta acció eliminarà permanentment la categoria "${categoryLabel}".`;
            if (eventsCount > 0) {
                confirmMessage += `\n\nATENCIÓ: Això també eliminarà ${eventsCount} esdeveniment(s) associat(s) a aquesta categoria.`;
            }
            confirmMessage += '\n\nVols continuar?';

            modalManager.confirm(
                confirmMessage,
                'Confirmar eliminació',
                () => {
                    console.log('Confirmada eliminació de categoria:', categoryLabel);

                    // Eliminar esdeveniments que tenen aquesta categoria
                    if (eventsCount > 0) {
                        eventsWithCategory.forEach(event => {
                            UserDataManager.removeCalendarAppointment(event.id);
                        });

                        // Recarregar esdeveniments
                        loadEvents();
                        console.log(`${eventsCount} esdeveniment(s) eliminat(s)`);
                    }

                    // Eliminar la categoria
                    legendCategories.splice(index, 1);
                    saveLegendToStorage();
                    renderLegendEditItems();

                    // Actualitzar calendari i llista
                    generateCalendar();

                    let message = `La categoria "${categoryLabel}" s'ha eliminat correctament.`;
                    if (eventsCount > 0) {
                        message += `\n\nS'han eliminat ${eventsCount} esdeveniment(s) associat(s).`;
                    }
                    modalManager.success(message, 'Categoria eliminada');
                },
                () => {
                    console.log('Cancel·lada eliminació de categoria:', categoryLabel);
                }
            );
        });
    });
}

// Afegir nova categoria de llegenda
function addNewLegendCategory() {
    const newCategory = {
        id: `custom-${Date.now()}`,
        label: 'Nova categoria',
        color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
        visible: true,
        editable: true,
        deletable: true
    };

    legendCategories.push(newCategory);
    renderLegendEditItems();

    // Scroll fins al final
    const container = document.getElementById('legendEditContainer');
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
        // Focus al darrer input
        const inputs = container.querySelectorAll('.legend-edit-input');
        if (inputs.length > 0) {
            inputs[inputs.length - 1].focus();
            inputs[inputs.length - 1].select();
        }
    }, 100);
}

// Guardar canvis de la llegenda
function saveLegendCategories() {
    // Validar que totes les categories tinguin nom
    const invalidCategories = legendCategories.filter(cat => !cat.label.trim());
    if (invalidCategories.length > 0) {
        modalManager.error('Cada categoria necessita un nom per poder identificar-la. Si us plau, assigna un nom a totes les categories abans de desar.', 'Validació de categories');
        return;
    }

    saveLegendToStorage();
    renderLegend();
    renderCategoryOptions();
    generateCalendar();
    closeLegendModal();
    modalManager.success('Les teves categories s\'han desat correctament. El calendari s\'ha actualitzat amb els nous colors i etiquetes.', 'Categories desades');
}

// Restaurar llegenda per defecte
function resetLegendToDefault() {
    modalManager.confirm(
        'Aquesta acció restaurarà la llegenda als valors per defecte i eliminarà totes les teves categories personalitzades.\n\nAquesta acció no es pot desfer.\n\nVols continuar?',
        'Restaurar valors per defecte',
        () => {
            legendCategories = JSON.parse(JSON.stringify(DEFAULT_LEGEND_CATEGORIES));
            saveLegendToStorage();
            renderLegendEditItems();
            renderCategoryOptions();
            modalManager.success('La llegenda s\'ha restaurat correctament als valors per defecte. Les categories personalitzades s\'han eliminat.', 'Llegenda restaurada');
        }
    );
}

// Obtenir color d'una categoria
function getCategoryColor(categoryId) {
    const category = legendCategories.find(cat => cat.id === categoryId);
    return category ? category.color : '#999999';
}

// Ajustar brillantor d'un color (útil per gradients)
function adjustColorBrightness(hex, percent) {
    // Convertir hex a RGB
    const num = parseInt(hex.replace('#', ''), 16);
    const r = (num >> 16) + percent;
    const g = ((num >> 8) & 0x00FF) + percent;
    const b = (num & 0x0000FF) + percent;

    // Assegurar que els valors estiguin entre 0-255
    const newR = Math.max(0, Math.min(255, r));
    const newG = Math.max(0, Math.min(255, g));
    const newB = Math.max(0, Math.min(255, b));

    // Convertir de nou a hex
    return '#' + ((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0');
}