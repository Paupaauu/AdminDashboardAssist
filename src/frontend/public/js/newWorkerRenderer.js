const { ipcRenderer } = require('electron');
// Cargar la lista de sitios al abrir el formulario
window.onload = async () => {
    try {
        const sites = await ipcRenderer.invoke('get-sites-list'); // Invocar el manejador 'get-sites-list'
        const siteSelect = document.getElementById("selectNewSite");

        console.log('Sitios cargados:', sites); // Depuración

        // Verifica que el elemento select exista
        if (!siteSelect) {
            console.error("El elemento select con id 'selectNewSite' no se encontró en el DOM.");
            return;
        }

        // Añadir las opciones al desplegable
        sites.forEach(site => {
            // Verifica que el sitio tenga un nombre antes de agregarlo al desplegable
            if (site.site_name) {
                const option = document.createElement('option');
                option.value = site.site_name; // Valor del sitio
                option.textContent = site.site_name; // Texto visible en el desplegable
                siteSelect.appendChild(option); // Añadir opción al desplegable
            } else {
                console.warn(`Un sitio no tiene el campo 'site_name', se omitirá. Sitio: ${JSON.stringify(site)}`);
            }
        });
    } catch (error) {
        console.error('Error al cargar la lista de sitios:', error);
        alert('Error al cargar la lista de sitios. Consulte la consola para más detalles.');
    }
};

// Crear nuevo trabajador
document.getElementById("btnNewWorker").addEventListener('click', () => {
    const workerData = {
        agent_id: document.getElementById("txtNewAgentId").value.trim(),
        agent_name: document.getElementById("txtNewName").value.trim(),
        agent_surname1: document.getElementById("txtNewSurname1").value.trim(),
        agent_surname2: document.getElementById("txtNewSurname2").value.trim(),
        site: document.getElementById("selectNewSite").value, // Obtenemos el valor seleccionado
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