document.getElementById('rechercher').addEventListener('click', function(e) {
    e.preventDefault();

    const qui = document.getElementById('qui').value.trim();
    const treatment = document.getElementById('treatment').value;
    const ou = document.getElementById('ou').value.trim();

    const params = new URLSearchParams({
        qui: qui,
        treatment: treatment,
        ou: ou
    });

    window.location.href = `appointment_results.html?${params.toString()}`;
});