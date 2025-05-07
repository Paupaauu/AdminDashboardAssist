const { ipcRenderer } = require('electron');

// Añadimos un listener al botón “Crear” que recoge los valores 
document.getElementById("btnNewCampaign").addEventListener('click', () => {
    let txtNewCampaign = document.getElementById("txtNewCampaign").value;
    let txtNewClient = document.getElementById("txtNewClient").value;
    let txtNewMarketUnit = document.getElementById("txtNewMarketUnit").value;
    let txtNewLanguage = document.getElementById("txtNewLanguage").value;
//Validamos que los campos no estén vacíos
    if (txtNewCampaign === "" || txtNewClient === "" || txtNewMarketUnit === "" || txtNewLanguage === "") {
        alert("Debe completar todos los campos");
    } else { //Si no están vacíos, enviamos los datos al main.js mendiante el método send de ipcRenderer.send
        ipcRenderer.send('add-campaign', {
            campaign_name: txtNewCampaign,
            client: txtNewClient,
            marketUnit: txtNewMarketUnit,
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