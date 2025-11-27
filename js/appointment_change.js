async function getAppointmentChange() {
    const token = localStorage.getItem('jwt');

    if (!token) {
        alert("Vous devez être connecté pour accéder au rendez-vous à modifier.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/api/appointment/change', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Impossible de récupérer le rendez-vous à modifier.');
        }

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

function getDoctorResult(item) {
    const container = document.createElement('div');

    const doctor = item.doctor || {};
    const center = doctor.center || {};
    const appointment = item.appointment || {};
    const slot = item.slot || {};
    const key = `${doctor.firstname ?? ''}-${doctor.lastname ?? ''}-${center.name ?? ''}`;

    if (!window.doctorWeekOffsets) window.doctorWeekOffsets = new Map();
    if (!window.doctorWeekOffsets.has(key)) window.doctorWeekOffsets.set(key, 0);

    const doctorInfo = document.createElement('div');
    doctorInfo.className = 'doctorInfo';
    
    let formattedDate = '—';
    if (slot.startDate) {
        const dateObj = new Date(slot.startDate);
        formattedDate = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    let formattedTime = slot.startTime ?? '—';
    if (slot.startTime) {
        const [hh, mm] = slot.startTime.split(':');
        formattedTime = `${hh}h${mm}`;
    }

    doctorInfo.innerHTML = `
        <h2>Dr ${escapeHtml(doctor.firstname || '')} ${escapeHtml(doctor.lastname || '')}</h2>
        <h3>Le ${formattedDate ?? '—'} à ${formattedTime ?? '—'}</h3>
        <div class="gridResults">
            <img class="grid1 icon" src="../images/icons/Icon_localization.png" alt="Icon localization">
            <p class="grid2">${escapeHtml(center.name || '—')}<br>${escapeHtml(center.address || '')}</p>
            <img class="grid3 icon" src="../images/icons/Icon_specialty.png" alt="Icon treatments">
            <div class="grid4" id="listTreatment-${key.replace(/\s+/g,'-')}"></div>
        </div>
    `;

    const treatments = Array.isArray(appointment.treatments) ? appointment.treatments : [];
    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get('id') ? parseInt(params.get('id'), 10) : null;

    const listContainer = doctorInfo.querySelector(`#listTreatment-${key.replace(/\s+/g,'-')}`);
    const ul = document.createElement('ul');
    if (appointment && requestedId !== null && requestedId === appointment.id) {
        if (treatments.length > 0) {
            treatments.forEach((treatment) => {
                const li = document.createElement('li');
                li.textContent = `${treatment.name} (${treatment.duration ?? '—'} min)`;
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

function getDoctorCalendar(item) {
    const calendarGrid = document.getElementById('calendarGrid');

    if (!calendarGrid) {
        console.error("Element '#calendarGrid' introuvable");
        return null;
    }

    const doctor = item.doctor || {};
    const center = doctor.center || {};
    const slot = item.slot || {};
    const key = `${doctor.firstname ?? ''}-${doctor.lastname ?? ''}-${center.name ?? ''}`;
    const treatments = Array.isArray(item.appointment?.treatments) ? item.appointment.treatments : [];

    if (!window.doctorWeekOffsets) window.doctorWeekOffsets = new Map();
    if (!window.doctorWeekOffsets.has(key)) window.doctorWeekOffsets.set(key, 0);

    const calendar = document.createElement('div');
    calendar.className = 'calendar';
    const buttonPrevious = document.createElement('button');
    buttonPrevious.className = 'button prev';
    const imgPrev = document.createElement('img');
    imgPrev.className = 'icon';
    imgPrev.src = "../images/icons/Icon_LeftArrow.png";
    buttonPrevious.appendChild(imgPrev);

    const buttonNext = document.createElement('button');
    buttonNext.className = 'button next';
    const imgNext = document.createElement('img');
    imgNext.className = 'icon';
    imgNext.src = "../images/icons/Icon_RightArrow.png";
    buttonNext.appendChild(imgNext);

    const grid = document.createElement('div');
    grid.className = 'gridCalendar';
    calendar.appendChild(buttonPrevious);
    calendar.appendChild(grid);
    calendar.appendChild(buttonNext);

    const slotsByDate = {};
    if (slot && slot.startDate) {
        slotsByDate[slot.startDate] = [slot];
    }

    function updateWeekGrid() {
        const offset = window.doctorWeekOffsets.get(key) || 0;
        const weekDates = getWeekDates(offset);
        grid.innerHTML = '';

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
                    const time = (s.startTime || '').slice(0, 5);
                    t.textContent = time || '—';
                    t.dataset.date = date;
                    t.dataset.time = time;
                    t.dataset.doctorName = `${doctor.firstname ?? ''} ${doctor.lastname ?? ''}`;
                    t.dataset.centerName = center.name ?? '';
                    if (s.id) t.dataset.slotId = s.id;

                    const { dayAtMidnight, fullDateTime } = parseDateAndTime(date, time);
                    const now = new Date();
                    const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0,0,0,0);

                    if (dayAtMidnight.getTime() < todayDay.getTime() || 
                        (dayAtMidnight.getTime() === todayDay.getTime() && fullDateTime.getTime() <= now.getTime())) {
                        t.classList.add("pastSlot");
                        t.disabled = true;
                    }

                    t.addEventListener('click', () => {
                        if (t.disabled) return;
                        const chosenTreatment = treatments.length > 0 ? treatments[0].name : '';
                        const params = new URLSearchParams({
                            doctor: t.dataset.doctorName,
                            center: t.dataset.centerName,
                            date: t.dataset.date,
                            time: t.dataset.time,
                            treatment: chosenTreatment
                        });
                        window.location.href = `appointment_confirmation.html?${params.toString()}`;
                    });

                    col.appendChild(t);
                });
            }

            grid.appendChild(col);
        });
    }

    buttonPrevious.addEventListener('click', () => {
        const offset = window.doctorWeekOffsets.get(key) || 0;
        window.doctorWeekOffsets.set(key, offset - 1);
        updateWeekGrid();
    });

    buttonNext.addEventListener('click', () => {
        const offset = window.doctorWeekOffsets.get(key) || 0;
        window.doctorWeekOffsets.set(key, offset + 1);
        updateWeekGrid();
    });

    updateWeekGrid();

    return calendar;
}

function renderResults(results, allResults) {
    const container = document.getElementById('rdv');
    if (!container) {
        console.error("Element '#rdv' introuvable dans le DOM.");
        return;
    }

    container.innerHTML = '<h2>Votre rendez-vous</h2>';

    if (!Array.isArray(results) || results.length === 0) {
        container.innerHTML = '<h2>Votre rendez-vous</h2><p>Aucun résultat correspondant à votre rendez-vous.</p>';
        return;
    }

    results.forEach(item => {
        const resultNode = getDoctorResult(item);
        container.appendChild(resultNode);
    });

    allResults.forEach (item => {
        const allResultNode = getDoctorCalendar(item);
        calendarGrid.appendChild(allResultNode);
    });
}

function filterResults(results) {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    const filteredResultsAppointment = results.filter(item => {
        let match = true;
        if (id) match = match && item.appointment?.id == id;
        return match;
    });

    const allResults = results;

    renderResults(filteredResultsAppointment, allResults);
}