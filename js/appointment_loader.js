function loadAppointments(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve(src);
        script.onerror = () => reject(new Error(`Erreur chargement script : ${src}`));
        document.body.appendChild(script);
    });
}

function waitForFunction(fnName) {
    return new Promise((resolve) => {
        const check = () => {
            if (typeof window[fnName] === "function" && window[fnName].__executed) {
                resolve();
            } else {
                requestAnimationFrame(check);
            }
        };
        check();
    });
}

function wrapExecution(name) {
    const original = window[name];
    if (typeof original !== "function") return;

    window[name] = async function (...args) {
        await original(...args);
        window[name].__executed = true;
    };

    window[name].__executed = false;
}

document.addEventListener("DOMContentLoaded", async () => {
    const group1 = [
        "../js/appointmentComing.js",
        "../js/appointmentPast.js",
        "../js/appointment_centers_map.js",
        "../js/appointment_treatment_list.js",
        "../js/appointment_search_what.js",
        "../js/appointment_search_where.js"
    ];

    await Promise.all(group1.map(loadAppointments));

    wrapExecution("getTreatmentList");
    wrapExecution("initAutocompleteWhat");
    wrapExecution("initAutocompleteWhere");

    const urlParams = new URLSearchParams(window.location.search);
    const selectedCenterId = urlParams.get("center");

    if (window.getAppointmentData) getAppointmentData();
    if (window.getPastAppointmentData) getPastAppointmentData();
    if (window.loadCentersMap) loadCentersMap(selectedCenterId);
    if (window.getTreatmentList) getTreatmentList();
    if (window.initAutocompleteWhat) initAutocompleteWhat();
    if (window.initAutocompleteWhere) initAutocompleteWhere();

    await Promise.all([
        waitForFunction("getTreatmentList"),
        waitForFunction("initAutocompleteWhat"),
        waitForFunction("initAutocompleteWhere"),
    ]);

    await loadAppointments("../js/appointment_search.js");
    await loadAppointments("../js/appointment_getLastSearch.js");

});