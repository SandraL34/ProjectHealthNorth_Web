async function getAppointmentData() {
    const token = localStorage.getItem('jwt');
    if (!token) {
        alert("Vous devez être connecté pour accéder à vos rendez-vous à venir.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/api/appointment/coming', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Impossible de récupérer les rendez-vous.');
        }

        const appointments = await response.json();
        displayComingAppointments(appointments);
    } catch (error) {
        console.error(error);
        alert("Erreur lors du chargement des rendez-vous.");
    }
}

function displayComingAppointments(appointments) {
    const container = document.getElementById('rdvComing');
    container.innerHTML = "";

    if (appointments.length === 0) {
        container.innerHTML = "<p>Aucun rendez-vous à venir.</p>";
        return;
    }

    appointments.forEach(app => {
        const div = document.createElement("div");
        div.classList.add("rdvComing");

        const dateTime = parseDateAndTimeToLocal(app.date, app.time);

        const dateFr = dateTime ? dateTime.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Date non disponible';
        const timeFr = dateTime ? dateTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h') : 'Heure non disponible';

        div.innerHTML = `
            <p>
                "<strong>${app.title}</strong>" le ${dateFr} à ${timeFr} à ${app.doctor.name} avec <strong>${app.doctor ? 
                    "dr " + app.doctor.lastname : "N/A"}</strong>
            </p>

            <a class="bouton" href="appointment_change.html?id=${app.id}">Modifier le rendez-vous</a>
        `;

        container.appendChild(div);
    });

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

}