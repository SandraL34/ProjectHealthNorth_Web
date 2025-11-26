document.getElementById('lastSearch').addEventListener('click', function(e) {
    e.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);

    const qui = urlParams.get('qui') || '';
    const ou = urlParams.get('ou') || '';
    const treatment = urlParams.get('treatment') || '';
    // const center = urlParams.get('center') || '';*/

    if (qui) urlParams.set('qui', qui);
    if (treatment && treatment !== 'tous') urlParams.set('treatment', treatment);
    if (ou) urlParams.set('ou', ou);
    // if (center) params.set('center', center);*/

    window.location.href = `appointment.html?${urlParams.toString()}`;
})