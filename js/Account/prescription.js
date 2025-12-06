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
        scrollToHash();

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
        div.setAttribute("id", "p" + app.id);

        const dateTime = parseDateToLocal(app.appointment.date);

        const dateFr = dateTime ? dateTime.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Date non disponible';

        div.innerHTML = `
                <h2>Rendez-vous du ${dateFr} avec ${app.appointment ? "dr " + app.appointment.lastname : "N/A"}</h2>
                <h3>Compte-rendu du RDV</h3>
                <p>${app.report}</p>
                <h3>Prescription</h3>
                <p>${app.prescriptionDetails}</p>

            <a class="bouton" href="">Télécharger le PDF</a>
        `;

        container.appendChild(div);
    });
}

function scrollToHash() {
    const hash = window.location.hash;

    if (!hash) return;

    setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    }, 50);
}

function parseDateToLocal(dateStr) {
    if (!dateStr) return null;

    const [y, m, d] = dateStr.split('-').map(Number);

    return new Date(y, (m - 1), d);
}