async function loadCentersMap() {
    const token = localStorage.getItem('jwt');
    if (!token) {
        window.location.href = "../Company/connexion.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:8000/api/centers/map", {
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        });

        const centers = await response.json();
        const map = L.map('map').setView([46.5, 2.5], 5);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        const container = document.getElementById('infosCenter');

        map.on('click', () => {
            container.innerHTML = "";
        });

        centers.forEach(center => {
            if (!center.latitude || !center.longitude) return;

            const marker = L.marker([center.latitude, center.longitude]).addTo(map);

            marker.on('click', () => {

                let doctorsHTML = '';
                if (center.doctors && center.doctors.length > 0) {
                    doctorsHTML = '<ul>';
                    center.doctors.forEach(doctor => {
                        doctorsHTML += `<li>${doctor.firstname} ${doctor.lastname}</li>`;
                    });
                    doctorsHTML += '</ul>';
                } else {
                    doctorsHTML = '<p>Aucun spécialiste référencé</p>';
                }

                const allTreatments = [];
                center.doctors.forEach(doctor => {
                    if (doctor.treatments && doctor.treatments.length > 0) {
                        doctor.treatments.forEach(treatment => {
                            if (!allTreatments.includes(treatment.name)) {
                                allTreatments.push(treatment.name);
                            }
                        });
                    }
                });

                let treatmentsHTML = '';
                if (allTreatments.length > 0) {
                    treatmentsHTML = '<ul>';
                    allTreatments.forEach(name => {
                        treatmentsHTML += `<li>${name}</li>`;
                    });
                    treatmentsHTML += '</ul>';
                } else {
                    treatmentsHTML = '<p>Aucune spécialité référencée</p>';
                }
                
                container.innerHTML = `
                    <div class="detailsCenter">
                        <h2>Informations sur l'établissement</h2>
                        <p><strong>${center.name}</strong></p>
                        <p>${center.address.replace("\r\n", "<br>")}</p>
                        <br>
                        <p><strong>Spécialistes :</strong>${doctorsHTML}</p>
                        <br>
                        <p><strong>Spécialités :</strong>${treatmentsHTML}</p>
                        <a href="appointment_results.html?center=${center.id}" class="bouton">Prendre RDV</a>
                    </div>
                `;
            });
        });

    } catch (error) {
        console.error(error);
        alert("Erreur lors du chargement de la carte de nos centres.");
    }
}