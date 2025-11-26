window.initAutocompleteWhere = function() {
    const input = document.getElementById('ou');
    const suggestionsListOu = document.getElementById('suggestionsOu');
    const token = localStorage.getItem('jwt');

    let debounceTimeout;

    input.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(fetchSuggestionsOu, 300);
    });

    async function fetchSuggestionsOu() {
        const query = input.value.trim();
        if (query.length < 2) {
            suggestionsListOu.innerHTML = '';
            return;
        }

        suggestionsListOu.innerHTML = '';

        try {
            const centersRes = await fetch(
                `http://localhost:8000/api/centers/search?query=${encodeURIComponent(query)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            const centers = centersRes.ok ? await centersRes.json() : [];

            console.log('centers:', centers);

            const added = new Set();

            centers.forEach(c => {
                const key = `center-${c.id ?? c.name}`;
                if (!added.has(key)) {
                    added.add(key);
                    const li = document.createElement('li');
                    li.textContent = c.name;
                    li.dataset.type = 'center';
                    li.addEventListener('click', () => {
                        input.value = li.textContent;
                        suggestionsListOu.innerHTML = '';
                    });
                    suggestionsListOu.appendChild(li);
                    console.log('Added center suggestion:', li.textContent);
                }
            });

            suggestionsListOu.style.width = `${input.offsetWidth}px`;

        } catch (error) {
            console.error('Erreur autocomplete:', error);
        }
    }
    window.initAutocompleteWhere.__executed = true;
};
