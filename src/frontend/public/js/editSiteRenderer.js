const { ipcRenderer } = require('electron');

// Cargar datos del sitio en el formulario
ipcRenderer.on('load-site-data', (event, siteData) => {
    document.getElementById("txtEditSiteName").value = siteData.site_name || '';
    document.getElementById("txtEditCountry").value = siteData.country || '';
    document.getElementById("txtEditAddress").value = siteData.address || '';
    
    // Convertir las fechas al formato YYYY-MM-DD si existen
    document.getElementById("txtEditOpenedDate").value = siteData.opened_date 
        ? new Date(siteData.opened_date).toISOString().split('T')[0] 
        : '';
    
    document.getElementById("txtEditClosedDate").value = siteData.closed_date 
        ? new Date(siteData.closed_date).toISOString().split('T')[0] 
        : '';
    
    // Asignar el coste por hora, manejando valores nulos/indefinidos
    document.getElementById("txtEditCostPerHour").value = siteData.cost_per_hour || '';
});

// Guardar cambios en el sitio
document.getElementById("btnSaveSite").addEventListener('click', () => {
    const updatedSite = {
        site_name: document.getElementById("txtEditSiteName").value.trim(),
        country: document.getElementById("txtEditCountry").value.trim(),
        address: document.getElementById("txtEditAddress").value.trim(),
        opened_date: document.getElementById("txtEditOpenedDate").value.trim(),
        closed_date: document.getElementById("txtEditClosedDate").value.trim(),
        cost_per_hour: document.getElementById("txtEditCostPerHour").value.trim(),
    };

    // Validar campos obligatorios
    if (!updatedSite.site_name || !updatedSite.country || !updatedSite.address || !updatedSite.opened_date || !updatedSite.cost_per_hour) {
        alert("Debe completar todos los campos obligatorios.");
        return;
    }

    ipcRenderer.send('update-site', updatedSite);
});

ipcRenderer.on('update-site-success', () => {
    alert("Sitio actualizado correctamente");
    ipcRenderer.send('close-edit-site-window');
});

ipcRenderer.on('update-site-error', (event, errorMsg) => {
    alert("Error al actualizar el sitio: " + errorMsg);
});