window.initAutocompleteCenter = function() {
    const input = document.getElementById('center');
    const suggestionsListCenter = document.getElementById('suggestionsCenter');
    const token = localStorage.getItem('jwt');
    window.selectedCenterId = null;

    let debounceTimeout;

    input.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(fetchSuggestionsCenter, 300);
    });

    async function fetchSuggestionsCenter() {
        const query = input.value.trim();
        if (query.length < 3) {
            suggestionsListCenter.innerHTML = '';
            return;
        }

        suggestionsListCenter.innerHTML = '';

        try {
            const centerRes = await fetch(
                `http://localhost:8000/api/centers/search?query=${encodeURIComponent(query)}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            const centers = centerRes.ok ? await centerRes.json() : [];

            const added = new Set();

            centers.forEach(c => {
                const key = `centers-${(c.name)}`;
                if (!added.has(key)) {
                    added.add(key);
                    const li = document.createElement('li');
                    li.textContent = `${c.name}`;
                    li.dataset.type = 'center';
                    li.dataset.id = c.id;

                    li.addEventListener('click', () => {
                        input.value = li.textContent;
                        window.selectedCenterId = c.id;
                        suggestionsListCenter.innerHTML = '';
                    });
                    suggestionsListCenter.appendChild(li);
                }
            });

        } catch (error) {
            console.error('Erreur autocomplete:', error);
        }
    }
    window.initAutocompleteCenter.__executed = true;
};
