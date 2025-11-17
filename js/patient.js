async function getPatientData() {
    const token = localStorage.getItem('jwt');
    if (!token) {
        alert("Vous devez être connecté pour accéder à votre dossier médical.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/api/patient/me', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Impossible de récupérer le dossier médical');
        }

        const patient = await response.json();
        fillPatientForm(patient);
    } catch (error) {
        console.error(error);
        alert("Erreur lors du chargement du dossier médical.");
    }
}

function fillPatientForm(patient) {
    document.getElementById('firstname').value = patient.firstname || '';
    document.getElementById('lastname').value = patient.lastname || '';
    document.getElementById('email').value = patient.email || '';
    document.getElementById('phoneNumber').value = patient.phoneNumber || '';
    document.getElementById('postalAddress').value = patient.postalAddress || '';
    document.getElementById('socialsecurityNumber').value = patient.socialsecurityNumber || '';
    document.getElementById('socialsecurityRegime').value = patient.socialsecurityRegime || '';
    document.getElementById('healthcareInsurance').value = patient.healthcareInsurance || '';
    document.getElementById('allergy').value = patient.allergy || '';
    document.getElementById('medicalTraitmentDisease').value = patient.medicalTraitmentDisease || '';
    document.getElementById('medicalHistory').value = patient.medicalHistory || '';

    if (patient.attendingPhysician) {
        const doctor = patient.attendingPhysician;
        if (doctor.firstname && doctor.lastname) {
            document.getElementById('doctor').value = doctor.firstname + " " + doctor.lastname;
        }
    }
}

async function updatePatientData() {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    const data = {
        firstname: document.getElementById('firstname').value,
        lastname: document.getElementById('lastname').value,
        email: document.getElementById('email').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        postalAddress: document.getElementById('postalAddress').value,
        allergy: document.getElementById('allergy').value,
        medicalTraitmentDisease: document.getElementById('medicalTraitmentDisease').value,
        medicalHistory: document.getElementById('medicalHistory').value,
    };

    try {
        const response = await fetch('/api/patient/me', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour du dossier médical');
        }

        const result = await response.json();
        alert(result.message);
    } catch (error) {
        console.error(error);
        alert("Impossible de mettre à jour le dossier médical.");
    }
}