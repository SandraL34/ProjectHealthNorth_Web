window.initAutocomplete = function() {
    const input = document.getElementById('qui');
    const suggestionsList = document.getElementById('suggestions');
    const token = localStorage.getItem('jwt');

    let debounceTimeout;

    input.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(fetchSuggestions, 300);
    });

    async function fetchSuggestions() {
        const query = input.value.trim();
        if (query.length < 3) {
            suggestionsList.innerHTML = '';
            return;
        }

        suggestionsList.innerHTML = '';

        try {
            const [doctorsRes, centersRes] = await Promise.all([
                fetch(`http://localhost:8000/api/doctors/search?query=${encodeURIComponent(query)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`http://localhost:8000/api/centers/search?query=${encodeURIComponent(query)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const doctors = doctorsRes.ok ? await doctorsRes.json() : [];
            const centers = centersRes.ok ? await centersRes.json() : [];

            console.log('doctors:', doctors);
            console.log('centers:', centers);

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
                        suggestionsList.innerHTML = '';
                    });
                    suggestionsList.appendChild(li);
                    console.log('Added doctor suggestion:', li.textContent);
                }
            });

            centers.forEach(c => {
                const key = `center-${c.id ?? c.name}`;
                if (!added.has(key)) {
                    added.add(key);
                    const li = document.createElement('li');
                    li.textContent = c.name;
                    li.dataset.type = 'center';
                    li.addEventListener('click', () => {
                        input.value = li.textContent;
                        suggestionsList.innerHTML = '';
                    });
                    suggestionsList.appendChild(li);
                    console.log('Added center suggestion:', li.textContent);
                }
            });

            // Ajuste la largeur de la liste pour correspondre à l'input
            suggestionsList.style.width = `${input.offsetWidth}px`;

        } catch (error) {
            console.error('Erreur autocomplete:', error);
        }
    }
};
