document.addEventListener("DOMContentLoaded", getCentersResults);

async function getCentersResults() {

    const token = localStorage.getItem('jwt');

    if (!token) {
        alert("Vous devez être connecté pour accéder aux établissements.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    try {
        const response = await fetchWithAuth('http://localhost:8000/api/centers/map', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error("Impossible de récupérer les établissements.");

        const results = await response.json();

        filterResults(results);

    } catch (error) {
        console.error(error);
        alert("Erreur lors du chargement des établissements.");
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
            window.location.href = `center.html`;
        });
    }

    results.forEach(item => {
        const divResults = document.createElement('div');
        divResults.classList.add('module');
        container.appendChild(divResults);
            
        divResults.innerHTML = `
            <h2>${item.name ?? ''}</h2>
            <div class="gridDisplayCenter">
                <img src="../images/icons/Icon_localization.png" alt="Icon localization" class="icon grid1">
                <p>Adresse : ${item.address ?? ''}</p>
            </div>
        `;

        const divButtons = document.createElement('div');
        divButtons.classList.add('buttonsContainer');
        divResults.appendChild(divButtons);

        const modifyButton = document.createElement('button');
        modifyButton.classList.add('bouton');
        modifyButton.textContent = `Modifier le centre`;
        divButtons.appendChild(modifyButton);
        modifyButton.addEventListener('click', () => {
            window.location.href = `center_change.html?id=${item.id}`;
        })

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('bouton');
        deleteButton.textContent = `Supprimer le centre`;
        divButtons.appendChild(deleteButton);
        deleteButton.addEventListener('click', () => {
            if (!confirm("Voulez-vous vraiment supprimer ce centre ? Cette action est irréversible.")) return;
            window.location.href = `center_delete_confirmation.html?id=${item.id}`;
        })
    })

    const createTreatment = document.createElement('div'); 
    container.appendChild(createTreatment);
    createTreatment.innerHTML=`
        <h2>Vous n'avez pas trouvé l'établissement recherché ? Créez le !</h2>
        <button class="bouton" id='createButton'>Créer un établissement</button>
        `;

    const createButton = document.getElementById('createButton');
    createButton.addEventListener('click', () => {
        window.location.href = `center_add.html`;
    });
}

function filterResults(results) {
    const params = new URLSearchParams(window.location.search);
    const centerParam = params.get('center')?.toLowerCase() || "";

    const filtered = results.filter(item => {

        if (centerParam) {
            if (!item.name?.toLowerCase().includes(centerParam)) return false;
        }

        return true;
    });

    renderResults(filtered);
}