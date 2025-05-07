// Código para manejar el contenido de index.html
const { ipcRenderer } = require('electron');

// Inicializar la vista principal al cargar la aplicación
window.onload = () => {
  loadView('main'); 
};

// Función para cargar contenido dinámico
function loadView(view) {
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => link.classList.remove('active')); 

  const selectedLink = document.getElementById(view);
  if (selectedLink) {
    selectedLink.classList.add('active');
  }

  // Lógica para mostrar contenido dinámico según la vista seleccionada
  const content = document.getElementById('content');
  content.innerHTML = ''; // Limpia el contenido actual

  switch(view) {
    case 'main':
      content.innerHTML = `<h1>Bienvenido a la página principal</h1>`;
      break;
    case 'users':
      content.innerHTML = `<h1>Gestión de usuarios</h1>`;
      break;
    case 'campaigns':
      renderCampaigns(content);
      break;
    case 'clients':
      content.innerHTML = `<h1>Gestión de clientes</h1>`;
      break;
    default:
      content.innerHTML = `<h1>Vista no encontrada</h1>`;
  }
}

//--------------------CAMPAÑAS--------------------//
// Función para renderizar la vista de campañas
function renderCampaigns(content) {
  content.innerHTML = `
    <h1>Campañas existentes</h1>
    <button id="btnOpenNewCampaign" class="btn btn-primary">Nueva campaña</button>
  `;
// Botón para abrir la ventana de nueva campaña
  const btnOpenNewCampaign = document.getElementById("btnOpenNewCampaign");
  btnOpenNewCampaign.addEventListener('click', () => {
    ipcRenderer.send('open-new-campaign-window');
  });

  
}
