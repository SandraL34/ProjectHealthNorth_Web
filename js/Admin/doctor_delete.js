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
        alert("ID du docteur manquant.");
        return;
    }

    deleteDoctor(id);

    async function deleteDoctor(id) {
        try { 
            const response = await fetch (`http://localhost:8000/api/doctors/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("SERVER RESPONSE:", errorText);
                throw new Error("Erreur lors de la suppression du docteur");
            }

            alert("Docteur supprimé avec succès");

        } catch (err) {
            console.error("Erreur deleteDoctor:", err);
            alert("Erreur lors de la suppression du docteur.");
        }
    }
})();
