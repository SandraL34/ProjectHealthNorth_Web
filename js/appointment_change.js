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

        if (!response.ok) throw new Error('Impossible de récupérer le rendez-vous à modifier.');

        const results = await response.json();
        filterResults(results);

    } catch (error) {
        console.error(error);
        alert("Erreur lors du chargement des résultats.");
    }
}

function getWeekDates(offset = 0) {
    const today = new Date();
    const day = today.getDay();
    const mondayOffset = (day === 0) ? -6 : (1 - day);
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset + offset * 7);

    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d.toISOString().split('T')[0];
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}

function renderDoctorInfo(item) {
    const doctor = item.doctor || {};
    const center = doctor.center || {};
    const slot = item.slot || {};
    const key = `${doctor.firstname}-${doctor.lastname}-${center.name}`;

    const container = document.createElement('div');
    container.className = 'doctorInfo';

    const dateStr = slot.startDate ? new Date(slot.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
    const timeStr = slot.startTime ? slot.startTime.slice(0,5).replace(":", "h") : '—';

    container.innerHTML = `
        <h2>Dr ${escapeHtml(doctor.firstname)} ${escapeHtml(doctor.lastname)}</h2>
        <h3>Le ${dateStr} à ${timeStr}</h3>
        <div class="gridResults">
            <img class="grid1 icon" src="../images/icons/Icon_localization.png" alt="Icon localization">
            <p class="grid2">${escapeHtml(center.name)}<br>${escapeHtml(center.address)}</p>
            <img class="grid3 icon" src="../images/icons/Icon_specialty.png" alt="Icon treatments">
            <div class="grid4" id="listTreatment-${key.replace(/\s+/g,'-')}">
                <ul><li>Aucun traitement associé</li></ul>
            </div>
        </div>
    `;
    return container;
}

function initDoctorCalendar(firstItem, allResults) {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;

    const doctor = firstItem.doctor || {};
    const center = doctor.center || {};
    const key = `${doctor.firstname}-${doctor.lastname}-${center.name}`;

    if (!window.doctorWeekOffsets) window.doctorWeekOffsets = new Map();
    if (!window.doctorSlots) window.doctorSlots = new Map();

    window.doctorWeekOffsets.set(key, 0);
    window.doctorSlots.set(key, {});

    // regrouper tous les slots du même médecin
    allResults.forEach(item => {
        if (!item.doctor) return;
        const d = item.doctor;
        const c = d.center;
        const k = `${d.firstname}-${d.lastname}-${c.name}`;
        if (k !== key) return; // on ne garde que le médecin du rendez-vous filtré

        if (!window.doctorSlots.get(key)[item.slot.startDate]) 
            window.doctorSlots.get(key)[item.slot.startDate] = [];

        window.doctorSlots.get(key)[item.slot.startDate].push(item.slot);
    });

    // création du calendrier
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
        const offset = window.doctorWeekOffsets.get(key);
        const weekDates = getWeekDates(offset);
        const slotsByDate = window.doctorSlots.get(key);
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
                    const btn = document.createElement('button');
                    btn.className = 'slotButton';
                    btn.textContent = s.startTime.slice(0,5);
                    col.appendChild(btn);
                });
            }

            grid.appendChild(col);
        });
    }

    buttonPrev.addEventListener('click', () => {
        window.doctorWeekOffsets.set(key, window.doctorWeekOffsets.get(key)-1);
        updateWeekGrid();
    });

    buttonNext.addEventListener('click', () => {
        window.doctorWeekOffsets.set(key, window.doctorWeekOffsets.get(key)+1);
        updateWeekGrid();
    });

    // première mise à jour
    updateWeekGrid();
}

function renderResults(filteredResults, allResults) {
    const container = document.getElementById('rdv');
    if (!container) return;

    container.innerHTML = '<h2>Votre rendez-vous</h2>';
    filteredResults.forEach(item => {
        const node = renderDoctorInfo(item);
        container.appendChild(node);
    });

    if (filteredResults.length > 0) {
        initDoctorCalendar(filteredResults[0], allResults);
    }
}

function filterResults(results) {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    const filteredResults = results.filter(item => item.appointment?.id == id);
    renderResults(filteredResults, results);
}