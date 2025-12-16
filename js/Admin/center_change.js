(function() {

    const token = localStorage.getItem('jwt');

    if (!token) {
        alert("Vous devez être connecté pour modifier l'établissement.");
        window.location.href = "../Company/connexion.html";
    }

    const modifyCenter = document.getElementById('modifyCenter');

    const params = new URLSearchParams(window.location.search);
    const centerId = params.get('id');

    modifyCenter.addEventListener('click', async (e) => {

        const id = centerId;

        const name = document.getElementById('name').value || '';
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

        console.log(type);

        const data = {
            id,
            name,
            type,
            email,
            phoneNumber,
            address,
            latitude,
            longitude
        };

        const res = await fetch("http://localhost:8000/api/centers/change", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
    });
})();