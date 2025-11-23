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

        div.innerHTML = `
            <p>
                "<strong>${app.title}</strong>" le ${app.dateTime} à ${app.doctor.name} avec <strong>${app.doctor ? 
                    "dr " + app.doctor.lastname : "N/A"}</strong>
            </p>

            <a class="bouton" href="appointment_change.html?id=${app.id}">Modifier le rendez-vous</a>
        `;

        container.appendChild(div);
    });
}