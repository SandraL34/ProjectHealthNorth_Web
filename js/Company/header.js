function initHeader(headerPath, cssPath = null) {
    fetch(headerPath)
        .then(res => res.text())
        .then(data => {
            const headerEl = document.getElementById('header');
            if (!headerEl) return;

            headerEl.innerHTML = data;

            if (cssPath) {
                let link = document.getElementById('header-css');
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.id = 'header-css';
                    document.head.appendChild(link);
                }
                link.href = cssPath;
            }

            const logoutBtn = document.getElementById('logoutButton');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    localStorage.removeItem('jwt');
                    window.location.href = "../Company/connexion.html";
                });
            }
        })
        .catch(err => console.error("Erreur lors du chargement du header :", err));
}