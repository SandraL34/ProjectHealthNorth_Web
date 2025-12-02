document.addEventListener("DOMContentLoaded", getAppointmentResults);

const NOW = new Date();
NOW.setSeconds(0, 0);

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

        if (!response.ok) throw new Error("Impossible de récupérer les résultats.");

        const results = await response.json();

        filterResults(results);

    } catch (error) {
        console.error(error);
        alert("Erreur lors du chargement des résultats.");
    }
}

function formatIsoToFr(isoDate) {
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
}

function formatTimeDisplay(time) {
    return time ? time.slice(0, 5) : "";
}

function parseDateAndTime(dateStr, timeStr) {
    if (!dateStr) return { dayAtMidnight: null, fullDateTime: null };
    const [y,m,d] = dateStr.split('-').map(Number);
    const [hh, mm] = timeStr ? timeStr.split(':').map(Number) : [0,0];
    return {
        dayAtMidnight: new Date(y, m-1, d, 0,0,0,0),
        fullDateTime: new Date(y, m-1, d, hh, mm,0,0)
    };
}

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

function groupByDoctor(results) {
    const doctors = {};
    results.forEach(item => {
        const doctor = item.doctor || {};
        const doctorId = item.doctorId;

        if (!doctors[doctorId]) {
                    doctors[doctorId] = { doctorId, doctor, slots: {} };
                }

                const slot = item.slot;
                if (slot && slot.startDate) {
                    if (!doctors[doctorId].slots[slot.startDate]) {
                        doctors[doctorId].slots[slot.startDate] = [];
                    }
                    doctors[doctorId].slots[slot.startDate].push(slot);
                }
            });

            return doctors;
        }

function renderResults(results) {
    const container = document.getElementById('container');
    container.innerHTML = '';

    if (!Array.isArray(results) || results.length === 0) {
        container.innerHTML = '<p>Aucun résultat correspondant à votre recherche.</p>';
        return;
    }

    const grouped = groupByDoctor(results);

    Object.values(grouped).forEach(data => {
        const doctorInfo = getDoctorInfo(data);
        container.appendChild(doctorInfo);
    });
}

function getDoctorInfo(data) {
    const container = document.createElement('div');
    container.classList.add('result');

    const doctor = data.doctor || {};
    const center = doctor.center || {};
    const treatments = Array.isArray(doctor.treatments) ? doctor.treatments : [];

    const infoDiv = document.createElement('div');
    infoDiv.className = 'doctorInfo';
    infoDiv.innerHTML = `
        <h2>Dr ${doctor.firstname ?? ''} ${doctor.lastname ?? ''}</h2>
        <div class="grid">
            <img src="../images/icons/Icon_localization.png" alt="Icon localization" class="icon grid1">
            <p class="grid2">Centre : ${center.name ?? '—'}, ${center.address ?? ''}</p>
            <img src="../images/icons/Icon_specialty.png" alt="Icon treatment" class="icon grid3">
            <div class="grid4" id="grid4"></div>
        </div>
    `;
    container.appendChild(infoDiv);

    const select = document.createElement('select');
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Choisir un acte (obligatoire)';
    select.appendChild(defaultOption);
    treatments.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = `${t.name} (${t.duration ?? '—'} min)`;
        select.appendChild(opt);
    });
    infoDiv.querySelector('#grid4').appendChild(select);

    const calendar = document.createElement('div');
    calendar.className = 'calendar';
    container.appendChild(calendar);

    const previousButton = document.createElement('button');
    previousButton.className = 'button';
    const previousImg = document.createElement('img');
    previousImg.src = '../images/icons/Icon_LeftArrow.png';
    previousImg.alt = 'Previous button';
    previousButton.appendChild(previousImg);

    const nextButton = document.createElement('button');
    nextButton.className = 'button';
    const nextImg = document.createElement('img');
    nextImg.src = '../images/icons/Icon_RightArrow.png';
    nextImg.alt = 'Next button';
    nextButton.appendChild(nextImg);

    calendar.appendChild(previousButton);

    const gridCalendar = document.createElement('div');
    gridCalendar.className = 'gridCalendar';
    calendar.appendChild(gridCalendar);

    calendar.appendChild(nextButton);

    let weekOffset = 0;

    function renderCalendar() {
        gridCalendar.innerHTML = '';
        const weekDates = getWeekDates(weekOffset);

        weekDates.forEach(date => {
            const col = document.createElement('div');
            col.className = 'day-col';

            const dateObj = new Date(date);
            const dayName = dateObj.toLocaleDateString('fr-FR', { weekday:'short' });
            const dayMonth = dateObj.toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit' });

            const title = document.createElement('div');
            title.className = 'day-title';
            title.innerHTML = `${dayName}<br><small>${dayMonth}</small>`;
            col.appendChild(title);

            const slots = data.slots[date] ?? [];
            if (slots.length === 0) {
                const empty = document.createElement('div');
                empty.textContent = '—';
                col.appendChild(empty);
            } else {
                slots.forEach(slot => {
                    const btn = document.createElement('button');
                    btn.className = 'slotButton';
                    btn.textContent = formatTimeDisplay(slot.startTime);
                    const treatmentId = select.value;
                    const treatment = treatments.find(t => t.id == treatmentId);
                    const duration = treatment ? Number(treatment.duration) : 0;

                    const bookedSlotsForDay = (data.slots[date] || []).filter(s => s.isBooked);

                    const overlaps = bookedSlotsForDay.some(bookedSlot =>
                        isOverlapping(slot, bookedSlot, duration)
                    );

                    btn.disabled =
                        !treatmentId ||
                        slot.isBooked ||
                        overlaps;

                    btn.addEventListener('click', () => {
                        if (!select.value) return;
                        const params = new URLSearchParams({
                            doctorId: data.doctorId,
                            date: formatIsoToFr(slot.startDate),
                            time: formatTimeDisplay(slot.startTime),
                            treatmentId: select.value,
                            centerId: doctor.center.id,
                            doctorName: doctor.firstname + " " + doctor.lastname,
                            centerName: doctor.center.name,
                            treatmentName: treatments[0].name
                        });
                        window.location.href = `appointment_book.html?${params.toString()}`;
                    });

                    const { fullDateTime } = parseDateAndTime(slot.startDate, slot.startTime);

                    if (fullDateTime <= NOW) {
                        btn.disabled = true;
                        btn.classList.add("pastSlot");
                    }

                    col.appendChild(btn);
                });
            }

            gridCalendar.appendChild(col);
        });
    }

    renderCalendar();
    select.dispatchEvent(new Event('change'));

    previousButton.addEventListener('click', () => {
        weekOffset--;
        renderCalendar();
    });
    nextButton.addEventListener('click', () => {
        weekOffset++;
        renderCalendar();
    });

    select.addEventListener('change', () => {
        renderCalendar();
    });

    return container;
}

function filterResults(results) {
    const params = new URLSearchParams(window.location.search);

    const doctorParam = params.get('qui')?.toLowerCase() || "";
    const treatmentParam = params.get('treatment') || "";
    const ouParam = params.get('ou')?.toLowerCase() || "";
    const centerParam = params.get('center') || "";

    const filtered = results.filter(item => {

        const doctor = item.doctor || {};
        const center = doctor.center || {};
        const treatments = doctor.treatments || [];

        if (doctorParam) {
            const fullName = `${doctor.firstname ?? ""} ${doctor.lastname ?? ""}`.toLowerCase();
            if (!fullName.includes(doctorParam)) return false;
        }

        if (treatmentParam && treatmentParam !== "tous") {
            const hasTreatment = treatments.some(t => t.id == treatmentParam);
            if (!hasTreatment) return false;
        }

        if (ouParam) {
            const centerString = `${center.name ?? ""} ${center.address ?? ""}`.toLowerCase();
            if (!centerString.includes(ouParam)) return false;
        }

        if (centerParam) {
            if (center.id != centerParam) return false;
        }

        return true;
    });

    renderResults(filtered);
}

function parseDateTimeStrict(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;

    const tParts = timeStr.split(':').map(Number);
    if (tParts.length < 2) return null;
    const hh = Number.isFinite(tParts[0]) ? tParts[0] : NaN;
    const mm = Number.isFinite(tParts[1]) ? tParts[1] : 0;
    const ss = tParts.length >= 3 && Number.isFinite(tParts[2]) ? tParts[2] : 0;

    let y, m, d;
    if (dateStr.includes('-')) {
        const parts = dateStr.split('-').map(Number);
        if (parts.length !== 3) return null;
        [y, m, d] = parts;
    } else if (dateStr.includes('/')) {
        const parts = dateStr.split('/').map(Number);
        if (parts.length !== 3) return null;
        [d, m, y] = parts;
    } else {
        return null;
    }

    if (![y,m,d,hh,mm,ss].every(Number.isFinite)) return null;

    const dt = new Date(y, m - 1, d, hh, mm, ss, 0);
    if (isNaN(dt.getTime())) return null;
    return dt;
}

function isOverlapping(slot, booked, durationMinutes) {
    const slotStart = parseDateTimeStrict(slot.startDate, slot.startTime);
    if (!slotStart) {
        console.warn("isOverlapping: invalid slot start", slot);
        return false;
    }
    const slotEnd = new Date(slotStart.getTime() + (durationMinutes || 0) * 60000);

    const bookedStart = parseDateTimeStrict(booked.startDate, booked.startTime);
    const bookedEnd = parseDateTimeStrict(booked.endDate, booked.endTime);

    if (!bookedStart || !bookedEnd) {
        console.warn("isOverlapping: invalid booked slot", booked);
        return false;
    }

    let bs = bookedStart.getTime();
    let be = bookedEnd.getTime();

    if (be < bs) {
        console.warn("isOverlapping: booked end < start — swapping", { booked });
        [bs, be] = [be, bs];
    }

    const s = slotStart.getTime();
    const e = slotEnd.getTime();

    console.log("DEBUG overlap check",
    {
        slot: { date: slot.startDate, time: slot.startTime },
        booked: { date: booked.startDate, start: booked.startTime, end: booked.endTime },
        parsed: { slotStart: s, slotEnd: e, bookedStart: bs, bookedEnd: be }
    }
    );

    return s < be && e > bs;
}