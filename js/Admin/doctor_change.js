(function() {

    const token = localStorage.getItem('jwt');

    if (!token) {
        alert("Vous devez être connecté pour modifier le médecin.");
        window.location.href = "../Company/connexion.html";
    }

    const modifyDoctor = document.getElementById('modifyDoctor');

    const params = new URLSearchParams(window.location.search);
    const doctorId = params.get('id');

    modifyDoctor.addEventListener('click', async (e) => {

        const id = doctorId;

        const email = document.getElementById('email').value || '';
        const firstname = document.getElementById('firstname').value || '';
        const lastname = document.getElementById('lastname').value || '';
        const phoneNumber = document.getElementById('phoneNumber').value || '';

        const centerId = window.selectedCenterId || null;

        const removedTreatments = window.removedTreatments || [];
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
            id,
            email,
            firstname,
            lastname,
            phoneNumber,
            centerId,
            removedTreatments,
            newTreatments,
            availabilities
        };

        const res = await fetch("http://localhost:8000/api/doctors/change", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
    });
})();