const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const connectDB = require("./src/backend/config/db");
const Campaign = require("./src/backend/models/campaigns");
let newCampaignWindow = null;


let mainWindow; // Variable global para la ventana principal

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
    connectDB(); // Conectar a MongoDB


    //Este código cierra completamente la aplicación cuando todas las ventanas han sido cerradas, excepto en macOS
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

ipcMain.on('open-new-campaign-window', () => {
    if (newCampaignWindow) {
        newCampaignWindow.focus();
        return;
    }

    newCampaignWindow = new BrowserWindow({
        width: 500,
        height: 400,
        parent: mainWindow,
        modal: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    newCampaignWindow.setMenu(null);
    newCampaignWindow.loadFile('./src/frontend/views/newCampaign.html');

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

ipcMain.on('get-campaigns', async (event) => {
    try {
        const campaigns = await Campaign.find().populate('sites').populate('activities_Used');
        event.sender.send('campaigns-data', campaigns);
    } catch (error) {
        console.error('Error obteniendo campañas:', error);
        event.sender.send('campaigns-data', []); // envía array vacío si falla
    }
});

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

//--------------------------------------------------------------------------------------------------------
  