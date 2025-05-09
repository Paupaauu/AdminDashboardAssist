const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const connectDB = require("./src/backend/config/db");
const Campaign = require("./src/backend/models/campaigns"); // Importamos el modelo campaigns
const Site = require('./src/backend/models/sites'); // Importar el modelo sites
const Activities = require('./src/backend/models/activities'); // Importar el modelo activities
let mainWindow; // Variable global para la ventana principal
let newCampaignWindow = null; // Variable global para la ventana de crear nueva campaña


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
    mainWindow.loadFile("./src/frontend/views/index.html");
    //mainWindow.webContents.openDevTools(); //Abre automaticamente herramientas de depuración
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
    // newCampaignWindow.webContents.openDevTools();

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

    editCampaignWindow.webContents.on('did-finish-load', () => {
        editCampaignWindow.webContents.send('load-campaign-data', campaignData);
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

//-------------------CLIENTES--------------------//
