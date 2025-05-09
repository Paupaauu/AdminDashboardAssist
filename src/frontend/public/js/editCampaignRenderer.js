const { ipcRenderer } = require('electron');

// Cargar los datos de la campaña en el formulario
ipcRenderer.on('load-campaign-data', (event, campaignData) => {
    document.getElementById("txtEditCampaign").value = campaignData.campaign_name;
    document.getElementById("txtEditClient").value = campaignData.client;
    document.getElementById("txtEditMarketUnit").value = campaignData.marketUnit;
    document.getElementById("txtEditLanguage").value = campaignData.language;
});

// Guardar los cambios realizados
document.getElementById("btnSaveCampaign").addEventListener('click', () => {
    const updatedCampaign = {
        campaign_name: document.getElementById("txtEditCampaign").value,
        client: document.getElementById("txtEditClient").value,
        marketUnit: document.getElementById("txtEditMarketUnit").value,
        language: document.getElementById("txtEditLanguage").value
    };

    // Validar que los campos no estén vacíos
    if (!updatedCampaign.campaign_name || !updatedCampaign.client || !updatedCampaign.marketUnit || !updatedCampaign.language) {
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