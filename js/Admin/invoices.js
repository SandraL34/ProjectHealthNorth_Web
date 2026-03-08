document.addEventListener('DOMContentLoaded', async function () {

    const token = localStorage.getItem('jwt');

    if (!token) {
        alert("Vous devez être connecté pour voir les factures.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    await loadInvoices();

    async function loadInvoices() {
        try {
            const [unpaidRes, paidRes] = await Promise.all([
                fetch('http://localhost:8000/api/invoices?paid=false', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://localhost:8000/api/invoices?paid=true', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const unpaid = await unpaidRes.json();
            const paid = await paidRes.json();

            renderUnpaid(unpaid);
            renderPaid(paid);

        } catch (error) {
            console.error('Erreur lors du chargement des factures:', error);
        }
    }


    function renderUnpaid(invoices) {
        const container = document.getElementById('invoicesToBePaid');

        if (invoices.length === 0) {
            container.innerHTML = `
                <section class="invoice-section">
                    <h2>Factures à payer</h2>
                    <p class="empty-message">Aucune facture en attente de paiement.</p>
                </section>`;
            return;
        }

        container.innerHTML = `
            <section class="invoice-section unpaid-section">
                <h2>Factures à payer <span class="badge badge-unpaid">${invoices.length}</span></h2>
                <div class="invoice-list">
                    ${invoices.map(invoice => renderInvoiceCard(invoice, false)).join('')}
                </div>
            </section>`;

        container.querySelectorAll('.btn-pay').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                await markAsPaid(id);
            });
        });

        container.querySelectorAll('.btn-detail').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                openModal(invoices.find(i => i.id == id));
            });
        });
    }

    function renderPaid(invoices) {
        const container = document.getElementById('paidInvoices');

        if (invoices.length === 0) {
            container.innerHTML = `
                <section class="invoice-section">
                    <h2>Factures payées</h2>
                    <p class="empty-message">Aucune facture payée pour le moment.</p>
                </section>`;
            return;
        }

        container.innerHTML = `
            <section class="invoice-section paid-section">
                <h2>Factures payées <span class="badge badge-paid">${invoices.length}</span></h2>
                <div class="invoice-list">
                    ${invoices.map(invoice => renderInvoiceCard(invoice, true)).join('')}
                </div>
            </section>`;

        container.querySelectorAll('.btn-detail').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                openModal(invoices.find(i => i.id == id));
            });
        });
    }

    function renderInvoiceCard(invoice, isPaid) {
        const date = invoice.appointment?.date
            ? new Date(invoice.appointment.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
            : 'Date inconnue';

        const price = invoice.price != null
            ? `${parseFloat(invoice.price).toFixed(2)} €`
            : 'Prix non défini';

        return `
            <div class="invoice-card ${isPaid ? 'is-paid' : 'is-unpaid'}">
                <div class="invoice-card-header">
                    <span class="invoice-id">#${invoice.id}</span>
                    <span class="invoice-status ${isPaid ? 'status-paid' : 'status-unpaid'}">
                        ${isPaid ? '✓ Payée' : '⏳ En attente'}
                    </span>
                </div>

                <div class="invoice-card-body">
                    <div class="invoice-info">
                        <span class="info-label">Patient</span>
                        <span class="info-value">${invoice.patient?.firstname ?? 'N/A'} ${invoice.patient?.lastname ?? ''}</span>
                    </div>
                    <div class="invoice-info">
                        <span class="info-label">Médecin</span>
                        <span class="info-value">Dr ${invoice.doctor?.firstname ?? 'N/A'} ${invoice.doctor?.lastname ?? ''}</span>
                    </div>
                    <div class="invoice-info">
                        <span class="info-label">Traitement</span>
                        <span class="info-value">${invoice.treatment?.name ?? 'N/A'}</span>
                    </div>
                    <div class="invoice-info">
                        <span class="info-label">Date</span>
                        <span class="info-value">${date}</span>
                    </div>
                    <div class="invoice-info invoice-price">
                        <span class="info-label">Montant</span>
                        <span class="info-value price">${price}</span>
                    </div>
                </div>

                <div class="invoice-card-footer">
                    <button class="btn btn-detail" data-id="${invoice.id}">Voir détail</button>
                    ${!isPaid ? `<button class="btn btn-pay" data-id="${invoice.id}">Marquer comme payée</button>` : ''}
                </div>
            </div>`;
    }

    async function markAsPaid(id) {
        try {
            const res = await fetch(`http://localhost:8000/api/invoices/${id}/pay`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Erreur lors du paiement');

            await loadInvoices();
        } catch (error) {
            console.error('Erreur:', error);
            alert('Une erreur est survenue lors du marquage de la facture.');
        }
    }

    function openModal(invoice) {
        document.getElementById('invoice-modal')?.remove();

        const date = invoice.appointment?.date
            ? new Date(invoice.appointment.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
            : 'Date inconnue';

        const time = invoice.appointment?.time
            ? invoice.appointment.time.substring(0, 5)
            : '';

        const price = invoice.price != null
            ? `${parseFloat(invoice.price).toFixed(2)} €`
            : 'Prix non défini';

        const modal = document.createElement('div');
        modal.id = 'invoice-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-box">
                <div class="modal-header">
                    <h3>Facture <span>#${invoice.id}</span></h3>
                    <button class="modal-close" id="closeModal">✕</button>
                </div>
                <div class="modal-body">
                    <div class="modal-row">
                        <span>Statut</span>
                        <span class="${invoice.isPaid ? 'status-paid' : 'status-unpaid'}">
                            ${invoice.isPaid ? '✓ Payée' : '⏳ En attente'}
                        </span>
                    </div>
                    <div class="modal-row">
                        <span>Patient</span>
                        <span>${invoice.patient?.firstname ?? 'N/A'} ${invoice.patient?.lastname ?? ''}</span>
                    </div>
                    <div class="modal-row">
                        <span>Médecin</span>
                        <span>Dr ${invoice.doctor?.firstname ?? 'N/A'} ${invoice.doctor?.lastname ?? ''}</span>
                    </div>
                    <div class="modal-row">
                        <span>Traitement</span>
                        <span>${invoice.treatment?.name ?? 'N/A'}</span>
                    </div>
                    <div class="modal-row">
                        <span>Date du RDV</span>
                        <span>${date}${time ? ' à ' + time : ''}</span>
                    </div>
                    <div class="modal-row modal-total">
                        <span>Montant total</span>
                        <span>${price}</span>
                    </div>
                </div>
                <div class="modal-footer">
                    ${!invoice.isPaid ? `<button class="btn btn-pay" id="modalPayBtn" data-id="${invoice.id}">Marquer comme payée</button>` : ''}
                    <button class="btn btn-secondary" id="closeModalBtn">Fermer</button>
                </div>
            </div>`;

        document.body.appendChild(modal);

        modal.querySelector('#closeModal').addEventListener('click', () => modal.remove());
        modal.querySelector('#closeModalBtn').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

        modal.querySelector('#modalPayBtn')?.addEventListener('click', async () => {
            await markAsPaid(invoice.id);
            modal.remove();
        });
    }
});
