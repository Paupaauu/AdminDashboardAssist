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

// Listener para abrir el cuadro de diálogo de selección de imagen
document.getElementById("btnSelectImage").addEventListener('click', async () => {
    const imagePath = await ipcRenderer.invoke('select-image');
    if (imagePath) {
        document.getElementById("txtNewImage").value = imagePath; // Establece la ruta en el campo de texto
    }
});


ipcRenderer.on('add-client-success', () => {
    alert("Cliente creado correctamente");
    ipcRenderer.send('close-new-client-window');
});

ipcRenderer.on('add-client-error', (event, errorMsg) => {
    alert("Error al añadir el cliente: " + errorMsg);
});