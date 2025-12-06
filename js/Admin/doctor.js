async function getDoctorInfo() {
    const token = localStorage.getItem('jwt');
    if (!token) {
        alert("Vous devez être connecté pour accéder à la modification du spécialiste.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/api/doctors/results', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Impossible d'accéder à la modification du spécialiste`);
        }

        const doctor = await response.json();
        fillDoctorInfo(doctor);
    } catch (error) {
        console.error(error);
        alert("Erreur lors du chargement de la modification du spécialiste.");
    }
}

function formatTime(isoString) {
    const date = new Date(isoString);
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
}

function fillDoctorInfo(doctors) {
    const params = new URLSearchParams(window.location.search);
    const doctorId = params.get('id') || '';

    doctors.forEach(item => {
        if (item.id == doctorId) {
            document.getElementById('firstname').value = item.firstname || '';
            document.getElementById('lastname').value = item.lastname || '';
            document.getElementById('email').value = item.email || '';
            document.getElementById('phoneNumber').value = item.phoneNumber || '';
            document.getElementById('center').value = item.center.name || '';

            const treatmentsDiv = document.getElementById('treatments');
            const listTreatments = document.createElement('ul');
            treatmentsDiv.appendChild(listTreatments);

            item.treatments.forEach(treatment => {
                const treatmentLi = document.createElement('li');
                listTreatments.appendChild(treatmentLi);
                const deleteButton = document.createElement('button');
                deleteButton.classList.add("icon");

                treatmentLi.innerHTML = `${treatment.name} : ${treatment.duration} mn`;
                deleteButton.innerHTML = `<img src="../images/icons/Icon_delete.png" alt ="Delete button">`
                
                treatmentLi.appendChild(deleteButton);
            })

            item.availabilities.forEach(availability => {
                if (availability.dayOfWeek == 1) {
                    document.getElementById('monday').checked = true;
                    document.getElementById('mondayStartAM').value = formatTime(availability.startTimeAM);
                    document.getElementById('mondayEndAM').value = formatTime(availability.endTimeAM);
                    document.getElementById('mondayStartPM').value = formatTime(availability.startTimePM);
                    document.getElementById('mondayEndPM').value = formatTime(availability.endTimePM);
                }
                if (availability.dayOfWeek == 2) {
                    document.getElementById('tuesday').checked = true;
                    document.getElementById('tuesdayStartAM').value = formatTime(availability.startTimeAM);
                    document.getElementById('tuesdayEndAM').value = formatTime(availability.endTimeAM);
                    document.getElementById('tuesdayStartPM').value = formatTime(availability.startTimePM);
                    document.getElementById('tuesdayEndPM').value = formatTime(availability.endTimePM);
                }
                if (availability.dayOfWeek == 3) {
                    document.getElementById('wednesday').checked = true;
                    document.getElementById('wednesdayStartAM').value = formatTime(availability.startTimeAM);
                    document.getElementById('wednesdayEndAM').value = formatTime(availability.endTimeAM);
                    document.getElementById('wednesdayStartPM').value = formatTime(availability.startTimePM);
                    document.getElementById('wednesdayEndPM').value = formatTime(availability.endTimePM);
                }
                if (availability.dayOfWeek == 4) {
                    document.getElementById('thursday').checked = true;
                    document.getElementById('thursdayStartAM').value = formatTime(availability.startTimeAM);
                    document.getElementById('thursdayEndAM').value = formatTime(availability.endTimeAM);
                    document.getElementById('thursdayStartPM').value = formatTime(availability.startTimePM);
                    document.getElementById('thursdayEndPM').value = formatTime(availability.endTimePM);
                }
                if (availability.dayOfWeek == 5) {
                    document.getElementById('friday').checked = true;
                    document.getElementById('fridayStartAM').value = formatTime(availability.startTimeAM);
                    document.getElementById('fridayEndAM').value = formatTime(availability.endTimeAM);
                    document.getElementById('fridayStartPM').value = formatTime(availability.startTimePM);
                    document.getElementById('fridayEndPM').value = formatTime(availability.endTimePM);
                }
                if (availability.dayOfWeek == 6) {
                    document.getElementById('saturday').checked = true;
                    document.getElementById('saturdayStartAM').value = formatTime(availability.startTimeAM);
                    document.getElementById('saturdayEndAM').value = formatTime(availability.endTimeAM);
                    document.getElementById('saturdayStartPM').value = formatTime(availability.startTimePM);
                    document.getElementById('saturdayEndPM').value = formatTime(availability.endTimePM);
                }
                if (availability.dayOfWeek == 0) {
                    document.getElementById('sunday').checked = true;
                    document.getElementById('sundayStartAM').value = formatTime(availability.startTimeAM);
                    document.getElementById('sundayEndAM').value = formatTime(availability.endTimeAM);
                    document.getElementById('sundayStartPM').value = formatTime(availability.startTimePM);
                    document.getElementById('sundayEndPM').value = formatTime(availability.endTimePM);
                }
            });
        }
    });
}