(function() {

    const token = localStorage.getItem('jwt');
    if (!token) {
        alert("Vous devez être connecté pour ajouter un centre.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    document.getElementById("buttonAdd").addEventListener("click", async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value || '';

        if (!name) {
            alert("Nom obligatoire");
            return;
        }

        let type = document.getElementById('type').value || '';
        const email = document.getElementById('email').value || '';
        const phoneNumber = document.getElementById('phoneNumber').value || '';
        const address = document.getElementById('address').value || '';
        let latitude = document.getElementById('latitude').value || '';
        let longitude = document.getElementById('longitude').value || '';

        latitude = latitude !== "" ? parseFloat(latitude) : null;
        longitude = longitude !== "" ? parseFloat(longitude) : null;

        if (type == 'other') {
            type = document.getElementById('otherType').value || '';
        }

        const data = {
            name,
            type,
            email,
            phoneNumber,
            address,
            latitude,
            longitude
        };

        try {
            const center = await createCenter(data, token);
            alert("Centre créé avec succès !");
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la création du centre.");
        }
    })

    async function createCenter(data, token) {
        try {
            const response = await fetchWithAuth('http://localhost:8000/api/centers/add', {
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
                throw new Error("Erreur lors de la création du centre");
            }

            return await response.json();

        } catch (err) {
            console.error("Erreur createCenter:", err);
            throw err;
        }
    }
})();