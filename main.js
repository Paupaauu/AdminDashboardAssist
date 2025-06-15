const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const connectDB = require("./src/backend/config/db");
const path = require("path");
const fs = require("fs");
const Campaign = require("./src/backend/models/campaigns"); // Importamos el modelo campaigns
const Client = require('./src/backend/models/clients'); // Importamos el modelo clients
const Site = require('./src/backend/models/sites'); // Importar el modelo sites
const Worker = require('./src/backend/models/workers'); // Importar el modelo workers
const bcrypt = require('bcryptjs');
const User = require('./src/backend/models/users');
let loggedInUser = null; // variable global para la sesión
let mainWindow; // Variable global para la ventana principal
let newCampaignWindow = null; // Variable global para la ventana de crear nueva campaña
let newClientWindow = null; // Variable global para la ventana de crear nueva campaña
let newSiteWindow = null; // Variable global para la ventana de crear nuevo sitio
let newWorkerWindow = null; // Variable global para la ventana de crear nuevo trabajador
// Función que crea la ventana principal
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1700,
        height: 1200,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false //Permite que window y otros objetos del contexto de Electron puedan interactuar directamente con Node.js en el renderer
        },
    });

    //quita menú por defecto de chromium
    mainWindow.setMenu(null);
    // Carga el archivo HTML en la ventana
    mainWindow.loadFile("./src/frontend/views/login.html");
    mainWindow.webContents.openDevTools(); //Abre automaticamente herramientas de depuración
}

//Codigo para lanzar la pagina principal y para cerrar app cuando se cierre la ventana
app.whenReady().then(() => {
    createWindow();
    connectDB(); // Conectar¡mos a MongoDB cuando la app esté lista

    //Este código cierra completamente la aplicación cuando todas las ventanas han sido cerradas, excepto en macOS (porque sigue otro proceso)
    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") app.quit();
    });

    /*
      process.platform es una propiedad de Node.js que devuelve el sistema operativo en el que se ejecuta la aplicación.
      "win32" → Windows
      "linux" → Linux
      "darwin" → macOS
      si es darwin no llamamos a app.quit() para seguir la convencion de mac y dejar la aplicacion en segundo plano 
      */

    // En el caso de Mac, si la aplicación se queda en segundo plano y se reactiva este evento que se dispara
    app.on("activate", () => {
        // Si no hay ventanas abiertas, creamos una nueva
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

//Codigo para que funcione el paquete electron-reload (solo cuando esté en desarrollo, no cuando esté en producción)
//if para saber si estamos en entorno distinto al de producción (desarrollo)
if (process.env.NODE_ENV !== 'production') {
    require('electron-reload')(__dirname, {

    })
}

//------------------CARGA APP CUANDO LOGIN ES CORRECTO------------------//
ipcMain.handle('do-login', async (event, { username, password }) => {
  const user = await User.findOne({ username });
  if (user && bcrypt.compareSync(password, user.password)) {
    loggedInUser = username;
    mainWindow.loadFile("./src/frontend/views/index.html"); // dashboard principal
    return true;
  }
  return false;
});



//-------------------CAMPAÑAS--------------------//
/*----Lógica para Crear Campaña--------------------------------------------------------------------*/
ipcMain.on('open-new-campaign-window', () => {
    if (newCampaignWindow) {
        newCampaignWindow.focus();
        return;
    }

    // Creamos la ventana de nueva campaña
    newCampaignWindow = new BrowserWindow({
        width: 575,
        height: 700,
        parent: mainWindow,
        modal: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    newCampaignWindow.setMenu(null);
    newCampaignWindow.loadFile('./src/frontend/views/newCampaign.html');
    newCampaignWindow.webContents.openDevTools();

    newCampaignWindow.on('closed', () => {
        newCampaignWindow = null;
    });
});


ipcMain.on('close-new-campaign-window', () => {
    if (newCampaignWindow) {
        newCampaignWindow.close();
        newCampaignWindow = null;
    }

    // Actualiza la vista de campañas
    mainWindow.webContents.send('refresh-campaigns');
});

//Recibimos los datos de la nueva campaña desde el renderer.js y los guardamos en la base de datos y enviamos un mensaje de éxito o error al renderer.js
ipcMain.on('add-campaign', async (event, campaignData) => {
    try {
        const newCampaign = new Campaign(campaignData);
        await newCampaign.save();
        event.sender.send('add-campaign-success');
        mainWindow.webContents.send('refresh-campaign'); // Actualiza la vista de campañas    
    } catch (error) {
        console.error('Error al guardar campaña:', error);
        event.sender.send('add-campaign-error', error.message);
    }
});

//-------Lógica para mostrar Campaña--------------------------------------------------------------------------------------------------
ipcMain.handle('get-campaigns', async () => {
    try {
        const campaigns = await Campaign.find().lean(); // Obtenemos todas las campañas de la base de datos
        return campaigns; // Devolvemos las campañas al renderer.js
    } catch (error) {
        console.error('Error al obtener campañas:', error);
        throw error;
    }
});

//-------Lógica para eliminar Campaña--------------------------------------------------------------------------------------------------
ipcMain.handle('delete-campaign', async (event, campaignName) => {
    try {
        console.log('Nombre de la campaña a eliminar:', campaignName); // Depuración
        const result = await Campaign.findOneAndDelete({ campaign_name: campaignName }); // Eliminar la campaña por nombre
        if (result) {
            console.log(`Campaña eliminada con éxito: ${campaignName}`);
        } else {
            console.log(`No se encontró ninguna campaña con el nombre: ${campaignName}`);
            throw new Error('No se encontró ninguna campaña con ese nombre.');
        }
    } catch (error) {
        console.error('Error al eliminar la campaña:', error);
        throw error; // Lanzar error para que el renderer lo maneje
    }
});

//-------Lógica para editar Campaña--------------------------------------------------------------------------------------------------

let editCampaignWindow = null; // Ventana de edición

// Abrimos ventana de edición
ipcMain.on('open-edit-campaign-window', async (event, campaignName) => {
    if (editCampaignWindow) {
        editCampaignWindow.focus();
        return;
    }

    // Obtener los datos de la campaña
    const campaignData = await Campaign.findOne({ campaign_name: campaignName }).lean();

    if (!campaignData) {
        event.sender.send('edit-campaign-error', 'No se encontró la campaña.');
        return;
    }

     // Obtener la lista de clientes
     const clients = await Client.find({}, { client_name: 1, _id: 0 }).lean();

    editCampaignWindow = new BrowserWindow({
        width: 575,
        height: 700,
        parent: mainWindow,
        modal: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    editCampaignWindow.setMenu(null);
    editCampaignWindow.loadFile('./src/frontend/views/editCampaign.html');

    editCampaignWindow.on('closed', () => {
        editCampaignWindow = null;
    });

    // Enviar los datos al renderizador después de que la ventana cargue
    editCampaignWindow.webContents.on('did-finish-load', () => {
        editCampaignWindow.webContents.send('load-campaign-data', { campaignData, clients });
    });
});

// Actualizar campaña en la base de datos
ipcMain.on('update-campaign', async (event, updatedCampaign) => {
    try {
        const result = await Campaign.findOneAndUpdate(
            { campaign_name: updatedCampaign.campaign_name }, // Filtro por nombre único
            updatedCampaign, // Datos actualizados
            { new: true } // Retornar el documento actualizado
        );

        if (result) {
            event.sender.send('update-campaign-success');
        } else {
            throw new Error('No se encontró la campaña para actualizar.');
        }
    } catch (error) {
        console.error('Error al actualizar la campaña:', error);
        event.sender.send('update-campaign-error', error.message);
    }
});

ipcMain.on('close-edit-campaign-window', () => {
    if (editCampaignWindow) {
        editCampaignWindow.close();
        editCampaignWindow = null;
    }

    // Actualiza la vista de campañas
    mainWindow.webContents.send('refresh-campaigns');

});

//-------------------CLIENTES--------------------//
/*----Lógica para Crear Clientes--------------------------------------------------------------------*/
ipcMain.on('open-new-client-window', () => {
    if (newClientWindow) {
        newClientWindow.focus();
        return;
    }

    // Creamos la ventana de nuevo cliente
    newClientWindow = new BrowserWindow({
        width: 575,
        height: 700,
        parent: mainWindow,
        modal: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    newClientWindow.setMenu(null);
    newClientWindow.loadFile('./src/frontend/views/newClient.html');
    newClientWindow.webContents.openDevTools();

    newClientWindow.on('closed', () => {
        newClientWindow = null;
    });
});

ipcMain.on('close-new-client-window', () => {
    if (newClientWindow) {
        newClientWindow.close();
        newClientWindow = null;
    }

    // Actualiza la vista de clientes
    mainWindow.webContents.send('refresh-clients');
});
/*----Cuadr de dialogo para seleccionar imagen--------------------------------------------------------------------*/
ipcMain.handle('select-image', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] }
        ]
    });
    if (canceled) {
        return null; // El usuario canceló la selección
    } else {
        return filePaths[0]; // Retorna la ruta del archivo seleccionado
    }
});

//Recibimos los datos de nuevo cliente desde el renderer.js y los guardamos en la base de datos y enviamos un mensaje de éxito o error al renderer.js
ipcMain.on('add-client', async (event, clientData) => {
    try {
        let imagePath = clientData.image;

        // Copiar la imagen seleccionada a la carpeta de destino
        if (imagePath) {
            const fileName = path.basename(imagePath);
            const destPath = path.join(__dirname, 'src', 'frontend', 'public', 'img', fileName);
            fs.copyFileSync(imagePath, destPath);
            clientData.image = `img/${fileName}`; // Actualiza la ruta de la imagen en los datos del cliente
        }

        const newClient = new Client(clientData);
        await newClient.save(); // Guarda el cliente en la base de datos
        event.sender.send('add-client-success');
        mainWindow.webContents.send('refresh-clients'); // Actualiza la vista de clientes    
    } catch (error) {
        console.error('Error al guardar cliente:', error);
        event.sender.send('add-client-error', error.message);
    }
});

//-------Lógica para mostrar Clientes--------------------------------------------------------------------------------------------------
ipcMain.handle('get-clients', async () => {
    try {
        const clients = await Client.find().lean(); // Usa el modelo Client para obtener los datos
        return clients; // Devuelve los clientes al renderer.js
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        throw error;
    }
});

//-------Lógica para eliminar Clientes--------------------------------------------------------------------------------------------------
ipcMain.handle('delete-client', async (event, clientName) => {
    try {
        console.log('Nombre del cliente a eliminar:', clientName); // Depuración
        const result = await Client.findOneAndDelete({ client_name: clientName }); // Usa el modelo Client
        if (result) {
            console.log(`Cliente eliminado con éxito: ${clientName}`);
            mainWindow.webContents.send('refresh-clients'); // Emitimos evento para actualizar la tabla de clientes
        } else {
            console.log(`No se encontró ningún cliente con el nombre: ${clientName}`);
            throw new Error('No se encontró ningún cliente con ese nombre.');
        }
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        throw error;
    }
});

//-------Lógica para editar Cliente--------------------------------------------------------------------------------------------------

let editClientWindow = null; // Ventana de edición

// Abrimos ventana de edición
ipcMain.on('open-edit-client-window', async (event, clientName) => {
    if (editClientWindow) {
        editClientWindow.focus();
        return;
    }

    // Obtener los datos del cliente
    const clientData = await Client.findOne({ client_name: clientName }).lean();

    if (!clientData) {
        event.sender.send('edit-client-error', 'No se encontró el cliente.');
        return;
    }

    editClientWindow = new BrowserWindow({
        width: 575,
        height: 700,
        parent: mainWindow,
        modal: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    editClientWindow.setMenu(null);
    editClientWindow.loadFile('./src/frontend/views/editClient.html');
    //editClientWindow.webContents.openDevTools();

    editClientWindow.on('closed', () => {
        editClientWindow = null;
    });

    editClientWindow.webContents.on('did-finish-load', () => {
        editClientWindow.webContents.send('load-client-data', clientData);
    });
});

// Actualizar clientes en la base de datos
ipcMain.on('update-client', async (event, updatedClient) => {
    try {
        let imagePath = updatedClient.image;

        // Sobrescribir la imagen si se selecciona una nueva
        if (imagePath && fs.existsSync(imagePath)) {
            const fileName = `${updatedClient.client_name}${path.extname(imagePath)}`;
            const destPath = path.join(__dirname, 'src', 'frontend', 'public', 'img', fileName);

            // Copiar la nueva imagen a la carpeta "public/img"
            fs.copyFileSync(imagePath, destPath);

            // Actualizar la ruta de la imagen
            updatedClient.image = `img/${fileName}`;
        }

        const result = await Client.findOneAndUpdate(
            { client_name: updatedClient.client_name }, // Filtro por nombre único
            updatedClient, // Datos actualizados
            { new: true } // Retornar el documento actualizado
        );

        if (result) {
            event.sender.send('update-client-success');
            mainWindow.webContents.send('refresh-clients'); // Actualiza la vista de clientes
        } else {
            throw new Error('No se pudo actualizar el cliente.');
        }
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        event.sender.send('update-client-error', error.message);
    }
});

//Cerrar ventana de edición y actualizar vista de clientes
ipcMain.on('close-edit-client-window', () => {
    if (editClientWindow) {
        editClientWindow.close();
        editClientWindow = null;
    }

    // Actualiza la vista de clientes
    mainWindow.webContents.send('refresh-clients');
});

//-------------------SITES--------------------//
/*----Lógica para Crear Site--------------------------------------------------------------------*/
ipcMain.on('open-new-site-window', () => {
    if (newSiteWindow) {
        newSiteWindow.focus();
        return;
    }

    // Creamos la ventana de nuevo site
    newSiteWindow = new BrowserWindow({
        width: 575,
        height: 700,
        parent: mainWindow,
        modal: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    newSiteWindow.setMenu(null);
    newSiteWindow.loadFile('./src/frontend/views/newSite.html');
    // newSiteWindow.webContents.openDevTools();

    newSiteWindow.on('closed', () => {
        newSiteWindow = null;
    });
});

ipcMain.on('close-new-site-window', () => {
    if (newSiteWindow) {
        newSiteWindow.close();
        newSiteWindow = null;
    }

    // Actualiza la vista de sites
    mainWindow.webContents.send('refresh-sites');
});

// Recibimos los datos del nuevo site desde el renderer.js y los guardamos en la base de datos
ipcMain.on('add-site', async (event, siteData) => {
    try {
        const newSite = new Site(siteData);
        await newSite.save();
        event.sender.send('add-site-success');
        mainWindow.webContents.send('refresh-sites'); // Emitir evento para recargar la vista de sitios
    } catch (error) {
        console.error('Error al guardar site:', error);
        event.sender.send('add-site-error', error.message);
    }
});



//-------Lógica para mostrar todos los Sites (para el apartado sitios)------------------------------------------------------
ipcMain.handle('get-sites', async () => {
    try {
        const sites = await Site.find().lean(); // Obtener todos los sitios
        return sites; // Devolver los sitios al renderer.js
    } catch (error) {
        console.error('Error al obtener sitios:', error);
        throw error;
    }
});

//-------Lógica para eliminar Site--------------------------------------------------------------------------------------------------
ipcMain.handle('delete-site', async (event, siteName) => {
    try {
        console.log('Nombre del site a eliminar:', siteName); // Depuración
        const result = await Site.findOneAndDelete({ site_name: siteName }); // Eliminar el site por nombre
        if (result) {
            console.log(`Site eliminado con éxito: ${siteName}`);
        } else {
            console.log(`No se encontró ningún site con el nombre: ${siteName}`);
            throw new Error('No se encontró ningún site con ese nombre.');
        }
    } catch (error) {
        console.error('Error al eliminar el site:', error);
        throw error;
    }
});

//-------Lógica para editar Site--------------------------------------------------------------------------------------------------

let editSiteWindow = null; // Ventana de edición

// Abrimos ventana de edición
ipcMain.on('open-edit-site-window', async (event, siteName) => {
    if (editSiteWindow) {
        editSiteWindow.focus();
        return;
    }

    // Obtener los datos del sitio desde la base de datos
    const siteData = await Site.findOne({ site_name: siteName }).lean();

    if (!siteData) {
        event.sender.send('edit-site-error', 'No se encontró el sitio.');
        return;
    }

    // Crear la ventana de edición
    editSiteWindow = new BrowserWindow({
        width: 575,
        height: 700,
        parent: mainWindow,
        modal: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    editSiteWindow.setMenu(null);
    editSiteWindow.loadFile('./src/frontend/views/editSite.html');

    // Enviar los datos del sitio al frontend después de que la ventana cargue
    editSiteWindow.webContents.on('did-finish-load', () => {
        editSiteWindow.webContents.send('load-site-data', siteData);
    });

    editSiteWindow.on('closed', () => {
        editSiteWindow = null;
    });
});

// Actualizar site en la base de datos
ipcMain.on('update-site', async (event, updatedSite) => {
    try {
        const result = await Site.findOneAndUpdate(
            { site_name: updatedSite.site_name }, // Filtro por nombre único
            updatedSite, // Datos actualizados
            { new: true } // Retornar el documento actualizado
        );

        if (result) {
            event.sender.send('update-site-success');
        } else {
            throw new Error('No se encontró el site para actualizar.');
        }
    } catch (error) {
        console.error('Error al actualizar el site:', error);
        event.sender.send('update-site-error', error.message);
    }
});

ipcMain.on('close-edit-site-window', () => {
    if (editSiteWindow) {
        editSiteWindow.close();
        editSiteWindow = null;
    }

    // Actualiza la vista de sites
    mainWindow.webContents.send('refresh-sites');
});


//-------------------WORKERS--------------------//
let editWorkerWindow = null; // Ventana para editar trabajador

/*----Lógica para Crear Trabajador--------------------------------------------------------------------*/
ipcMain.on('open-new-worker-window', () => {
    if (newWorkerWindow) {
        newWorkerWindow.focus();
        return;
    }

    // Crear la ventana de nuevo trabajador
    newWorkerWindow = new BrowserWindow({
        width: 575,
        height: 900,
        parent: mainWindow,
        modal: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    newWorkerWindow.setMenu(null);
    newWorkerWindow.loadFile('./src/frontend/views/newWorker.html');
    //newWorkerWindow.webContents.openDevTools();


    newWorkerWindow.on('closed', () => {
        newWorkerWindow = null;
    });
});

ipcMain.on('close-new-worker-window', () => {
    if (newWorkerWindow) {
        newWorkerWindow.close();
        newWorkerWindow = null;
    }

    // Actualiza la vista de trabajadores
    mainWindow.webContents.send('refresh-workers');

});

// Recibimos los datos del nuevo trabajador y los guardamos en la base de datos
ipcMain.on("add-worker", async (event, workerData) => {
    try {
        // Validar que el sitio exista en la base de datos
        const siteExists = await Site.findOne({ site_name: workerData.site }); // workerData.site proviene del frontend
        if (!siteExists) {
            throw new Error("El sitio seleccionado no existe.");
        }

        // Guardar los datos del trabajador
        const newWorker = new Worker(workerData);
        await newWorker.save();
        event.sender.send("add-worker-success");
        mainWindow.webContents.send("refresh-workers"); // Recargar la vista de trabajadores
    } catch (error) {
        console.error("Error al guardar trabajador:", error);
        if (error.code === 11000) {
            event.sender.send("add-worker-error", "El ID del trabajador ya existe.");
        } else {
            event.sender.send("add-worker-error", error.message);
        }
    }
});

//-------Lógica para mostrar Sites en el desplegable--------------------------------------------------------------------------------------------------
ipcMain.handle('get-sites-list', async () => {
    try {
        console.log('get-sites-list invocado'); // Depuración
        const sites = await Site.find({}, { site_name: 1, _id: 0 }).lean(); // Usar .lean() para obtener objetos planos, sino me daba error
        return sites;
    } catch (error) {
        console.error('Error al obtener la lista de sitios:', error);
        throw error;
    }
});


//-------Lógica para mostrar Campañas en el desplegable------------------------------------------------------------------
ipcMain.handle('get-campaigns-list', async () => {
    try {
        console.log('get-campaigns-list invocado'); // Depuración
        const campaigns = await Campaign.find({}, { campaign_name: 1, _id: 0 }).lean(); // Sólo obtener los nombres de las campañas
        return campaigns;
    } catch (error) {
        console.error('Error al obtener la lista de campañas:', error);
        throw error;
    }
});


/*----Lógica para Mostrar Trabajadores----------------------------------------------------------------*/
ipcMain.handle('get-workers', async () => {
    try {
        const workers = await Worker.find().lean(); // Obtener todos los trabajadores
        return workers;
    } catch (error) {
        console.error('Error al obtener trabajadores:', error);
        throw error;
    }
});

/*----Lógica para Mostrar Clientes----------------------------------------------------------------*/
ipcMain.handle('get-clients-list', async () => {
    try {
        // Obtener solo los nombres de los clientes
        const clients = await Client.find({}, { client_name: 1, _id: 0 }).lean();
        return clients; // Devuelve la lista de clientes
    } catch (error) {
        console.error('Error al obtener la lista de clientes:', error);
        throw error;
    }
});



/*----Lógica para Eliminar Trabajador----------------------------------------------------------------*/
ipcMain.handle('delete-worker', async (event, workerId) => {
    try {
        const result = await Worker.findOneAndDelete({ agent_id: workerId });
        if (result) {
            console.log(`Trabajador eliminado con éxito: ${workerId}`);
        } else {
            throw new Error('No se encontró ningún trabajador con ese ID.');
        }
    } catch (error) {
        console.error('Error al eliminar trabajador:', error);
        throw error;
    }
});

/*----Lógica para buscar trabajadores por criterios específicos----------------------------------------------------------------*/
ipcMain.handle('search-workers', async (event, searchCriteria) => {
    try {
        // Construir un filtro dinámico basado en los criterios de búsqueda
        const filter = {};

        if (searchCriteria.agent_id) {
            filter.agent_id = { $regex: searchCriteria.agent_id, $options: 'i' }; // Búsqueda por ID
        }
        if (searchCriteria.agent_name) {
            filter.agent_name = { $regex: searchCriteria.agent_name, $options: 'i' }; // Búsqueda por nombre
        }
        if (searchCriteria.agent_surname1) {
            filter.agent_surname1 = { $regex: searchCriteria.agent_surname1, $options: 'i' }; // Primer apellido
        }
        if (searchCriteria.agent_surname2) {
            filter.agent_surname2 = { $regex: searchCriteria.agent_surname2, $options: 'i' }; // Segundo apellido
        }
        if (searchCriteria.site) {
            filter.site = { $regex: searchCriteria.site, $options: 'i' }; // Sitio
        }
        if (searchCriteria.campaign) {
            filter.campaign = { $regex: searchCriteria.campaign, $options: 'i' }; // Campaña
        }

        const workers = await Worker.find(filter).lean(); // Buscar trabajadores con el filtro
        return workers;
    } catch (error) {
        console.error('Error al buscar trabajadores:', error);
        throw error;
    }
});

/*----Lógica para Editar Trabajador------------------------------------------------------------------*/
ipcMain.on('open-edit-worker-window', async (event, workerId) => {
    if (editWorkerWindow) { // Si la ventana ya está abierta, la enfocamos
        editWorkerWindow.focus();
        return;
    }

    //Obtenemos los datos del trabajador
    const workerData = await Worker.findOne({ agent_id: workerId }).lean();
    if (!workerData) {
        event.sender.send('edit-worker-error', 'No se encontró el trabajador.');
        return;
    }

    // Obtenemos listas de sitios y campañas
    const sites = await Site.find({}, { site_name: 1, _id: 0 }).lean();
    const campaigns = await Campaign.find({}, { campaign_name: 1, _id: 0 }).lean();

    editWorkerWindow = new BrowserWindow({
        width: 575,
        height: 900,
        parent: mainWindow,
        modal: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    editWorkerWindow.setMenu(null);
    editWorkerWindow.loadFile('./src/frontend/views/editWorker.html');
    // editWorkerWindow.webContents.openDevTools();


    editWorkerWindow.webContents.on('did-finish-load', () => {
        editWorkerWindow.webContents.send('load-worker-data', { workerData, sites, campaigns });
    });

    editWorkerWindow.on('closed', () => {
        editWorkerWindow = null;
    });
});

ipcMain.on('update-worker', async (event, updatedWorker) => {
    try {
        const result = await Worker.findOneAndUpdate(
            { agent_id: updatedWorker.agent_id },
            updatedWorker,
            { new: true }
        );

        if (result) {
            event.sender.send('update-worker-success');
        } else {
            throw new Error('No se encontró el trabajador para actualizar.');
        }
    } catch (error) {
        console.error('Error al actualizar trabajador:', error);
        event.sender.send('update-worker-error', error.message);
    }
});

ipcMain.on('close-edit-worker-window', () => {
    if (editWorkerWindow) {
        editWorkerWindow.close();
        editWorkerWindow = null;
    }

    // Actualiza la vista de trabajadores
    mainWindow.webContents.send('refresh-workers');
});


//-------------------MAIN--------------------//

//---- Resumen de Sitios, Clientes y Trabajadores (KPI) --------------------------------------------------

ipcMain.handle('get-kpi-data', async () => {
    try {
        const totalSites = await Site.countDocuments(); // Total de sitios
        const totalClients = await Client.countDocuments(); // Total de clientes

        // Agentes por sitio y horas trabajadas por sitio
        const workers = await Worker.aggregate([
            {
                $group: {
                    _id: "$site",
                    totalAgents: { $sum: 1 },
                    totalHoursWorked: { $sum: "$hours_worked" }
                }
            }
        ]);

        return {
            totalSites,
            totalClients,
            workers
        };
    } catch (error) {
        console.error('Error al obtener datos de KPI:', error);
        throw error;
    }
});

//---- Margen de Campañas (KPI) ------------------------------------------------------------------
ipcMain.handle('get-campaigns-kpi', async () => {
    const Campaign = require('./src/backend/models/campaigns');
    const Worker = require('./src/backend/models/workers');
    const Site = require('./src/backend/models/sites');

    // Traer datos
    const campaigns = await Campaign.find().lean();
    const workers = await Worker.find().lean();
    const sitesArr = await Site.find().lean();
    const sites = {};
    sitesArr.forEach(s => {
        sites[s.site_name] = s.cost_per_hour;
    });

    // 1. KPIs por campaña
    const campaignKPIs = campaigns.map(campaign => {
        const workersInCampaign = workers.filter(w => w.campaign === campaign.campaign_name);
        const horas = workersInCampaign.reduce((acc, w) => acc + (w.hours_worked || 0), 0);
        let coste = 0;
        workersInCampaign.forEach(w => {
            const costeHora = sites[w.site] || 0;
            coste += (w.hours_worked || 0) * costeHora;
        });
        const beneficio = horas * (campaign.productive_hours_revenue || 0);
        const margen = beneficio - coste;
        const margenPorc = beneficio > 0 ? (margen / beneficio) * 100 : 0;
        return {
            campaign_name: campaign.campaign_name,
            client: campaign.client,
            marketUnit: campaign.marketUnit,
            language: campaign.language,
            precioHora: campaign.productive_hours_revenue || 0,
            horas,
            coste,
            beneficio,
            margen,
            margenPorc
        };
    });

    // 2. Margen por cliente (agrupado)
    const marginByClient = {};
    campaignKPIs.forEach(kpi => {
        if (!marginByClient[kpi.client]) marginByClient[kpi.client] = 0;
        marginByClient[kpi.client] += kpi.margen;
    });
    const clientMargins = Object.entries(marginByClient).map(([client, margen]) => ({ client, margen }));

    // 3. Agentes por sitio (ya lo tienes en get-kpi-data, pero puedes devolverlo aquí para simplificar aún más)
    const agentsBySite = {};
    workers.forEach(w => {
        if (!agentsBySite[w.site]) agentsBySite[w.site] = new Set();
        agentsBySite[w.site].add(w.agent_id);
    });
    const agentsBySiteArr = Object.entries(agentsBySite).map(([site, set]) => ({
        site,
        totalAgents: set.size
    }));

    return {
        campaignKPIs,
        clientMargins,
        agentsBySite: agentsBySiteArr
    };
});