document.getElementById("buttonCreateAppointment").addEventListener("click", async (e) => {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);

    const token = localStorage.getItem('jwt');
    if (!token) {
        alert("Vous devez être connecté pour réserver un rendez-vous.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    const patientId = await getPatientId(token);
    if (!patientId) {
        alert("Impossible de créer le rendez-vous : patient non identifié.");
        return;
    }

    const doctorId = params.get("doctorId");
    const treatmentId = params.get("treatmentId");
    const title = "RDV " + (params.get("treatmentName") || "");
    const dateFr = params.get("date");
    const timeFr = params.get("time");

    if (!doctorId || !treatmentId || !dateFr || !timeFr) {
        alert("Informations manquantes pour créer le rendez-vous.");
        return;
    }

    const dateTimeIso = convertFrToIso(dateFr, timeFr);
    if (!dateTimeIso) {
        alert("Impossible de convertir la date et l'heure en format ISO.");
        return;
    }

    const data = {
        patient: `/api/patients/${patientId}`,
        doctor: `/api/doctors/${doctorId}`,
        treatments: [`/api/treatments/${treatmentId}`],
        title: title,
        dateTime: dateTimeIso
    };

    console.log("Payload envoyé :", data);

    try {
        const appointment = await createAppointment(data, token);
        console.log("Rendez-vous créé :", appointment);
        alert("Rendez-vous ajouté avec succès !");
    } catch (error) {
        console.error(error);
        alert("Erreur lors de la création du rendez-vous.");
    }
});

async function getPatientId(token) {
    try {
        const res = await fetch('http://localhost:8000/api/patient/medicalRecord', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            console.error("Impossible de récupérer le patient :", await res.text());
            return null;
        }

        const data = await res.json();
        return data.id;
    } catch (err) {
        console.error("Erreur fetch patientId :", err);
        return null;
    }
}

function convertFrToIso(dateFr, timeFr) {
    if (!dateFr || !timeFr) return null;
    const [day, month, year] = dateFr.split('/');
    return `${year}-${month}-${day}T${timeFr}:00`;
}

async function createAppointment(data, token) {
    try {
        const response = await fetch('http://localhost:8000/api/appointment/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("SERVER RESPONSE:", errorText);
            throw new Error("Erreur lors de la création du rendez-vous");
        }

        return await response.json();
    } catch (err) {
        console.error("Erreur createAppointment:", err);
        throw err;
    }
}