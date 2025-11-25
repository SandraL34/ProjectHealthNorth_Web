window.initAutocompleteWhat = function() {
    const input = document.getElementById('qui');
    const suggestionsListQui = document.getElementById('suggestionsQui');
    const token = localStorage.getItem('jwt');

    let debounceTimeout;

    input.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(fetchSuggestionsQui, 300);
    });

    async function fetchSuggestionsQui() {
        const query = input.value.trim();
        if (query.length < 3) {
            suggestionsListQui.innerHTML = '';
            return;
        }

        suggestionsListQui.innerHTML = '';

        try {
            const doctorsRes = await fetch(
                `http://localhost:8000/api/doctors/search?query=${encodeURIComponent(query)}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            const doctors = doctorsRes.ok ? await doctorsRes.json() : [];

            const added = new Set();

            doctors.forEach(d => {
                const key = `doctor-${d.id ?? (d.firstname + d.lastname)}`;
                if (!added.has(key)) {
                    added.add(key);
                    const li = document.createElement('li');
                    li.textContent = `${d.firstname} ${d.lastname}`;
                    li.dataset.type = 'doctor';
                    li.addEventListener('click', () => {
                        input.value = li.textContent;
                        suggestionsListQui.innerHTML = '';
                    });
                    suggestionsListQui.appendChild(li);
                    console.log('Added doctor suggestion:', li.textContent);
                }
            });

            suggestionsListQui.style.width = `${input.offsetWidth}px`;

        } catch (error) {
            console.error('Erreur autocomplete:', error);
        }
    }
};
