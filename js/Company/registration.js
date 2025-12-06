document.getElementById("registrationButton").addEventListener("click", async (e) => {

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const phoneNumber = document.getElementById('phone').value;

    if (password !== confirmPassword) {
        alert("Les mots de passe ne correspondent pas.");
        return;
    }

    const data = { email, password, phoneNumber };

    try {
        const patient = await createPatient(data);
        console.log("SUCCESS:", patient);
        window.location.href = "registration_confirmation.html";
    } catch (error) {
        console.error(error);
        alert("Erreur lors de la création du patient.");
    }
});

async function createPatient(data) {
    try {
        const response = await fetch('http://localhost:8000/registration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("SERVER RESPONSE:", errorText);
            throw new Error("Erreur lors de la création du patient");
        }

        return await response.json();
    } catch (err) {
        console.error("Erreur createPatient:", err);
        throw err;
    }
}