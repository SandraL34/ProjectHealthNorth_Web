document.getElementById('rechercher').addEventListener('click', function(e) {
    e.preventDefault();

    const patientId = window.selectedPatientId;
    const patientName = document.getElementById('patient').value.trim();

    if (!patientId) {
        alert('Veuillez sélectionner un patient dans la liste.');
        return;
    }

    window.location.href = `documents_patient.html?patientId=${patientId}&patient=${encodeURIComponent(patientName)}`;
});