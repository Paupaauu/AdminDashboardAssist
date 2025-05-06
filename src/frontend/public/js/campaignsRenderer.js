const { ipcRenderer } = require('electron');

document.getElementById("btnOpenNewCampaign").addEventListener('click', () => {
    ipcRenderer.send('open-new-campaign-window');
});


// Mostrar campañas al cargar
window.onload = () => {
    ipcRenderer.send('get-campaigns');
};

// Escuchar campañas desde main
ipcRenderer.on('campaigns-data', (event, campaigns) => {
    let cadenaDOM = "";
    campaigns.forEach(c => {
        cadenaDOM += `
            <div style="margin-bottom: 1em;">
                <label><strong>${c.campaign_name}</strong></label><br>        
                <label><strong>${c.client}</strong></label><br>
                <label>${c.language}</label>
            </div>`;
    });
    document.getElementById("wrapper").innerHTML = cadenaDOM;
});

document.getElementById("btnNewCampaign").addEventListener('click', () => {
    let txtNewCampaign = document.getElementById("txtNewCampaign").value;
    let txtNewClient = document.getElementById("txtNewClient").value;
    let txtNewLanguage = document.getElementById("txtNewLanguage").value;

    if (txtNewCampaign === "" || txtNewClient === "" || txtNewLanguage === "") {
        alert("Debe escribir todos los campos");
    } else {
        ipcRenderer.send('add-campaign', {
            campaing_name: txtNewCampaign,
            client: txtNewClient,
            marketUnit: "Default",
            language: txtNewLanguage
        });
    }
});

// Recibir confirmación
ipcRenderer.on('add-campaign-success', () => {
    alert("Campaña añadida");
    ipcRenderer.send('get-campaigns'); // Recargar campañas
});

ipcRenderer.on('add-campaign-error', (event, errorMsg) => {
    alert("Error al añadir la campaña: " + errorMsg);
});
