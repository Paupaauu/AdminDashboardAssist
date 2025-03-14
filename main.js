const { app, BrowserWindow, ipcMain } = require("electron");

let mainWindow; // Variable global para la ventana principal

// Función que crea la ventana principal
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false //Permite que window y otros objetos del contexto de Electron puedan interactuar directamente con Node.js en el renderer
        },
    });

    //quita menú por defecto de chromium
    mainWindow.setMenu(null);

    // Carga el archivo HTML en la ventana
    mainWindow.loadFile("./src/views/index.html");
}

//Codigo para lanzar la pagina principal y para cerrar app cuando se cierre la ventana
app.whenReady().then(() => {
    createWindow();

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


//--------------------------------------------------------------------------------------------------------

//Codigo para abrir nueva ventana settings
let settingsWindow; 

  // Escuchar el mensaje del renderer para cambiar de vista
  ipcMain.on("navigate", (event, page) => {
    mainWindow.loadFile(`src/views/${page}.html`);
  });