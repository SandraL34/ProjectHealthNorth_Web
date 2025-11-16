function initPage({ headerPath, footerPath, allowedRoles }) {
    const token = localStorage.getItem('jwt');

    // Vérification JWT
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

    // Chargement du header
    fetch(headerPath)
        .then(response => response.text())
        .then(data => {
            const headerEl = document.getElementById('headerAdmin') || document.getElementById('headerAccount');
            if (headerEl) {
                headerEl.innerHTML = data;

                // Attache logout après insertion
                const logoutBtn = document.getElementById('logoutButton');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => {
                        localStorage.removeItem('jwt');
                        window.location.href = "../Company/connexion.html";
                    });
                }
            }
        })
        .catch(err => console.error("Erreur lors du chargement du header :", err));

    // Chargement du footer
    fetch(footerPath)
        .then(response => response.text())
        .then(data => {
            const footerEl = document.getElementById('siteFooter');
            if (footerEl) {
                footerEl.innerHTML = data;
            }
        })
        .catch(err => console.error("Erreur lors du chargement du footer :", err));
}