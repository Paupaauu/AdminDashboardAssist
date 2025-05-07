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

/*----Lógica para Crear Campaña--------------------------------------------------------------------*/
ipcMain.on('open-new-campaign-window', () => {
    if (newCampaignWindow) {
        newCampaignWindow.focus();
        return;
    }

    // Creamos la ventana de nueva campaña
    newCampaignWindow = new BrowserWindow({
        width: 575,
        height: 600,
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