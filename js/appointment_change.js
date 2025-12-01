document.addEventListener("DOMContentLoaded", getAppointmentResults);

async function getAppointmentResults() {
    try {
        const token = localStorage.getItem("jwt");

        if (!token) {
            alert("Utilisateur non connecté");
            return;
        }

        const response = await fetch("http://localhost:8000/api/appointment/change", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/ld+json"
            }
        });

        if (!response.ok) {
            console.error("Status:", response.status);
            throw new Error("Impossible de récupérer les résultats.");
        }

        const results = await response.json();

        filterResults(results);

    } catch (error) {
        console.error(error);
        alert("Impossible de récupérer les résultats.");
    }
}


function filterResults(results) {
    const idParam = new URLSearchParams(window.location.search).get('id');
    const requestedId = idParam ? parseInt(idParam, 10) : null;

    const filtered = results.filter(item => {
        if (!requestedId) return true;

        const appointmentId = item?.slot?.appointment?.id;
        return appointmentId === requestedId;
    });

    renderResults(filtered, results);
}


function renderResults(list, allResults) {
    const container = document.getElementById("rdv");

    container.innerHTML = "";

    if (!list.length) {
        container.innerHTML = `
            <p style="font-size:18px; color:#555;">Aucun résultat correspondant à votre rendez-vous.</p>
        `;
        return;
    }

    list.forEach(item => {
        const doctor = item.doctor || {};
        const slot = item.slot || {};
        const center = doctor.center || {};
        const treatments = doctor.treatments  || {};

        const treatmentListHTML = treatments.length
            ? `
                <ul class="left">
                    ${treatments.map(t => `
                        <li class="left">
                            ${t.name} : ${t.duration} min
                        </li>
                    `).join("")}
                </ul>
            `
            : "<p>Aucun acte associé</p>";


        const doctorInfo = document.createElement("div");
        doctorInfo.classList.add("doctorInfo");

        doctorInfo.innerHTML = `
            <h2>Votre rendez-vous</h2>

            <p>Le ${slot.startDate ?? "Non disponible"} à ${slot.startTime ?? "Non disponible"}</p>
            <br>
            <p class="left"><strong>Médecin :</strong>
                ${doctor.firstname ?? ""} ${doctor.lastname ?? ""}
            </p>
            <p class="left"><strong>Actes prévus :</strong></p>
            ${treatmentListHTML}

            <p class="left"><strong>Centre :</strong>
                ${center.name ?? "Non renseigné"} – ${center.address ?? ""}
            </p>
        `;

        container.appendChild(doctorInfo);
    });
}

function selectSlot(date, time, doctorId, appointmentId) {
    const url = `/appointment_create.html?date=${date}&time=${time}&doctor=${doctorId}&appointment=${appointmentId}`;
    window.location.href = url;
}