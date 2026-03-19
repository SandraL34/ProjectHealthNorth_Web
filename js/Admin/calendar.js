document.addEventListener('DOMContentLoaded', async function () {

    const calendarEl = document.getElementById('calendar');
    const token = localStorage.getItem('jwt');

    if (!token) {
        alert("Vous devez être connecté pour voir le calendrier.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        locale: 'fr',
        slotMinTime: "08:00:00",
        slotMaxTime: "19:00:00",
        slotDuration: "00:30:00",
        slotLabelInterval: "01:00",
        expandRows: true,
        allDaySlot: false,

    events: async function(fetchWithAuthInfo, successCallback, failureCallback) {
        try {
            const weekStart = fetchWithAuthInfo.startStr.split('T')[0];

            const response = await fetchWithAuth(`http://localhost:8000/api/appointment/results?week=${weekStart}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            const bookedSlots = data.filter(item => item.slot.isBooked);

            const events = await Promise.all(bookedSlots
                .filter(item => item.slot.appointmentId !== null) // ✅ seulement les slots "principaux"
                .map(async item => {
                    let patient = { firstname: 'N/A', lastname: '' };
                    let treatment = { name: 'N/A', duration: 60 };

                    try {
                        const appointmentRes = await fetchWithAuth(
                            `http://localhost:8000/api/appointments/${item.slot.appointmentId}`,
                            { headers: { 'Authorization': `Bearer ${token}` } }
                        );
                        const appointment = await appointmentRes.json();
                        patient = appointment.patient || patient;
                        treatment = appointment.treatment || treatment;
                    } catch (e) {
                        console.warn(`Impossible de récupérer le RDV ${item.slot.appointmentId}`, e);
                    }

                    // ✅ Calcul de la fin via la durée du traitement
                    const start = new Date(`${item.slot.startDate}T${item.slot.startTime}`);
                    const end = new Date(start.getTime() + treatment.duration * 60000);

                    return {
                        appointmentId: item.slot.appointmentId,
                        start: start.toISOString(),
                        end: end.toISOString(),
                        title: `Dr ${item.doctor.firstname} ${item.doctor.lastname}`,
                        extendedProps: {
                            doctor: item.doctor,
                            patient: patient,
                            treatment: treatment
                        }
                    };
                })
            );

        successCallback(events);

    } catch (error) {
        console.error(error);
        failureCallback(error);
    }
},

        eventDidMount: function(info) {
            const doctor = info.event.extendedProps.doctor || {};
            const patient = info.event.extendedProps.patient || {};
            const treatment = info.event.extendedProps.treatment || {};

            const tooltipText = `
Médecin : Dr ${doctor.firstname || 'N/A'} ${doctor.lastname || ''}
Patient : ${patient.firstname || 'N/A'} ${patient.lastname || ''}
Traitement : ${treatment.name || 'N/A'}
Début : ${info.event.start.toLocaleString()}
Fin : ${info.event.end.toLocaleString()}
            `.trim();

            info.el.setAttribute('title', tooltipText);

            info.el.querySelector('.fc-event-title').innerHTML = `
                <strong>Dr ${doctor.firstname || ''} ${doctor.lastname || ''}</strong><br>
                👤 ${patient.firstname || 'N/A'} ${patient.lastname || ''}<br>
                💊 ${treatment.name || 'N/A'}
            `;
        }
    });

    calendar.render();
});