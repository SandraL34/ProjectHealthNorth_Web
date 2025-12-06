async function getMedicalRecord() {
    const token = localStorage.getItem('jwt');
    if (!token) {
        alert("Vous devez être connecté pour accéder à votre dossier médical.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/api/patient/medicalRecord', {
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
    document.getElementById('password').value = patient.password || '';
    document.getElementById('phoneNumber').value = patient.phoneNumber || '';
    document.getElementById('postalAddress').value = patient.postalAddress || '';
    document.getElementById('socialsecurityNumber').value = patient.socialsecurityNumber || '';
    document.getElementById('socialsecurityRegime').value = patient.socialsecurityRegime || '';
    document.getElementById('healthcareInsurance').value = patient.healthcareInsurance || '';
    document.getElementById('allergy').value = patient.allergy || '';
    document.getElementById('medicalTraitmentDisease').value = patient.medicalTraitmentDisease || '';
    document.getElementById('medicalHistory').value = patient.medicalHistory || '';

    const doctorSelect = document.getElementById('doctor');

    if (patient.doctor) {
        const doctorId = String(patient.doctor.id);
        Array.from(doctorSelect.options).forEach(option => {
            if (option.value === doctorId) {
                option.selected = true;
            }
        });
    }

    if (patient.emergencyContact) {
        const emergencyContact = patient.emergencyContact;
        document.getElementById('emergencyContactFirstname').value = emergencyContact.firstname || '';
        document.getElementById('emergencyContactLastname').value = emergencyContact.lastname || '';
        document.getElementById('emergencyContactPhoneNumber').value = emergencyContact.phoneNumber || '';
    }

    if (patient.option) {
        const option = patient.option;

        if (option.communicationForm == "Email") {
            document.getElementById('choiceEmail').checked = true;
        } else if (option.communicationForm == "Courrier") {
            document.getElementById('choiceCourrier').checked = true;
        } else if (option.communicationForm == "Téléphone") {
            document.getElementById('choiceTel').checked = true;
        }

        if (option.privateRoom == true) {
            document.getElementById('ouiRoom').checked = true;
            document.getElementById('nonRoom').checked = false;
        } else if (option.privateRoom == false) {
            document.getElementById('ouiRoom').checked = false;
            document.getElementById('nonRoom').checked = true;
        }

        if (option.wifi == true) {
            document.getElementById('ouiWifi').checked = true;
            document.getElementById('nonWifi').checked = false;
        } else if (option.wifi == false) {
            document.getElementById('ouiWifi').checked = false;
            document.getElementById('nonWifi').checked = true;
        }

        if (option.television == true) {
            document.getElementById('ouiTV').checked = true;
            document.getElementById('nonTV').checked = false;
        } else if (option.television == false) {
            document.getElementById('ouiTV').checked = false;
            document.getElementById('nonTV').checked = true;
        }

        if (option.diet == "Végétarien") {
            document.getElementById('vegetarien').checked = true;
        } else if (option.communicationForm == "Vegan") {
            document.getElementById('vegan').checked = true;
        } else if (option.communicationForm == "Sans sel") {
            document.getElementById('sansSel').checked = true;
        } else if (option.communicationForm == "Halal") {
            document.getElementById('halal').checked = true;
        }
    }
    
    if (patient.payment) {
        const payment = patient.payment;

        document.getElementById('ownerName').value = payment.ownerName || '';
        document.getElementById('cardNumber').value = payment.cardNumber || '';
        document.getElementById('expirationDateMonth').value = payment.expirationDateMonth || '';
        document.getElementById('expirationDateYear').value = payment.expirationDateYear || '';
        document.getElementById('secretCode').value = payment.secretCode || '';
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