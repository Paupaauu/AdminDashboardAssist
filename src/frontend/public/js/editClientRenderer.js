const { ipcRenderer } = require('electron');

// Cargar los datos de la campaña en el formulario
ipcRenderer.on('load-client-data', (event, clientData) => {
    document.getElementById("txtEditClient").value = clientData.client_name;
    document.getElementById("txtEditEmail").value = clientData.email_manager_in_charge;
    document.getElementById("txtEditDescription").value = clientData.description;
    document.getElementById("txtEditImage").value = clientData.image;

});

// Guardar los cambios realizados
document.getElementById("btnSaveClient").addEventListener('click', () => {
    const updatedClient = {
        client_name: document.getElementById("txtEditClient").value,
        email_manager_in_charge: document.getElementById("txtEditEmail").value,
        description: document.getElementById("txtEditDescription").value,
        image: document.getElementById("txtEditImage").value
    };

    // Validar que los campos no estén vacíos
    if (!updatedClient.client_name || !updatedClient.email_manager_in_charge) {
        alert("Debe completar los campos de nombre y email");
        return;
    }

    ipcRenderer.send('update-client', updatedClient);

});

ipcRenderer.on('update-client-success', () => {
    alert("Cliente actualizado correctamente");
    ipcRenderer.send('close-edit-client-window');
});

ipcRenderer.on('update-client-error', (event, errorMsg) => {
    alert("Error al actualizar cliente: " + errorMsg);
});