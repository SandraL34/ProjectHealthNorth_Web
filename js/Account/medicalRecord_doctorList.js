async function getDoctorsList() {
    const token = localStorage.getItem('jwt');
    if (!token) {
        alert("Vous devez être connecté pour accéder à la liste des spécialistes.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/api/doctors/list', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Impossible de récupérer les spécialistes');
        }

        const doctors = await response.json();
        displayDoctors(doctors);

    } catch (error) {
        console.error(error);
        alert("Erreur lors du chargement des spécialistes.");
    }

    window.getDoctorsList.__executed = true;
}

function displayDoctors(doctors) {
    const select = document.getElementById("doctor");

    select.innerHTML = '<option class="bold" value="null">Sélectionner votre spécialiste</option>';

    doctors.forEach(doctor => {
        const option = document.createElement("option");
        option.value = doctor.id;
        option.textContent = doctor.firstname + " " + doctor.lastname;
        select.appendChild(option);
    });
}