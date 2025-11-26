async function loadCentersMap(selectedCenterId = null) {
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

        if (L.DomUtil.get('map') !== null) {
            L.DomUtil.get('map')._leaflet_id = null;
        }

        const map = L.map('map').setView([46.5, 2.5], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        const container = document.getElementById('infosCenter');
        map.on('click', () => container.innerHTML = "");

        window.mapMarkers = [];

        centers.forEach(center => {
            if (!center.latitude || !center.longitude) return;

            const marker = L.marker([center.latitude, center.longitude]).addTo(map);
            window.mapMarkers.push({ id: center.id.toString(), marker });

            const handleClick = () => {
                let doctorsHTML = '<p>Aucun spécialiste référencé</p>';
                if (center.doctors?.length) {
                    doctorsHTML = '<ul>' + center.doctors.map(d => `<li>${d.firstname} ${d.lastname}</li>`).join('') + '</ul>';
                }

                let treatmentsHTML = '<p>Aucune spécialité référencée</p>';
                const allTreatments = [...new Set(center.doctors.flatMap(d => d.treatments?.map(t => t.name) || []))];
                if (allTreatments.length) {
                    treatmentsHTML = '<ul>' + allTreatments.map(t => `<li>${t}</li>`).join('') + '</ul>';
                }

                container.innerHTML = `
                    <div class="detailsCenter">
                        <h2>Informations sur l'établissement</h2>
                        <p><strong>${center.name}</strong></p>
                        <p>${center.address.replace(/\r\n/g, "<br>")}</p>
                        <br>
                        <p><strong>Spécialistes :</strong>${doctorsHTML}</p>
                        <br>
                        <p><strong>Spécialités :</strong>${treatmentsHTML}</p>
                        <a href="appointment_results.html?center=${center.id}" class="bouton">Prendre RDV</a>
                    </div>
                `;

                const centerInput = document.getElementById('center');
                if (centerInput) {
                    centerInput.value = center.id;
                }
            };

            marker.on('click', handleClick);

            if (selectedCenterId && center.id.toString() === selectedCenterId.toString()) {
                handleClick();
                map.setView([center.latitude, center.longitude], 13);
            }
        });

    } catch (error) {
        console.error(error);
        alert("Erreur lors du chargement de la carte de nos centres.");
    }
}