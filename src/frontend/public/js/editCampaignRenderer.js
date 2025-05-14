const { ipcRenderer } = require('electron');

// Cargar los datos de la campaña y la lista de clientes en el formulario
ipcRenderer.on('load-campaign-data', (event, { campaignData, clients }) => {
    document.getElementById("txtEditCampaign").value = campaignData.campaign_name;
    document.getElementById("txtEditMarketUnit").value = campaignData.marketUnit;
    document.getElementById("txtEditLanguage").value = campaignData.language;
    document.getElementById("txtNewProductive_hours_revenue").value = campaignData.productive_hours_revenue;
    // Cargar clientes en el desplegable
    const clientSelect = document.getElementById("selectEditClient");
    clientSelect.innerHTML = '<option value="">Seleccione un cliente</option>'; // Opción por defecto
    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.client_name;
        option.textContent = client.client_name;
        if (campaignData.client === client.client_name) {
            option.selected = true; // Selecciona el cliente actual de la campaña
        }
        clientSelect.appendChild(option);
    });
});

// Guardar los cambios realizados
document.getElementById("btnSaveCampaign").addEventListener('click', () => {
    const updatedCampaign = {
        campaign_name: document.getElementById("txtEditCampaign").value,
        client: document.getElementById("selectEditClient").value, // Usamos el valor del select
        marketUnit: document.getElementById("txtEditMarketUnit").value,
        language: document.getElementById("txtEditLanguage").value,
        productive_hours_revenue: document.getElementById("txtNewProductive_hours_revenue").value
    };

    // Validar que los campos no estén vacíos
    if (!updatedCampaign.campaign_name || !updatedCampaign.client || !updatedCampaign.marketUnit || !updatedCampaign.language || !updatedCampaign.productive_hours_revenue) {
        alert("Debe completar todos los campos");
        return;
    }

    ipcRenderer.send('update-campaign', updatedCampaign);

});

ipcRenderer.on('update-campaign-success', () => {
    alert("Campaña actualizada correctamente");
    ipcRenderer.send('close-edit-campaign-window');
});

ipcRenderer.on('update-campaign-error', (event, errorMsg) => {
    alert("Error al actualizar la campaña: " + errorMsg);
});