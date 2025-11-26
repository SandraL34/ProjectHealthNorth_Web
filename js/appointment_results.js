async function getAppointmentResults() {
    const token = localStorage.getItem('jwt');

    if (!token) {
        alert("Vous devez être connecté pour accéder à vos résultats.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/api/appointment/results', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Impossible de récupérer les résultats.');
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


function groupByDoctor(results) {
    const doctors = {};
    results.forEach(item => {
        const doctor = item.doctor || {};
        const key = `${doctor.firstname ?? 'prénom médecin inconnu'}-${doctor.lastname ?? 'nom médecin inconnu'}-
        ${(doctor.center && doctor.center.name) ? doctor.center.name : 'centre inconnu'}`;

        if (!doctors[key]) {
            doctors[key] = {
                doctor: doctor,
                slots: {}
            };
        }

        if (item.slot && item.slot.startDate) {
            const date = item.slot.startDate;
            if (!doctors[key].slots[date]) doctors[key].slots[date] = [];
            doctors[key].slots[date].push(item.slot);
        }
    });

    return doctors;
}

const doctorWeekOffsets = new Map();

function getDoctorResult(key, data) {
    const container = document.createElement('div');
    container.classList.add('result');

    const doctor = data.doctor || {};
    const center = doctor.center || {};

    if (!window.doctorWeekOffsets) window.doctorWeekOffsets = new Map();
    if (!window.doctorWeekOffsets.has(key)) window.doctorWeekOffsets.set(key, 0);

    const doctorInfo = document.createElement('div');
    doctorInfo.className = 'doctorInfo';

    doctorInfo.innerHTML = 
        `<h2>Dr ${escapeHtml(doctor.firstname || '')} ${escapeHtml(doctor.lastname || '')}</h2>
        <div class="gridResults">
            <img class="grid1 icon" src="../images/icons/Icon_localization.png" alt="Icon localization">
            <p class="grid2">${escapeHtml(center.name || '—')}<br>${escapeHtml(center.address || '')}</p>
            <img class="grid3 icon" src="../images/icons/Icon_specialty.png" alt="Icon treatments">
            <div class="grid4" id="selectTreatment"></div>
        </div>`;

    const select = document.createElement('select');
    select.className = 'grid4';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Choisir un acte (obligatoire)';
    select.appendChild(defaultOption);

    const treatments = Array.isArray(doctor.treatments) ? doctor.treatments : [];
    treatments.forEach((treatment, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${treatment.name} (${treatment.duration ?? '—'} min)`;
        option.dataset.treatmentName = treatment.name ?? '';
        option.dataset.treatmentDuration = treatment.duration ?? '';
        select.appendChild(option);
    });

    if (treatments.length === 0) {
        const noTreatment = document.createElement('div');
        noTreatment.textContent = 'Aucun acte enregistré pour ce médecin.';
        doctorInfo.appendChild(noTreatment);
    }

    doctorInfo.querySelector('#selectTreatment').appendChild(select);
    container.appendChild(doctorInfo);

    const calendar = document.createElement('div');
    calendar.className = 'calendar';
    const buttonPrevious = document.createElement('button');
    const buttonNext = document.createElement('button');
    buttonPrevious.className = 'button';
    buttonNext.className = 'button';
    const imgButtonPrevious = document.createElement('img');
    const imgButtonNext = document.createElement('img');
    imgButtonPrevious.className = 'icon';
    imgButtonNext.className = 'icon';
    imgButtonPrevious.src="../images/icons/Icon_LeftArrow.png";
    imgButtonNext.src="../images/icons/Icon_RightArrow.png";
    buttonPrevious.appendChild(imgButtonPrevious);
    buttonNext.appendChild(imgButtonNext);

    const grid = document.createElement('div');
    grid.className = 'gridCalendar';
    calendar.appendChild(buttonPrevious);
    calendar.appendChild(grid);
    calendar.appendChild(buttonNext);
    container.appendChild(calendar);

    function getWeekDates(offset = 0) {
        const today = new Date();
        const day = today.getDay();
        const mondayOffset = (day === 0 ? -6 : 1 - day) + offset * 7;
        const monday = new Date(today);
        monday.setDate(today.getDate() + mondayOffset);

        const week = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            week.push(d.toISOString().split('T')[0]);
        }
        return week;
    }

    function updateWeekGrid() {
        const offset = window.doctorWeekOffsets.get(key);
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

            const slots = data.slots[date] ?? [];
            if (slots.length === 0) {
                const no = document.createElement('div');
                no.className = 'no-slot';
                no.textContent = '—';
                col.appendChild(no);
            } else {
                slots.forEach(slot => {
                    const t = document.createElement('button');
                    t.className = 'slotButton';
                    const time = (slot.startTime || slot.time || slot.start_time || '').slice(0,5);
                    t.textContent = time || '—';
                    t.disabled = select.value === '';
                    t.dataset.date = date;
                    t.dataset.time = time;
                    t.dataset.doctorName = `${doctor.firstname ?? ''} ${doctor.lastname ?? ''}`;
                    t.dataset.centerName = center.name ?? '';
                    if (slot.id) t.dataset.slotId = slot.id;

                    t.addEventListener('click', () => {
                        if (t.disabled) return;
                        const chosenIndex = select.value;
                        const chosen = treatments[chosenIndex];
                        const params = new URLSearchParams({
                            doctor: t.dataset.doctorName,
                            center: t.dataset.centerName,
                            date: t.dataset.date,
                            time: t.dataset.time,
                            treatment: chosen ? chosen.name : ''
                        });
                        window.location.href = `appointment_confirmation.html?${params.toString()}`;
                    });

                    const { dayAtMidnight: slotDay, fullDateTime: slotDateTime } = parseDateAndTime(date, time);
                    const now = new Date();
                    const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0,0,0,0);

                    if (slotDay.getTime() < todayDay.getTime()) {
                        t.classList.add("pastSlot");
                        t.disabled = true;
                    } else if (slotDay.getTime() === todayDay.getTime() && slotDateTime.getTime() <= now.getTime()) {
                        t.classList.add("pastSlot");
                        t.disabled = true;
                    }

                    col.appendChild(t);
                });
            }
            grid.appendChild(col);
        });
    }

    buttonPrevious.addEventListener('click', () => {
        const offset = window.doctorWeekOffsets.get(key);
        if (offset > 0) {
            window.doctorWeekOffsets.set(key, offset - 1);
            updateWeekGrid();
        }
    });

    buttonNext.addEventListener('click', () => {
        const offset = window.doctorWeekOffsets.get(key);
        window.doctorWeekOffsets.set(key, offset + 1);
        updateWeekGrid();
    });

    function updateSlotButtonsState() {
        const enabled = select.value !== '';
        const buttons = container.querySelectorAll('.slotButton');

        buttons.forEach(button => {
            if (!button) return;

            if (button.classList.contains("pastSlot")) return;
            
            button.disabled = !enabled;
        });
    }

    select.addEventListener('change', updateSlotButtonsState);

    updateWeekGrid();
    updateSlotButtonsState();

    return container;

}

function updateCalendar(offset) {
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

        const slots = data.slots[date] ?? [];
        if (slots.length === 0) {
            const no = document.createElement('div');
            no.className = 'no-slot';
            no.textContent = '—';
            col.appendChild(no);
        } else {
            slots.forEach(slot => {
                const t = document.createElement('button');
                t.className = 'slotButton';
                const time = (slot.startTime || slot.time || slot.start_time || '').slice(0,5);
                t.textContent = time || '—';
                t.disabled = select.value === '';
                t.dataset.date = date;
                t.dataset.time = time;
                t.dataset.doctorName = `${doctor.firstname ?? ''} ${doctor.lastname ?? ''}`;
                t.dataset.centerName = center.name ?? '';
                if (slot.id) t.dataset.slotId = slot.id;

                t.addEventListener('click', () => {
                    if (t.disabled) return;
                    const chosenIndex = select.value;
                    const chosen = treatments[chosenIndex];
                    const params = new URLSearchParams({
                        doctor: t.dataset.doctorName,
                        center: t.dataset.centerName,
                        date: t.dataset.date,
                        time: t.dataset.time,
                        treatment: (chosen ? chosen.name : '')
                    });
                    window.location.href = `appointment_confirmation.html?${params.toString()}`;
                });

                col.appendChild(t);
            });
        }

        grid.appendChild(col);
    });
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

function renderResults(results) {
    const container = document.getElementById('container');
    container.innerHTML = '';

    if (!Array.isArray(results) || results.length === 0) {
        container.innerHTML = '<p>Aucun résultat correspondant à votre recherche.</p>';
        return;
    }

    const weekDates = getWeekDates();
    const grouped = groupByDoctor(results);

    Object.entries(grouped).forEach(([key, data]) => {
        const result = getDoctorResult(key, data, weekDates);
        container.appendChild(result);
    });
}

function filterResults(results) {
    const urlParams = new URLSearchParams(window.location.search);
    const qui = urlParams.get('qui');
    const treatment = urlParams.get('treatment');
    const ou = urlParams.get('ou');
    const center = urlParams.get('center');

    const filteredResults = results.filter(item => {
        let match = true;
        if (qui) {
            const mots = qui.toLowerCase().split(' ');
            match = match && mots.every(m => 
                (item.doctor?.firstname?.toLowerCase().includes(m) || 
                item.doctor?.lastname?.toLowerCase().includes(m))
            );
        }

        if (treatment && treatment !== "tous") match = match && item.doctor?.treatments?.some(t => t.id == treatment);

        if (ou) {
            const lieux = ou.toLowerCase().split(' ');
            match = match && lieux.every(l => 
                (item.doctor?.center?.name?.toLowerCase().includes(l) || 
                item.doctor?.center?.address?.toLowerCase().includes(l))
            );
        }

        if (center) match = match && item.doctor?.center?.id == center;

        return match;
    });

    console.log(filteredResults)
    renderResults(filteredResults);

}