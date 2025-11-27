async function getAppointmentChange() {
    const token = localStorage.getItem('jwt');
    if (!token) {
        alert("Vous devez être connecté pour accéder au rendez-vous à modifier.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/api/appointment/change', {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Impossible de récupérer le rendez-vous à modifier.');
        const results = await response.json();
        filterResults(results);
    } catch (error) {
        console.error(error);
        alert("Erreur lors du chargement des résultats.");
    }
}

function parseDateAndTime(dateStr, timeStr) {
    const [y, m, d] = (dateStr || '').split('-').map(Number);
    const [hh, mm] = (timeStr || '00:00').split(':').map(Number);
    const dayAtMidnight = new Date(y, m - 1, d, 0, 0, 0, 0);
    const fullDateTime = new Date(y, m - 1, d, hh || 0, mm || 0, 0, 0);
    return { dayAtMidnight, fullDateTime };
}

function getWeekDates(offset = 0) {
    const today = new Date();
    const day = today.getDay();
    const mondayOffset = (day === 0) ? -6 : (1 - day);
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset + offset * 7);
    const week = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        week.push(d.toISOString().split('T')[0]);
    }
    return week;
}

function escapeHtml(string) {
    if (!string) return '';
    return String(string)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getDoctorResult(item, requestedId) {
    const container = document.createElement('div');
    const doctor = item.doctor || {};
    const center = doctor.center || {};
    const appointment = item.appointment || {};
    const slot = item.slot || {};
    const key = `${doctor.firstname ?? ''}-${doctor.lastname ?? ''}-${center.name ?? ''}`;

    const doctorInfo = document.createElement('div');
    doctorInfo.className = 'doctorInfo';

    let formattedDate = slot.startDate ? new Date(slot.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
    let formattedTime = slot.startTime ? slot.startTime.replace(':', 'h') : '—';

    doctorInfo.innerHTML = `
        <h2>Dr ${escapeHtml(doctor.firstname || '')} ${escapeHtml(doctor.lastname || '')}</h2>
        <h3>Le ${formattedDate} à ${formattedTime}</h3>
        <div class="gridResults">
            <img class="grid1 icon" src="../images/icons/Icon_localization.png" alt="Icon localization">
            <p class="grid2">${escapeHtml(center.name || '—')}<br>${escapeHtml(center.address || '')}</p>
            <img class="grid3 icon" src="../images/icons/Icon_specialty.png" alt="Icon treatments">
            <div class="grid4" id="listTreatment-${key.replace(/\s+/g,'-')}"></div>
        </div>
    `;

    const treatments = Array.isArray(appointment.treatments) ? appointment.treatments : [];
    const listContainer = doctorInfo.querySelector(`#listTreatment-${key.replace(/\s+/g,'-')}`);
    const ul = document.createElement('ul');

    if (appointment && requestedId !== null && requestedId === appointment.id) {
        if (treatments.length > 0) {
            treatments.forEach(t => {
                const li = document.createElement('li');
                li.textContent = `${t.name} (${t.duration ?? '—'} min)`;
                ul.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'Aucun traitement associé';
            ul.appendChild(li);
        }
    } else {
        const li = document.createElement('li');
        li.textContent = 'Traitements non affichés pour ce rendez-vous';
        ul.appendChild(li);
    }

    listContainer.appendChild(ul);
    container.appendChild(doctorInfo);
    return container;
}

function setDoctorCalendar(item) {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) {
        console.error("Element '#calendarGrid' introuvable");
        return null;
    }

    const doctor = item.doctor || {};
    const center = doctor.center || {};
    const key = `${doctor.firstname ?? ''}-${doctor.lastname ?? ''}-${center.name ?? ''}`;

    if (!window.doctorWeekOffsets) window.doctorWeekOffsets = new Map();
    if (!window.doctorSlots) window.doctorSlots = new Map();

    window.doctorWeekOffsets.set(key, 0);
    window.doctorSlots.set(key, {});

    const calendar = document.createElement('div');
    calendar.className = 'calendar';

    const buttonPrev = document.createElement('button');
    buttonPrev.className = 'button prev';
    buttonPrev.innerHTML = `<img class="icon" src="../images/icons/Icon_LeftArrow.png">`;

    const buttonNext = document.createElement('button');
    buttonNext.className = 'button next';
    buttonNext.innerHTML = `<img class="icon" src="../images/icons/Icon_RightArrow.png">`;

    const grid = document.createElement('div');
    grid.className = 'gridCalendar';
    grid.id = `gridCalendar-${key}`;

    calendar.appendChild(buttonPrev);
    calendar.appendChild(grid);
    calendar.appendChild(buttonNext);
    calendarGrid.appendChild(calendar);

    function updateWeekGrid() {
        const offset = window.doctorWeekOffsets.get(key) || 0;
        const weekDates = getWeekDates(offset);
        const slotsByDate = window.doctorSlots.get(key);
        grid.innerHTML = '';

        const now = new Date();
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0,0,0,0);

        weekDates.forEach(date => {
            const col = document.createElement('div');
            col.className = 'day-col';

            const dateObj = new Date(date);
            const dayName = dateObj.toLocaleDateString('fr-FR', { weekday: 'short' });
            const dayMonth = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });

            const title = document.createElement('div');
            title.className = 'day-title';
            title.innerHTML = `${dayName}<br><small>${dayMonth}</small>`;
            col.appendChild(title);

            const slots = slotsByDate[date] || [];
            if (slots.length === 0) {
                const no = document.createElement('div');
                no.className = 'no-slot';
                no.textContent = '—';
                col.appendChild(no);
            } else {
                slots.forEach(s => {
                    const t = document.createElement('button');
                    t.className = 'slotButton';
                    const time = s.startTime.slice(0, 5);
                    t.textContent = time;

                    const { dayAtMidnight, fullDateTime } = parseDateAndTime(date, s.startTime);
                    if (dayAtMidnight < todayMidnight || (dayAtMidnight.getTime() === todayMidnight.getTime() && fullDateTime <= now)) {
                        t.disabled = true;
                        t.classList.add('pastSlot');
                    }

                    col.appendChild(t);
                });
            }

            grid.appendChild(col);
        });
    }

    calendar.updateWeekGrid = updateWeekGrid;

    buttonPrev.addEventListener('click', () => {
        window.doctorWeekOffsets.set(key, window.doctorWeekOffsets.get(key) - 1);
        updateWeekGrid();
    });

    buttonNext.addEventListener('click', () => {
        window.doctorWeekOffsets.set(key, window.doctorWeekOffsets.get(key) + 1);
        updateWeekGrid();
    });

    return calendar;
}

function getDoctorCalendar(slotItem, appointmentItem) {
    const doctor = slotItem.doctor || {};
    const center = doctor.center || {};
    const slot = slotItem.slot || {};
    const key = `${doctor.firstname ?? ''}-${doctor.lastname ?? ''}-${center.name ?? ''}`;

    if (!window.doctorSlots.has(key)) {
        console.warn("setDoctorCalendar doit être appelé avant getDoctorCalendar");
        return;
    }

    const slotsByDate = window.doctorSlots.get(key);
    if (!slotsByDate[slot.startDate]) slotsByDate[slot.startDate] = [];
    slotsByDate[slot.startDate].push(slot);

    const calendar = document.querySelector(`.calendar .gridCalendar[id="gridCalendar-${key}"]`)?.parentElement;
    if (calendar && calendar.updateWeekGrid) calendar.updateWeekGrid();
}

function renderResults(results, allResults) {
    const container = document.getElementById('rdv');
    if (!container) return;

    container.innerHTML = '<h2>Votre rendez-vous</h2>';
    if (!Array.isArray(results) || results.length === 0) {
        container.innerHTML += '<p>Aucun résultat correspondant à votre rendez-vous.</p>';
        return;
    }

    const requestedId = new URLSearchParams(window.location.search).get('id');
    results.forEach(item => {
        const node = getDoctorResult(item, requestedId ? parseInt(requestedId,10) : null);
        container.appendChild(node);
    });

    const calendar = setDoctorCalendar(results[0]);

    allResults.forEach(item => getDoctorCalendar(item));

    calendar.updateWeekGrid();
}

function filterResults(results) {
    const requestedId = new URLSearchParams(window.location.search).get('id');
    const filtered = results.filter(item => requestedId ? item.appointment?.id == requestedId : true);
    renderResults(filtered, results);
}
