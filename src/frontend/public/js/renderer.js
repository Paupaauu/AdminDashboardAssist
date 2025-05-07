// Código actualizado para manejar el contenido dinámico en el index.html
const { ipcRenderer } = require('electron');

// Función para cargar contenido dinámico
function loadView(view) {
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => link.classList.remove('active')); 

  const selectedLink = document.getElementById(view);
  if (selectedLink) {
    selectedLink.classList.add('active');
  }

  // Lógica para renderizar contenido dinámico según la vista seleccionada
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

// Función para renderizar campañas dinámicamente
function renderCampaigns(content) {
  content.innerHTML = `
    <h1>Campañas existentes</h1>
    <button id="btnOpenNewCampaign">Nueva campaña</button>
    <div id="campaignsWrapper"></div>
  `;

  const btnOpenNewCampaign = document.getElementById("btnOpenNewCampaign");
  btnOpenNewCampaign.addEventListener('click', () => {
    ipcRenderer.send('open-new-campaign-window');
  });

  // Obtener y mostrar campañas
  ipcRenderer.send('get-campaigns');
  ipcRenderer.on('campaigns-data', (event, campaigns) => {
    const campaignsWrapper = document.getElementById("campaignsWrapper");
    campaignsWrapper.innerHTML = campaigns.map(c => `
      <div style="margin-bottom: 1em;">
        <label><strong>${c.campaign_name}</strong></label><br>        
        <label><strong>${c.client}</strong></label><br>
        <label>${c.language}</label>
      </div>
    `).join('');
  });
}

// Inicializar la vista principal al cargar la aplicación
window.onload = () => {
  loadView('main');
};