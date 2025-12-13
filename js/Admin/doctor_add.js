(function() {
    window.newTreatments = [];

    const token = localStorage.getItem('jwt');
    if (!token) {
        alert("Vous devez être connecté pour ajouter un docteur.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    let allTreatments = [];

    async function loadTreatments() {
        const response = await fetch('http://localhost:8000/api/treatments/list',
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
        const grouped = await response.json();

        allTreatments = Object.values(grouped).flat();
    }

    const treatmentsDiv = document.getElementById('treatments');
    const listTreatments = document.createElement('ul');
    treatmentsDiv.appendChild(listTreatments);

    const treatmentInput = document.getElementById('treatment');
    const addButton = document.getElementById('addButton');

    addButton.addEventListener('click', async (e) => {
        const name = treatmentInput.value;
        if (name === "") return;

        await loadTreatments();

        allTreatments.forEach(treatment => {
            if (treatment.name == name) {
                window.newTreatments.push(treatment.id);
                const li = document.createElement('li');
                li.innerHTML = `• ${treatment.name} : ${treatment.duration} mn`;

                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add("deleteButton");
                deleteBtn.innerHTML = `<img src="../images/icons/Icon_delete.png" alt="Delete">`;

                deleteBtn.addEventListener('click', () => {
                    window.newTreatments = window.newTreatments.filter((id => id !== treatment.id));
                    li.remove();
                });

                li.appendChild(deleteBtn);
                listTreatments.appendChild(li);
                treatmentInput.value = "";
            }
        });
    });

    document.getElementById("buttonAddDoctor").addEventListener("click", async (e) => {
        e.preventDefault();

        const password= document.getElementById('password').value || '';

        if (!password) {
            alert("Mot de passe obligatoire");
            return;
        }

        const email = document.getElementById('email').value || '';
        const firstname = document.getElementById('firstname').value || '';
        const lastname = document.getElementById('lastname').value || '';
        const phoneNumber = document.getElementById('phoneNumber').value || '';

        const centerId = window.selectedCenterId || null;

        const newTreatments = window.newTreatments || [];

        const availabilities = [];

        const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];

        days.forEach((dayName, i) => {
            const startAM = document.getElementById(`${dayName}StartAM`).value;
            const endAM   = document.getElementById(`${dayName}EndAM`).value;
            const startPM = document.getElementById(`${dayName}StartPM`).value;
            const endPM   = document.getElementById(`${dayName}EndPM`).value;

            if (!startAM && !endAM && !startPM && !endPM) return;

            availabilities.push({
                dayOfWeek: i,
                startTimeAM: startAM || null,
                endTimeAM: endAM || null,
                startTimePM: startPM || null,
                endTimePM: endPM || null
            });
        });

        const data = {
            email,
            password,
            firstname,
            lastname,
            phoneNumber,
            centerId,
            newTreatments,
            availabilities
        };

        try {
            const doctor = await createDoctor(data, token);
            alert("Docteur créé avec succès !");
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la création du docteur.");
        }
    })

    async function createDoctor(data, token) {
        try {
            const response = await fetch('http://localhost:8000/api/doctors/add', {
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
                throw new Error("Erreur lors de la création du docteur");
            }

            return await response.json();

        } catch (err) {
            console.error("Erreur createDoctor:", err);
            throw err;
        }
    }
})();