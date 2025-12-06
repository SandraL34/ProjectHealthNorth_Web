fetch("../Company/footer.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("siteFooter").innerHTML = data;
    })
    .catch(error => console.error("Erreur lors du chargement du footer :", error));

if (!document.querySelector('link[href="../style/style_footer.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "../style/style_footer.css";
    document.head.appendChild(link);
}