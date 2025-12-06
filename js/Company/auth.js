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