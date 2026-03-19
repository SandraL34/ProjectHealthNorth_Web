const token = localStorage.getItem('jwt');

if (!token) {
    alert("Vous devez être connecté pour accéder à la modification des actes.");
    window.location.href = "../Company/connexion.html";
}

async function getTreatmentInfo() {
    try {
        const response = await fetchWithAuth('http://localhost:8000/api/treatments/list', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Impossible d'accéder à la modification de l'acte`);
        }

        const treatments = await response.json();

        const flatResults = Object.entries(treatments).flatMap(
            ([category, treatments]) =>
                treatments.map(t => ({ ...t, category }))
        );

        fillTreatmentInfo(flatResults);
    } catch (error) {
        console.error(error);
        alert("Erreur lors du chargement de la modification de l'acte.");
    }
}

async function fillTreatmentInfo(treatments) {
    const params = new URLSearchParams(window.location.search);
    const treatmentId = params.get('id') || '';

    const select = document.getElementById("category");
    select.innerHTML = '<option class="bold" value="other">Autre (seulement si absent de la liste)</option>';

    const addedCategories = new Set();

    treatments.forEach(item => {
        if (item.category && !addedCategories.has(item.category)) {
            addedCategories.add(item.category);

            const option = document.createElement("option");
            option.value = item.category;
            option.textContent = item.category;
            select.appendChild(option);
        }
        
        if (item.id == treatmentId) {
            document.getElementById('name').value = item.name || '';
            document.getElementById('duration').value = item.duration || '';
            document.getElementById('price').value = item.price || '';
            
            const options = document.querySelectorAll('option');
            options.forEach(option => {
                if (option.value === item.category) {
                    option.selected = true;
                }
            });
        }
    });
}