async function updateProfileProgress() {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
        const response = await fetch('http://localhost:8000/api/patient/medicalRecord', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Impossible de récupérer le dossier médical');

        const patient = await response.json();

        // Calcul du pourcentage
        const fields = ['firstname','lastname','email','phoneNumber','postalAddress','allergy','medicalTraitmentDisease','medicalHistory','picture','socialsecurityNumber','socialsecurityRegime','healthcareInsurance'];
        let filled = 0;
        fields.forEach(field => { if (patient[field]) filled++; });
        const percent = Math.round((filled / fields.length) * 100);

        document.getElementById('progresDossier').value = percent;

        document.querySelector('.progres .legend').textContent = `Complété à ${percent}%`;

    } catch (error) {
        console.error(error);
    }
}