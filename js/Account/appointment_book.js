const params = new URLSearchParams(window.location.search);

const doctorParam = params.get('doctorName') || '';
const centerParam = params.get('centerName') || '';
const dateParam = params.get('date') || '';
const timeParam = params.get('time') || '';
const treatmentParam = params.get('treatmentName') || '';

const recap = document.createElement('div');
document.getElementById('recapBooking').appendChild(recap);

    recap.innerHTML = 
        `<p>Rendez-vous le ${dateParam} à ${timeParam} avec le dr ${doctorParam} à ${centerParam} pour ${treatmentParam}</p>`;