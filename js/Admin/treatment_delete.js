(function () {
    const token = localStorage.getItem('jwt');

    if (!token) {
        alert("Vous devez être connecté.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'), 10);

    if (!id) {
        alert("ID de l'acte manquant.");
        return;
    }

    deleteTreatment(id);

    async function deleteTreatment(id) {
        try { 
            const response = await fetchWithAuth (`http://localhost:8000/api/treatments/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("SERVER RESPONSE:", errorText);
                throw new Error("Erreur lors de la suppression de l'acte");
            }

            alert("Acte supprimé avec succès");

        } catch (err) {
            console.error("Erreur deleteTreatment:", err);
            alert("Erreur lors de la suppression de l'acte.");
        }
    }
})();
