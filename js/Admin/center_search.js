document.getElementById('rechercher').addEventListener('click', function(e) {
    e.preventDefault();

    const center = document.getElementById('center').value.trim();

    if (center) {
        const params = new URLSearchParams({ center });
        window.location.href = `center_results.html?${params.toString()}`;
    } else {
        window.location.href = `center_results.html`;
    }
});