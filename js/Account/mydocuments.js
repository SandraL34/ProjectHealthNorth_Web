document.addEventListener('DOMContentLoaded', async function () {

    const token = localStorage.getItem('jwt');
    if (!token) {
        alert("Vous devez être connecté pour accéder à vos documents.");
        window.location.href = "../Company/connexion.html";
        return;
    }

    const section = document.getElementById('documentsSection');

    await loadDocuments();

    async function loadDocuments() {

        try {

            const res = await fetch(`http://localhost:8000/api/documents`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const documents = await res.json();

            renderDocuments(documents);

        } catch (err) {

            console.error("Erreur chargement documents :", err);

        }

    }

    function renderDocuments(documents) {

        const groups = {};

        for (const doc of documents) {

            const type = doc.type || 'autre';

            if (!groups[type]) groups[type] = [];

            groups[type].push(doc);
        }

        const typeLabels = {
            prescription: '📋 Ordonnances',
            radio: '🩻 Radios & imagerie',
            facture: '🧾 Factures',
            autre: '📁 Autres documents'
        };

        let html = '<div class="documents-wrapper">';

        if (documents.length === 0) {

            html += `<p class="empty-message">Aucun document disponible.</p>`;

        } else {

            for (const [type, docs] of Object.entries(groups)) {

                html += `
                    <div class="doc-group">

                        <h3 class="doc-group-title">${typeLabels[type] ?? type}</h3>

                        <div class="doc-list">
                            ${docs.map(doc => renderDocRow(doc)).join('')}
                        </div>

                    </div>
                `;
            }

        }

        html += '</div>';

        section.innerHTML = html;

        section.querySelectorAll('.btn-download').forEach(btn => {

            btn.addEventListener('click', () => downloadDoc(btn.dataset.id));

        });

    }

    function renderDocRow(doc) {

        const date = doc.dateUpload
            ? new Date(doc.dateUpload).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })
            : '';

        const rdvInfo = doc.appointmentDate
            ? `<span class="doc-rdv">RDV du ${new Date(doc.appointmentDate).toLocaleDateString('fr-FR')}</span>`
            : '';

        return `
            <div class="doc-row">

                <div class="doc-info">
                    <span class="doc-name">${escapeHtml(doc.displayName)}</span>
                    <span class="doc-meta">${date} ${rdvInfo}</span>
                </div>

                <div class="doc-actions">
                    <button class="btn btn-download" data-id="${doc.id}">
                        ⬇ Télécharger
                    </button>
                </div>

            </div>
        `;
    }

    function downloadDoc(id) {

        fetch(`http://localhost:8000/api/documents/${id}/download`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => {

            if (!res.ok) throw new Error('Téléchargement impossible');

            const disposition = res.headers.get('Content-Disposition');

            const filename = disposition
                ? disposition.split('filename=')[1]?.replace(/"/g, '')
                : `document_${id}`;

            return res.blob().then(blob => ({ blob, filename }));

        })
        .then(({ blob, filename }) => {

            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');

            a.href = url;
            a.download = filename;

            a.click();

            URL.revokeObjectURL(url);

        })
        .catch(err => alert(`Erreur : ${err.message}`));

    }

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, c => ({
            '&':'&amp;',
            '<':'&lt;',
            '>':'&gt;',
            '"':'&quot;',
            "'":'&#39;'
        }[c]));
    }

});