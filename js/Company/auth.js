function logout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('patientId');
    alert("Votre session a expiré ou le token est invalide. Veuillez vous reconnecter.");
    window.location.href = "../Company/connexion.html";
}

function initPage({ headerPath, footerPath, allowedRoles, cssPath = null }) {
    const token = localStorage.getItem('jwt');

    if (!token) {
        alert("Vous devez être connecté pour accéder à cette page.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    let payload;
    try {
        payload = JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        console.error("JWT invalide :", e);
        localStorage.removeItem('jwt');
        window.location.href = "../Company/connexion.html";
        return;
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
        console.warn("JWT expiré !");
        logout();
        return;
    }

    const roles = payload.roles || [];
    const hasAccess = allowedRoles.some(role => roles.includes(role));
    if (!hasAccess) {
        alert("Vous n'êtes pas autorisé à accéder à cette page.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    initHeader(headerPath, cssPath);

    fetch(footerPath)
        .then(res => res.text())
        .then(data => {
            const footerEl = document.getElementById('siteFooter');
            if (footerEl) footerEl.innerHTML = data;
        })
        .catch(err => console.error("Erreur lors du chargement du footer :", err));
}

function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('jwt');

    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`
    };

    return fetch(url, options)
        .then(response => {
            if (response.status === 401 || response.status === 403) {
                console.warn("Token invalide côté serveur !");
                logout();
                throw new Error("Unauthorized");
            }
            return response;
        });
}