console.log("✅ Script newCampaignRenderer.js cargado correctamente"); //Para comprobar si se esta cargando el script
const { ipcRenderer } = require('electron');

document.getElementById("btnNewCampaign").addEventListener('click', () => {
    const txtNewCampaign = document.getElementById("txtNewCampaign").value;
    const txtNewClient = document.getElementById("txtNewClient").value;
    const txtNewLanguage = document.getElementById("txtNewLanguage").value;

    if (txtNewCampaign === "" || txtNewClient === "" || txtNewLanguage === "") {
        alert("Debe escribir todos los campos");
    } else {
        ipcRenderer.send('add-campaign', {
            campaign_name: txtNewCampaign,
            client: txtNewClient,
            marketUnit: "Default",
            language: txtNewLanguage
        });
    }
});

ipcRenderer.on('add-campaign-success', () => {
    alert("Campaña añadida correctamente");
    ipcRenderer.send('close-new-campaign-window');
});

ipcRenderer.on('add-campaign-error', (event, errorMsg) => {
    alert("Error al añadir la campaña: " + errorMsg);
});
