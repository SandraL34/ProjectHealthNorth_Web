const divChangeDeleteButton = document.querySelector("#ChangeDeletebuttons");
const changeButton = document.createElement('button');
changeButton.className = "bouton";
changeButton.textContent = "Mettre à jour mon dossier";
const deleteButton = document.createElement('button');
deleteButton.className = "bouton";
deleteButton.textContent = "Supprimer mon dossier";
divChangeDeleteButton.appendChild(changeButton);
divChangeDeleteButton.appendChild(deleteButton);

const token = localStorage.getItem('jwt');

if (!token) {
    alert("Vous devez être connecté pour modifier votre dossier médical.");
    window.location.href = "../Company/connexion.html";
}

changeButton.addEventListener("click", async (e) => {

    const firstname = document.getElementById('firstname').value || '';
    const lastname = document.getElementById('lastname').value || '';
    const email = document.getElementById('email').value || '';
    const phoneNumber = document.getElementById('phoneNumber').value || '';
    const postalAddress = document.getElementById('postalAddress').value || '';
    const emergencyContactFirstname = document.getElementById('emergencyContactFirstname').value || '';
    const emergencyContactLastname = document.getElementById('emergencyContactLastname').value || '';
    const emergencyContactPhoneNumber = document.getElementById('emergencyContactPhoneNumber').value || '';
    const socialsecurityNumber = document.getElementById('socialsecurityNumber').value || '';
    const doctor = document.getElementById('doctor').value || '';
    const socialsecurityRegime = document.getElementById('socialsecurityRegime').value || '';
    const healthcareInsurance = document.getElementById('healthcareInsurance').value || '';
    const allergy = document.getElementById('allergy').value || '';
    const medicalTraitmentDisease = document.getElementById('medicalTraitmentDisease').value || '';
    const medicalHistory = document.getElementById('medicalHistory').value || '';
    const ownerName = document.getElementById('ownerName').value || '';
    const cardNumber = document.getElementById('cardNumber').value || '';
    const expirationDateMonth = document.getElementById('expirationDateMonth').value || '';
    const expirationDateYear = document.getElementById('expirationDateYear').value || '';
    const secretCode = document.getElementById('secretCode').value || '';
    
    
    let communicationForm = '';

    const choiceEmail = document.getElementById('choiceEmail');
    const choiceCourrier = document.getElementById('choiceCourrier');
    const choiceTel = document.getElementById('choiceTel');

    if (choiceEmail.checked) {
        communicationForm = 'email';
    } else if (choiceCourrier.checked) {
        communicationForm = 'courrier';
    } else if (choiceTel.checked) {
        communicationForm = 'telephone';
    } else {
        communicationForm = '';
    }


    let privateRoom = '';

    const ouiRoom = document.getElementById('ouiRoom');
    const nonRoom = document.getElementById('nonRoom');

    if (ouiRoom.checked) {
        privateRoom = true;
    } else if (nonRoom.checked) {
        privateRoom = false;
    } else {
        privateRoom = '';
    }


    let television = '';

    const ouiTV = document.getElementById('ouiTV');
    const nonTV = document.getElementById('nonTV');

    if (ouiTV.checked) {
        television = true;
    } else if (nonTV.checked) {
        television = false;
    } else {
        television = '';
    }


    let wifi = '';

    const ouiWifi = document.getElementById('ouiWifi');
    const nonWifi = document.getElementById('nonWifi');

    if (ouiWifi.checked) {
        wifi = true;
    } else if (nonWifi.checked) {
        wifi = false;
    } else {
        wifi = '';
    }


    let diet = '';

    const vegan = document.getElementById('vegan');
    const vegetarien = document.getElementById('vegetarien');
    const sansSel = document.getElementById('sansSel');
    const halal =  document.getElementById('halal');
    const regimeAutre = document.getElementById('regimeAutre');

    if (vegan.checked) {
        diet = 'vegan';
    } else if (vegetarien.checked) {
        diet = 'vegetarien';
    } else if (sansSel.checked) {
        diet = 'sansSel';
    } else if (halal.checked) {
        diet = 'halal';
    } else if (regimeAutre !== '') {
        diet = regimeAutre.value;
    } else {
        diet = '';
    }

    const data = {firstname, lastname, email, phoneNumber, postalAddress, 
        emergencyContact: {firstname: emergencyContactFirstname, lastname: emergencyContactLastname, phoneNumber: emergencyContactPhoneNumber},
        socialsecurityNumber, doctor, socialsecurityRegime,
        healthcareInsurance, allergy, medicalTraitmentDisease, medicalHistory, 
        payment: {ownerName: ownerName, cardNumber: cardNumber, expirationDateMonth: expirationDateMonth, expirationDateYear: expirationDateYear, secretCode: secretCode},
        option: {communicationForm: communicationForm, privateRoom: privateRoom, television: television, wifi: wifi, diet: diet}
    };

    Object.keys(data).forEach(key => {
        if (data[key] === "" || data[key] === null || data[key] === undefined) {
            delete data[key];
        }
    });

    try {
        const patient = await updateMedicalRecord(data);
        console.log("SUCCESS:");
        /*window.location.href = "medicalRecord_change_password.html";*/
    } catch (error) {
        console.error(error);
        alert("Erreur lors de la modification du dossier médical.");
    }
});

async function updateMedicalRecord(data) {

    try {
        const response = await fetch('http://localhost:8000/api/medicalrecord/change', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("SERVER RESPONSE:", errorText);
            throw new Error("Erreur lors de la modification du dossier médical");
        }

        return await response.json();
    } catch (err) {
        console.error("Erreur updateMedicalRecord:", err);
        throw err;
    }
}