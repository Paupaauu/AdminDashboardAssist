const { ipcRenderer } = require('electron');

// Crear nuevo sitio
document.getElementById("btnNewSite").addEventListener('click', () => {
    const siteData = {
        site_name: document.getElementById("txtNewSiteName").value,
        country: document.getElementById("txtNewCountry").value,
        address: document.getElementById("txtNewAddress").value,
        opened_date: document.getElementById("txtNewOpenedDate").value,
        closed_date: document.getElementById("txtNewClosedDate").value,
        cost_per_hour: document.getElementById("txtNewCostPerHour").value,
    };

    // Validar campos obligatorios
    if (!siteData.site_name || !siteData.country || !siteData.address || !siteData.opened_date || !siteData.cost_per_hour) {
        alert("Debe completar todos los campos obligatorios.");
        return;
    }

    ipcRenderer.send('add-site', siteData);
});

ipcRenderer.on('add-site-success', () => {
    alert("Sitio añadido correctamente");
    ipcRenderer.send('close-new-site-window');
});

ipcRenderer.on('add-site-error', (event, errorMsg) => {
    alert("Error al añadir el sitio: " + errorMsg);
});