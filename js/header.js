function initHeader(headerPath, cssPath = null) {
    fetch(headerPath)
    .then(response => response.text())
    .then(data => {
        document.getElementById("header").innerHTML = data;

        if (cssPath) {
            const link = document.getElementById("header-css");
            if (link) link.href = cssPath;
        }
    })
    .catch(error => console.error("Erreur lors du chargement du header :", error));
}