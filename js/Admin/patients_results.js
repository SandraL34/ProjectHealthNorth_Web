window.initAutocompletePatient = function() {
    const input = document.getElementById('patient');
    const suggestionsListPatient = document.getElementById('suggestionsPatient');
    const token = localStorage.getItem('jwt');
    window.selectedPatientId = null;

    let debounceTimeout;

    input.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(fetchWithAuthSuggestionsPatient, 300);
    });

    async function fetchWithAuthSuggestionsPatient() {
        const query = input.value.trim();
        if (query.length < 3) {
            suggestionsListPatient.innerHTML = '';
            return;
        }

        suggestionsListPatient.innerHTML = '';

        try {
            const patientRes = await fetchWithAuth(
                `http://localhost:8000/api/patients/search?query=${encodeURIComponent(query)}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            const patients = patientRes.ok ? await patientRes.json() : [];

            const added = new Set();

            patients.forEach(p => {
                const key = `patients-${(p.name)}`;
                if (!added.has(key)) {
                    added.add(key);
                    const li = document.createElement('li');
                    li.textContent = `${p.name}`;
                    li.dataset.type = 'patient';
                    li.dataset.id = p.id;

                    li.addEventListener('click', () => {
                        input.value = li.textContent;
                        window.selectedPatientId = p.id;
                        suggestionsListPatient.innerHTML = '';
                    });
                    suggestionsListPatient.appendChild(li);
                }
            });

        } catch (error) {
            console.error('Erreur autocomplete:', error);
        }
    }
    window.initAutocompletePatient.__executed = true;
};
