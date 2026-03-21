document.addEventListener('DOMContentLoaded', () => {

    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = urlParams.get('id');

    if (!invoiceId) {
        alert("Aucune facture sélectionnée");
        window.location.href = "invoices.html";
        return;
    }

    const form = document.getElementById('paymentForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('jwt');

        try {
            const res = await fetch(`http://localhost:8000/api/invoices/${invoiceId}/pay`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error("Erreur paiement");

            window.location.href = `payment_confirmation.html?id=${invoiceId}`;

        } catch (error) {
            console.error(error);
            alert("Erreur lors du paiement");
        }
    });


    document.getElementById('manualPay').addEventListener('click', async (e) => {
        e.preventDefault();

        const urlParams = new URLSearchParams(window.location.search);
        const invoiceId = urlParams.get('id');
        const token = localStorage.getItem('jwt');

        try {
            const res = await fetch(`http://localhost:8000/api/invoices/${invoiceId}/pay`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error();

            window.location.href = `payment_confirmation.html?id=${invoiceId}`;

        } catch (error) {
            alert("Erreur lors du paiement");
        }
    });

    document.getElementById('invoiceTitle').textContent = `Paiement de la facture #${invoiceId}`;

});