const { ipcRenderer } = require('electron');

// Cargar datos del trabajador en el formulario
ipcRenderer.on('load-worker-data', (event, workerData) => {
    document.getElementById("txtEditAgentId").value = workerData.agent_id || '';
    document.getElementById("txtEditName").value = workerData.agent_name || '';
    document.getElementById("txtEditSurname1").value = workerData.agent_surname1 || '';
    document.getElementById("txtEditSurname2").value = workerData.agent_surname2 || '';
    document.getElementById("txtEditSite").value = workerData.site || '';
    document.getElementById("txtEditActivity").value = workerData.activity || '';
    document.getElementById("txtEditCampaign").value = workerData.campaign || '';
    document.getElementById("txtEditHoursWorked").value = workerData.hours_worked || '';
});

// Guardar cambios en el trabajador
document.getElementById("btnSaveWorker").addEventListener('click', () => {
    const updatedWorker = {
        agent_id: document.getElementById("txtEditAgentId").value.trim(),
        agent_name: document.getElementById("txtEditName").value.trim(),
        agent_surname1: document.getElementById("txtEditSurname1").value.trim(),
        agent_surname2: document.getElementById("txtEditSurname2").value.trim(),
        site: document.getElementById("txtEditSite").value.trim(),
        activity: document.getElementById("txtEditActivity").value.trim(),
        campaign: document.getElementById("txtEditCampaign").value.trim(),
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