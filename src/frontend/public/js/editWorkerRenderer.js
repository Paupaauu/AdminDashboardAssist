const { ipcRenderer } = require('electron');

// Cargar datos del trabajador en el formulario
ipcRenderer.on('load-worker-data', (event, data) => {
    const { workerData, sites, campaigns } = data;

    if (workerData) {
        document.getElementById("txtEditAgentId").value = workerData.agent_id || '';
        document.getElementById("txtEditName").value = workerData.agent_name || '';
        document.getElementById("txtEditSurname1").value = workerData.agent_surname1 || '';
        document.getElementById("txtEditSurname2").value = workerData.agent_surname2 || '';
        document.getElementById("txtEditActivity").value = workerData.activity || '';
        document.getElementById("txtEditHoursWorked").value = workerData.hours_worked || '';
    }

    // Cargar sitios en el desplegable
    if (sites) {
        const siteSelect = document.getElementById("selectEditSite");
        siteSelect.innerHTML = '<option value="">Seleccione un sitio</option>';
        sites.forEach(site => {
            const option = document.createElement('option');
            option.value = site.site_name;
            option.textContent = site.site_name;
            if (workerData.site === site.site_name) {
                option.selected = true;
            }
            siteSelect.appendChild(option);
        });
    }

    // Cargar campañas en el desplegable
    if (campaigns) {
        const campaignSelect = document.getElementById("selectEditCampaign");
        campaignSelect.innerHTML = '<option value="">Seleccione una campaña</option>';
        campaigns.forEach(campaign => {
            const option = document.createElement('option');
            option.value = campaign.campaign_name;
            option.textContent = campaign.campaign_name;
            if (workerData.campaign === campaign.campaign_name) {
                option.selected = true;
            }
            campaignSelect.appendChild(option);
        });
    }
});


// Guardar cambios en el trabajador
document.getElementById("btnSaveWorker").addEventListener('click', () => {
    const updatedWorker = {
        agent_id: document.getElementById("txtEditAgentId").value.trim(),
        agent_name: document.getElementById("txtEditName").value.trim(),
        agent_surname1: document.getElementById("txtEditSurname1").value.trim(),
        agent_surname2: document.getElementById("txtEditSurname2").value.trim(),
        site: document.getElementById("selectEditSite").value.trim(),
        activity: document.getElementById("txtEditActivity").value.trim(),
        campaign: document.getElementById("selectEditCampaign").value.trim(),
        hours_worked: parseFloat(document.getElementById("txtEditHoursWorked").value.trim()),
    };

    if (!updatedWorker.agent_id || !updatedWorker.agent_name || !updatedWorker.agent_surname1 || !updatedWorker.site || !updatedWorker.activity || !updatedWorker.campaign || isNaN(updatedWorker.hours_worked)) {
        alert("Debe completar todos los campos obligatorios.");
        return;
    }

    ipcRenderer.send('update-worker', updatedWorker);
});

ipcRenderer.on('update-worker-success', () => {
    alert("Trabajador actualizado correctamente");
    ipcRenderer.send('close-edit-worker-window');
});

ipcRenderer.on('update-worker-error', (event, errorMsg) => {
    alert("Error al actualizar el trabajador: " + errorMsg);
});