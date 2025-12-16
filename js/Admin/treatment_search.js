document.getElementById('rechercher').addEventListener('click', function(e) {
    e.preventDefault();

    const treatment = document.getElementById('treatment').value.trim();

    if (treatment) {
        const params = new URLSearchParams({ treatment });
        window.location.href = `treatment_results.html?${params.toString()}`;
    } else {
        window.location.href = `treatment_results.html`;
    }
});