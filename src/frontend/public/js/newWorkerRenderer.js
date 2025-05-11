const { ipcRenderer } = require('electron');

// Crear nuevo trabajador
document.getElementById("btnNewWorker").addEventListener('click', () => {
    const workerData = {
        agent_id: document.getElementById("txtNewAgentId").value.trim(),
        agent_name: document.getElementById("txtNewName").value.trim(),
        agent_surname1: document.getElementById("txtNewSurname1").value.trim(),
        agent_surname2: document.getElementById("txtNewSurname2").value.trim(),
        site: document.getElementById("txtNewSite").value.trim(),
        activity: document.getElementById("txtNewActivity").value.trim(),
        campaign: document.getElementById("txtNewCampaign").value.trim(),
        hours_worked: parseFloat(document.getElementById("txtNewHoursWorked").value.trim()),
    };

    if (!workerData.agent_id || !workerData.agent_name || !workerData.agent_surname1 || !workerData.site || !workerData.activity|| !workerData.campaign || isNaN(workerData.hours_worked)) {
        alert("Debe completar todos los campos obligatorios.");
        return;
    }

    ipcRenderer.send('add-worker', workerData);
});

ipcRenderer.on('add-worker-success', () => {
    alert("Trabajador añadido correctamente");
    ipcRenderer.send('close-new-worker-window');
});

ipcRenderer.on('add-worker-error', (event, errorMsg) => {
    alert("Error al añadir el trabajador: " + errorMsg);
});