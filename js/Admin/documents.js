document.addEventListener('DOMContentLoaded', async function () {

    const token = localStorage.getItem('jwt');
    if (!token) return;

    console.log(JSON.parse(atob(localStorage.getItem('jwt').split('.')[1])));

    const section = document.getElementById('documentsSection');
    if (!section) return;

    const patientId = section.dataset.patientId;
    if (!patientId) return;

    let userRoles = [];
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userRoles = payload.roles || [];
    } catch (e) {}

    const isAdmin = userRoles.includes('ROLE_ADMIN');

    await loadDocuments();

    async function loadDocuments() {
        try {
            const res = await fetch(`http://localhost:8000/api/documents/patient/${patientId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const documents = await res.json();
            renderDocuments(documents);
        } catch (err) {
            console.error('Erreur chargement documents:', err);
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
            radio:        '🩻 Radios & imagerie',
            facture:      '🧾 Factures',
            autre:        '📁 Autres documents',
        };

        let html = '<div class="documents-wrapper">';

        html += `
            <div class="upload-zone">
                <h3>Ajouter un document</h3>
                <div class="upload-form">
                    <input type="file" id="docFile" accept=".pdf,.jpg,.jpeg,.png">
                    <select id="docType">
                        <option value="prescription">Ordonnance</option>
                        <option value="radio">Radio / Imagerie</option>
                        <option value="facture">Facture</option>
                        <option value="autre">Autre</option>
                    </select>
                    <input type="text" id="docAppointmentId" placeholder="ID du RDV (optionnel)">
                    <button class="btn btn-upload" id="uploadBtn">⬆ Uploader</button>
                </div>
                <p class="upload-hint">PDF, JPG ou PNG · 10 Mo max</p>
                <p id="uploadFeedback" class="upload-feedback"></p>
            </div>`;

        if (documents.length === 0) {
            html += '<p class="empty-message">Aucun document dans le dossier.</p>';
        } else {
            for (const [type, docs] of Object.entries(groups)) {
                html += `
                    <div class="doc-group">
                        <h3 class="doc-group-title">${typeLabels[type] ?? type}</h3>
                        <div class="doc-list">
                            ${docs.map(doc => renderDocRow(doc, isAdmin)).join('')}
                        </div>
                    </div>`;
            }
        }

        html += '</div>';
        section.innerHTML = html;

        document.getElementById('uploadBtn').addEventListener('click', handleUpload);

        section.querySelectorAll('.btn-download').forEach(btn => {
            btn.addEventListener('click', () => downloadDoc(btn.dataset.id));
        });

        if (isAdmin) {
            section.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', () => deleteDoc(btn.dataset.id));
            });
        }
    }

    function renderDocRow(doc, isAdmin) {
        const date = doc.dateUpload
            ? new Date(doc.dateUpload).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
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
                    <button class="btn btn-download" data-id="${doc.id}" title="Télécharger">⬇ Télécharger</button>
                    ${isAdmin ? `<button class="btn btn-delete" data-id="${doc.id}" title="Supprimer">✕</button>` : ''}
                </div>
            </div>`;
    }

    async function handleUpload() {
        const fileInput    = document.getElementById('docFile');
        const typeSelect   = document.getElementById('docType');
        const appointmentInput = document.getElementById('docAppointmentId');
        const feedback     = document.getElementById('uploadFeedback');

        if (!fileInput.files[0]) {
            feedback.textContent = 'Veuillez sélectionner un fichier.';
            feedback.className = 'upload-feedback error';
            return;
        }

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('patientId', patientId);
        formData.append('type', typeSelect.value);
        if (appointmentInput.value) {
            formData.append('appointmentId', appointmentInput.value);
        }

        try {
            document.getElementById('uploadBtn').disabled = true;
            feedback.textContent = 'Upload en cours...';
            feedback.className = 'upload-feedback';

            const res = await fetch('http://localhost:8000/api/documents/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erreur lors de l\'upload');
            }

            feedback.textContent = '✓ Document ajouté avec succès.';
            feedback.className = 'upload-feedback success';
            fileInput.value = '';
            await loadDocuments();

        } catch (err) {
            feedback.textContent = `Erreur : ${err.message}`;
            feedback.className = 'upload-feedback error';
        } finally {
            document.getElementById('uploadBtn').disabled = false;
        }
    }

    function downloadDoc(id) {
        const link = document.createElement('a');
        link.href = `http://localhost:8000/api/documents/${id}/download`;
        link.setAttribute('download', '');

        fetch(`http://localhost:8000/api/documents/${id}/download`, {
            headers: { 'Authorization': `Bearer ${token}` }
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


    async function deleteDoc(id) {
        if (!confirm('Supprimer ce document définitivement ?')) return;

        try {
            const res = await fetch(`http://localhost:8000/api/documents/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status !== 204) throw new Error('Erreur lors de la suppression');
            await loadDocuments();

        } catch (err) {
            alert(`Erreur : ${err.message}`);
        }
    }


    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }
});