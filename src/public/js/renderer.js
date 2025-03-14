const { ipcRenderer } = require("electron");

// Función para cambiar de vista
function navigateTo(page) {
  ipcRenderer.send("navigate", page);
}

// Boton para ir a settings
document.addEventListener("DOMContentLoaded", () => {
  const buttonTest = document.getElementById("buttonTest");
  if (buttonTest) {
    buttonTest.addEventListener("click", () => navigateTo("settings"));
  }
});

//Boton para volver a index
document.addEventListener("DOMContentLoaded", () => {
  const buttonBack = document.getElementById("buttonBack");
  if (buttonBack) {
    buttonBack.addEventListener("click", () => navigateTo("index"));
  }
});

