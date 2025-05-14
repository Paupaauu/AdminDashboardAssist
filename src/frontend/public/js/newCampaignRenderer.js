const { ipcRenderer } = require('electron');

// Cargar lista de clientes en el desplegable al cargar la ventana
window.onload = async () => {
    const clientSelect = document.getElementById("selectNewClient");
    try {
        const clients = await ipcRenderer.invoke('get-clients-list');
        clientSelect.innerHTML = '<option value="">Seleccione un cliente</option>'; // Opción por defecto
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.client_name;
            option.textContent = client.client_name;
            clientSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar la lista de clientes:', error);
        alert('Error al cargar la lista de clientes. Consulte la consola para más detalles.');
    }
};

// Añadimos un listener al botón “Crear” que recoge los valores 
document.getElementById("btnNewCampaign").addEventListener('click', () => {
    let txtNewCampaign = document.getElementById("txtNewCampaign").value;
    let selectNewClient = document.getElementById("selectNewClient").value; // Corregir aquí para usar el select
    let txtNewMarketUnit = document.getElementById("txtNewMarketUnit").value;
    let txtNewLanguage = document.getElementById("txtNewLanguage").value;
    let txtNewProductive_hours_revenue = document.getElementById("txtNewProductive_hours_revenue").value;

    // Validamos que los campos no estén vacíos
    if (txtNewCampaign === "" || selectNewClient === "" || txtNewMarketUnit === "" || txtNewLanguage === "") {
        alert("Debe completar todos los campos");
    } else {
        // Si no están vacíos, enviamos los datos al main.js mediante el método send de ipcRenderer
        ipcRenderer.send('add-campaign', {
            campaign_name: txtNewCampaign,
            client: selectNewClient, // Usar el valor del select
            marketUnit: txtNewMarketUnit,
            language: txtNewLanguage,
            productive_hours_revenue: txtNewProductive_hours_revenue
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