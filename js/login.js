const loginButton = document.getElementById('loginButton');

loginButton.addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        alert("Veuillez remplir tous les champs !");
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error("Réponse HTML reçue au lieu de JSON :", text);
            alert("Erreur serveur : réponse inattendue (voir console)");
            return;
        }

        const data = await response.json();

        if (data.error) {
            alert(data.error);
            return;
        }

        if (!data.token) {
            alert("Erreur serveur inattendue : token manquant");
            return;
        }

        const token = data.token;
        localStorage.setItem('jwt', token);

        const payload = JSON.parse(atob(token.split('.')[1]));
        const roles = payload.roles || [];

        if (roles.includes('ROLE_ADMIN')) {
            window.location.href = '../Admin/accountAdmin.html';
        } else if (roles.includes('ROLE_DOCTOR')) {
            window.location.href = '../Admin/accountAdmin.html';
        } else if (roles.includes('ROLE_PATIENT')) {
            window.location.href = '../Account/account.html';
        } else {
            alert("Rôle inconnu, contactez l'administrateur.");
        }

    } catch (err) {
        console.error("Erreur fetch/login :", err);
        alert("Erreur lors de la connexion : " + err.message);
    }
});