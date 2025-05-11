const { ipcRenderer } = require('electron');

// Añadimos un listener al botón “Crear” que recoge los valores 
document.getElementById("btnNewClient").addEventListener('click', () => {
    let txtNewClient = document.getElementById("txtNewClient").value;
    let txtNewEmail = document.getElementById("txtNewEmail").value;
    let txtDescription = document.getElementById("txtNewDescription").value;
    let txtNewImage = document.getElementById("txtNewImage").value;
//Validamos que los campos no estén vacíos
    if (txtNewClient === "" || txtNewEmail === "" ) {
        alert("Debe completar los campos de nombre y email");
    } else { //Si no están vacíos, enviamos los datos al main.js mendiante el método send de ipcRenderer.send
        ipcRenderer.send('add-client', {
            client_name: txtNewClient,
            email_manager_in_charge: txtNewEmail,
            description: txtDescription,
            image: txtNewImage
        });
    }
});

ipcRenderer.on('add-client-success', () => {
    alert("Cliente creado correctamente");
    ipcRenderer.send('close-new-client-window');
});

ipcRenderer.on('add-client-error', (event, errorMsg) => {
    alert("Error al añadir el cliente: " + errorMsg);
});