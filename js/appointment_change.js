document.addEventListener("DOMContentLoaded", getAppointmentChanges);

async function getAppointmentChanges() {
    try {
        const token = localStorage.getItem("jwt");

        if (!token) {
            alert("Utilisateur non connecté");
            return;
        }

        const response = await fetch("http://localhost:8000/api/appointment/change", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/ld+json"
            }
        });

        if (!response.ok) {
            console.error("Status:", response.status);
            throw new Error("Impossible de récupérer les résultats.");
        }

        const results = await response.json();

        filterResults(results);

    } catch (error) {
        console.error(error);
        alert("Impossible de récupérer les résultats.");
    }
}


function filterResults(results) {
    const idParam = new URLSearchParams(window.location.search).get('id');
    const requestedId = idParam ? parseInt(idParam, 10) : null;

    const filtered = results.filter(item => {
        if (!requestedId) return true;

        const appointmentId = item?.slot?.appointment?.id;
        return appointmentId === requestedId;
    });

    renderResults(filtered, results);
}


function renderResults(list, allResults) {
    const container = document.getElementById("rdv");

    container.innerHTML = "";

    if (!list.length) {
        container.innerHTML = `
            <p style="font-size:18px; color:#555;">Aucun résultat correspondant à votre rendez-vous.</p>
        `;
        return;
    }

    const selectedDoctorId = list[0]?.doctor?.id;

    if (selectedDoctorId) {
        const grouped = groupByDoctor(allResults);
        const selectedDoctorData = grouped[selectedDoctorId];

        if (selectedDoctorData) {
            const calendar = document.querySelector("#calendarGrid");
            calendar.innerHTML = "";
            const doctorInfo = getDoctorInfo(selectedDoctorData);
            calendar.appendChild(doctorInfo);
        }
    }

    list.forEach(item => {
        const doctor = item.doctor || {};
        const slot = item.slot || {};
        const center = doctor.center || {};
        const treatments = doctor.treatments  || {};

        const treatmentListHTML = treatments.length
            ? `
                <ul class="left">
                    ${treatments.map(t => `
                        <li class="left">
                            ${t.name} : ${t.duration} min
                        </li>
                    `).join("")}
                </ul>
            `
            : "<p>Aucun acte associé</p>";


        const doctorInfo = document.createElement("div");
        doctorInfo.classList.add("doctorInfo");

        const dateTime = parseDateAndTimeToLocal(slot.startDate, slot.startTime);

        const dateFr = dateTime ? dateTime.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Date non disponible';
        const timeFr = dateTime ? dateTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h') : 'Heure non disponible';

        doctorInfo.innerHTML = `
            <h2>Votre rendez-vous</h2>

            <p>Le ${dateFr ?? "Non disponible"} à ${timeFr ?? "Non disponible"}</p>
            <br>
            <p class="left"><strong>Médecin :</strong>
                ${doctor.firstname ?? ""} ${doctor.lastname ?? ""}
            </p>
            <p class="left"><strong>Actes prévus :</strong></p>
            ${treatmentListHTML}

            <p class="left"><strong>Centre :</strong>
                ${center.name ?? "Non renseigné"} – ${center.address ?? ""}
            </p>
        `;

        container.appendChild(doctorInfo);
    });
}

function selectSlot(date, time, doctorId, appointmentId) {
    const url = `/appointment_create.html?date=${date}&time=${time}&doctor=${doctorId}&appointment=${appointmentId}`;
    window.location.href = url;
}

function parseDateAndTimeToLocal(dateStr, timeStr) {
    if (!dateStr) return null;

    const [y, m, d] = dateStr.split('-').map(Number);

    let hh = 0, mm = 0;
    if (timeStr) {
        const parts = timeStr.split(':').map(Number);
        hh = parts[0] ?? 0;
        mm = parts[1] ?? 0;
    }

    return new Date(y, (m - 1), d, hh, mm, 0, 0);
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
        const key = `${item.doctorId ?? doctor.id}`;

        if (!doctors[key]) {
            doctors[key] = { doctor, slots: {} };
        }

        const slot = item.slot;
        if (slot && slot.startDate) {
            if (!doctors[key].slots[slot.startDate]) doctors[key].slots[slot.startDate] = [];
            doctors[key].slots[slot.startDate].push(slot);
        }
    });

    return doctors;
}

function getDoctorInfo(data) {
    const container = document.createElement('div');
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
                    btn.disabled = slot.isBooked;

                    const { fullDateTime } = parseDateAndTime(slot.startDate, slot.startTime);
                    if (fullDateTime < new Date()) btn.disabled = true;

                    col.appendChild(btn);
                });
            }

            gridCalendar.appendChild(col);
        });
    }

    renderCalendar();

    previousButton.addEventListener('click', () => {
        weekOffset--;
        renderCalendar();
    });
    nextButton.addEventListener('click', () => {
        weekOffset++;
        renderCalendar();
    });

    return container;
}