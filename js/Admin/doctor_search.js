document.getElementById('rechercher').addEventListener('click', function(e) {
    e.preventDefault();

    const doctor = document.getElementById('qui').value.trim();

    if (doctor) {
        const params = new URLSearchParams({ doctor });
        window.location.href = `doctor_results.html?${params.toString()}`;
    } else {
        window.location.href = `doctor_results.html`;
    }
});