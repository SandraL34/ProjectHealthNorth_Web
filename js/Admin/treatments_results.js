document.addEventListener("DOMContentLoaded", getTreatmentsResults);

async function getTreatmentsResults() {

    const token = localStorage.getItem('jwt');

    if (!token) {
        alert("Vous devez être connecté pour accéder aux actes proposés.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/api/treatments/list', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error("Impossible de récupérer les actes proposés.");

        const results = await response.json();

        const flatResults = Object.entries(results).flatMap(
            ([category, treatments]) =>
                treatments.map(t => ({ ...t, category }))
        );

        filterResults(flatResults);

    } catch (error) {
        console.error(error);
        alert("Erreur lors du chargement des résultats.");
    }
}

function renderResults(results) {
    const container = document.getElementById('container');

    if (results.length == 0) {
        const divResults = document.createElement('div');
        divResults.classList.add('module');
        container.appendChild(divResults);
        divResults.innerHTML = `Aucun résultat correspondant`;
        const backButton = document.createElement('button');
        backButton.classList.add('bouton');
        backButton.textContent = 'Retour à la recherche';
        divResults.appendChild(backButton);
        
        backButton.addEventListener('click', () => {
            window.location.href = `treatment.html`;
        });
    }

    results.forEach(item => {
        const divResults = document.createElement('div');
        divResults.classList.add('module');
        container.appendChild(divResults);
            
        divResults.innerHTML = `
            <h2>${item.name ?? ''}</h2>
            <div class="gridDisplayTreatment">
                <p class="bold">Catégorie</p>
                <p>${item.category ?? '—'}</p>
                <p class="bold">Durée</p>
                <p>${item.duration ?? '—'} min</p>
                <p class="bold">Prix</p>
                <p>${item.price ?? '—'} €</p>
            </div>
        `;

        const divButtons = document.createElement('div');
        divButtons.classList.add('buttonsContainer');
        divResults.appendChild(divButtons);

        const modifyButton = document.createElement('button');
        modifyButton.classList.add('bouton');
        modifyButton.textContent = `Modifier l'acte`;
        divButtons.appendChild(modifyButton);
        modifyButton.addEventListener('click', () => {
            window.location.href = `treatment_change.html?id=${item.id}`;
        })

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('bouton');
        deleteButton.textContent = `Supprimer l'acte`;
        divButtons.appendChild(deleteButton);
        deleteButton.addEventListener('click', () => {
            if (!confirm("Voulez-vous vraiment supprimer cet acte ? Cette action est irréversible.")) return;
            window.location.href = `treatment_delete_confirmation.html?id=${doctorId}`;
        })
    })

    const createTreatment = document.createElement('div'); 
    container.appendChild(createTreatment);
    createTreatment.innerHTML=`
        <h2>Vous n'avez pas trouvé l'acte proposé ? Créez le !</h2>
        <button class="bouton" id='createButton'>Créer un acte</button>
        `;

    const createButton = document.getElementById('createButton');
    createButton.addEventListener('click', () => {
        window.location.href = `treatment_add.html`;
    });
}

function filterResults(results) {
    const params = new URLSearchParams(window.location.search);
    const treatmentParam = params.get('treatment')?.toLowerCase() || "";

    const filtered = results.filter(item => {

        if (treatmentParam) {
            if (!item.name?.toLowerCase().includes(treatmentParam)) return false;
        }

        return true;
    });

    renderResults(filtered);
}