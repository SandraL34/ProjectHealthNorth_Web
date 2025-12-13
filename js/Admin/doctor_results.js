document.addEventListener("DOMContentLoaded", getSpecialistResults);

async function getSpecialistResults() {

    const token = localStorage.getItem('jwt');

    if (!token) {
        alert("Vous devez être connecté pour accéder à vos résultats.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/api/doctors/results', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error("Impossible de récupérer les résultats.");

        const results = await response.json();

        filterResults(results);

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
            window.location.href = `doctor.html`;
        });
    }

    results.forEach(item => {
        const divResults = document.createElement('div');
        divResults.classList.add('module');
        container.appendChild(divResults);
            
        const center = item.center || {};

        const doctorId = item.id || {};

        divResults.innerHTML = `
            <h2>Dr ${item.firstname ?? ''} ${item.lastname ?? ''}</h2>
            <div class="gridAddress">
                <img src="../images/icons/Icon_localization.png" alt="Icon localization" class="icon grid1">
                <p>Centre : ${center.name ?? '—'}, ${center.address ?? ''}</p>
            </div>
        `;

        const modifyButton = document.createElement('button');
        modifyButton.classList.add('bouton');
        modifyButton.textContent = 'Modifier le spécialiste';
        divResults.appendChild(modifyButton);
        modifyButton.addEventListener('click', () => {
            window.location.href = `doctor_change.html?id=${doctorId}`;
        })
    })

    const createDoctor = document.createElement('div'); 
    container.appendChild(createDoctor);
    createDoctor.innerHTML=`
        <h2>Vous n'avez pas trouvé votre spécialiste ? Créez le !</h2>
        <button class="bouton" id='createButton'>Créer un spécialiste</button>
        `;

    const createButton = document.getElementById('createButton');
    createButton.addEventListener('click', () => {
        window.location.href = `doctor_add.html`;
    });
}

function filterResults(results) {
    const params = new URLSearchParams(window.location.search);
    const doctorParam = params.get('doctor')?.toLowerCase() || "";

    const filtered = results.filter(item => {

        if (doctorParam) {
            const fullName = `${item.firstname ?? ""} ${item.lastname ?? ""}`.toLowerCase();
            if (!fullName.includes(doctorParam)) return false;
        }

        return true;
    });

    renderResults(filtered);
}