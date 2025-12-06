async function getTreatmentList() {
    const token = localStorage.getItem('jwt');
    if (!token) {
        alert("Vous devez être connecté pour accéder à la liste des actes proposés.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/api/treatments/list', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Impossible de récupérer les actes proposés');
        }

        const treatments = await response.json();
        displayTreatments(treatments);

    } catch (error) {
        console.error(error);
        alert("Erreur lors du chargement des actes proposés.");
    }

    window.getTreatmentList.__executed = true;
}


function displayTreatments(groupedTreatments) {
    const select = document.getElementById("treatment");

    select.innerHTML = '<option class="bold" value="tous">Tous</option>';

    Object.entries(groupedTreatments).forEach(([category, treatments]) => {

        const optgroup = document.createElement("optgroup");
        optgroup.label = category;

        treatments.forEach(treatment => {
            const option = document.createElement("option");
            option.value = treatment.id;
            option.textContent = treatment.name;
            optgroup.appendChild(option);
        });

        select.appendChild(optgroup);
    });
}