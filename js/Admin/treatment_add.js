(function() {

    const token = localStorage.getItem('jwt');
    if (!token) {
        alert("Vous devez être connecté pour ajouter un acte.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    document.getElementById("buttonAdd").addEventListener("click", async (e) => {
        const name = document.getElementById('name').value || '';

        if (!name) {
            alert("Nom obligatoire");
            return;
        }

        let category = document.getElementById('category').value || '';
        const duration = document.getElementById('duration').value || '';
        const price = document.getElementById('price').value || '';

        if (category == 'other') {
            category = document.getElementById('otherCategory').value || '';
        }

        const data = {
            name,
            category,
            duration,
            price
        };

        try {
            const treatment = await createTreatment(data, token);
            alert("Acte créé avec succès !");
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la création de l'acte.");
        }
    })

    async function createTreatment(data, token) {
        try {
            const response = await fetchWithAuth('http://localhost:8000/api/treatments/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("SERVER RESPONSE:", errorText);
                throw new Error("Erreur lors de la création de l'acte");
            }

            return await response.json();

        } catch (err) {
            console.error("Erreur createTreatment:", err);
            throw err;
        }
    }
})();