(function() {

    const token = localStorage.getItem('jwt');

    if (!token) {
        alert("Vous devez être connecté pour modifier les actes.");
        window.location.href = "../Company/connexion.html";
    }

    const modifyTreatment = document.getElementById('modifyTreatment');

    const params = new URLSearchParams(window.location.search);
    const treatmentId = params.get('id');

    modifyTreatment.addEventListener('click', async (e) => {

        const id = treatmentId;

        const name = document.getElementById('name').value || '';
        let category = document.getElementById('category').value || '';
        const duration = document.getElementById('duration').value || '';
        const price = document.getElementById('price').value || '';

        if (category == 'other') {
            category = document.getElementById('otherCategory').value || '';
        }

        const data = {
            id,
            name,
            category,
            duration,
            price
        };

        const res = await fetch("http://localhost:8000/api/treatments/change", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
    });
})();