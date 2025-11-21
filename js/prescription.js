async function getPrescriptionData() {
    const token = localStorage.getItem('jwt');
    if (!token) {
        alert("Vous devez être connecté pour accéder à vos prescriptions.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/api/prescription', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Impossible de récupérer les prescriptions');
        }

        const prescriptions = await response.json();
        displayPrescriptions(prescriptions);
    } catch (error) {
        console.error(error);
        alert("Erreur lors du chargement des prescriptions.");
    }
}

function displayPrescriptions(prescriptions) {
    const container = document.getElementById('prescription');
    container.innerHTML = "";

    if (prescriptions.length === 0) {
        container.innerHTML = "<p>Aucune prescription.</p>";
        return;
    }

    prescriptions.forEach(app => {
        const div = document.createElement("div");
        div.classList.add("prescription");

        div.innerHTML = `
                <h2>Rendez-vous du ${app.treatment.dateTime} avec ${app.doctor ? "dr " + app.doctor.lastname : "N/A"}</h2>
                <h3>Compte-rendu du RDV</h3>
                <p>${app.report}</p>
                <h3>Prescription</h3>
                <p>${app.prescriptionDetails}</p>

            <a class="bouton" href="">Télécharger le PDF</a>
        `;

        container.appendChild(div);
    });
}