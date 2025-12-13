window.initAutocompleteTreatment = function() {
    const input = document.getElementById('treatment');
    const suggestionsListTreatment = document.getElementById('suggestionsTreatment');
    const token = localStorage.getItem('jwt');

    let debounceTimeout;

    input.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(fetchSuggestionsTreatment, 300);
    });

    async function fetchSuggestionsTreatment() {
        const query = input.value.trim();
        if (query.length < 3) {
            suggestionsListTreatment.innerHTML = '';
            return;
        }

        suggestionsListTreatment.innerHTML = '';

        try {
            const treatmentsRes = await fetch(
                `http://localhost:8000/api/treatments/search?query=${encodeURIComponent(query)}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            const treatments = treatmentsRes.ok ? await treatmentsRes.json() : [];

            const added = new Set();

            treatments.forEach(t => {
                const key = `treatments-${(t.name)}`;
                if (!added.has(key)) {
                    added.add(key);
                    const li = document.createElement('li');
                    li.textContent = `${t.name}`;
                    li.dataset.type = 'treatment';
                    li.addEventListener('click', () => {
                        input.value = li.textContent;
                        suggestionsListTreatment.innerHTML = '';
                    });
                    suggestionsListTreatment.appendChild(li);
                }
            });

        } catch (error) {
            console.error('Erreur autocomplete:', error);
        }
    }
    window.initAutocompleteTreatment.__executed = true;
};
