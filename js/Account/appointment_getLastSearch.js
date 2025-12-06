const params = new URLSearchParams(window.location.search);

const quiParam = params.get('qui') || '';
const treatmentParam = params.get('treatment') || '';
const ouParam = params.get('ou') || '';
const centerParam = params.get('center') || '';

document.getElementById('qui').value = quiParam;
document.getElementById('ou').value = ouParam;

const treatmentSelect = document.getElementById('treatment');
const options = document.querySelectorAll('option');

if (treatmentParam) {
    options.forEach(option => {
        if (option.value === treatmentParam) {
            option.selected = true;
        }
    });
}

if (centerParam) {
    if (typeof loadCentersMap === 'function') {
        loadCentersMap(centerParam);
    } else {
        console.warn("loadCentersMap n'est pas encore défini");
    }
}