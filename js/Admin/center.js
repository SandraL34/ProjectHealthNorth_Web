const token = localStorage.getItem('jwt');

if (!token) {
    alert("Vous devez être connecté pour accéder à la modification des établissements.");
    window.location.href = "../Company/connexion.html";
}

async function getCenterInfo() {
    try {
        const response = await fetch('http://localhost:8000/api/centers/map', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Impossible d'accéder à la modification du centre`);
        }

        const results = await response.json();

        fillTreatmentInfo(results);
    } catch (error) {
        console.error(error);
        alert("Erreur lors du chargement de l'établissement.");
    }
}

async function fillTreatmentInfo(centers) {
    const params = new URLSearchParams(window.location.search);
    const centerId = params.get('id') || '';

    const select = document.getElementById("type");
    select.innerHTML = '<option class="bold" value="other">Autre (seulement si absent de la liste)</option>';

    const addedTypes = new Set();

    centers.forEach(item => {
        if (item.type && !addedTypes.has(item.type)) {
            addedTypes.add(item.type);

            const option = document.createElement("option");
            option.value = item.type;
            option.textContent = item.type;
            select.appendChild(option);
        }
        
        if (item.id == centerId) {
            document.getElementById('name').value = item.name || '';
            document.getElementById('type').value = item.type || '';
            document.getElementById('email').value = item.email || '';
            document.getElementById('phoneNumber').value = item.phoneNumber || '';
            document.getElementById('address').value = item.address || '';
            document.getElementById('latitude').value = item.latitude || '';
            document.getElementById('longitude').value = item.longitude || '';
            
            const options = document.querySelectorAll('option');
            options.forEach(option => {
                if (option.value === item.type) {
                    option.selected = true;
                }
            });
        }
    });
}