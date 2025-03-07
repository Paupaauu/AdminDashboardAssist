  const { ipcRenderer } = require("electron");


  document.addEventListener("DOMContentLoaded", () => {
    const buttonTest = document.getElementById("buttonTest");
  
    if (buttonTest) {
      buttonTest.addEventListener("click", () => {
        ipcRenderer.send("open-settings"); // Envía la señal al proceso principal
      });
    }
  });
