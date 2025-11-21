async function getPastAppointmentData() {
    const token = localStorage.getItem('jwt');
    if (!token) {
        alert("Vous devez être connecté pour accéder à vos rendez-vous passés.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/api/appointment/past', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Impossible de récupérer les rendez-vous.');
        }

        const appointments = await response.json();
        displayPastAppointments(appointments);
    } catch (error) {
        console.error(error);
        alert("Erreur lors du chargement des rendez-vous.");
    }
}

function displayPastAppointments(appointments) {
    const container = document.getElementById('rdvPast');
    container.innerHTML = "";

    if (appointments.length === 0) {
        container.innerHTML = "<p>Aucun rendez-vous passé.</p>";
        return;
    }

    appointments.forEach(app => {
        const div = document.createElement("div");
        div.classList.add("rdvPast");

        div.innerHTML = `
            <p>
                "<strong>${app.title}</strong>" le ${app.dateTime} à ${app.center.name} avec <strong>${app.doctor ? 
                    "dr " + app.doctor.lastname : "N/A"}</strong>
            </p>

            <a class="bouton" href="prescription.html?id=${app.id}">Accéder à la prescription</a>
        `;

        container.appendChild(div);
    });
}