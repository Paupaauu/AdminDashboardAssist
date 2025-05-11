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

  switch (view) {
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
      renderClients(content);
      break;
    default:
      content.innerHTML = `<h1>Vista no encontrada</h1>`;
  }
}

//--------------------CAMPAÑAS--------------------//
// Función para renderizar la vista de campañas
async function renderCampaigns(content) {
  content.innerHTML = `
    <h1>Campañas existentes</h1>
    <button id="btnOpenNewCampaign" class="btn btn-primary mb-3">Nueva campaña</button>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>#</th>
          <th>Nombre</th>
          <th>Cliente</th>
          <th>Unidad de Mercado</th>
          <th>Idioma</th>
          <th>Precio hora</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody id="campaignsTableBody">
        <tr><td colspan="7">Cargando campañas...</td></tr>
      </tbody>
    </table>
  `;

  // Botón para abrir la ventana de nueva campaña
  const btnOpenNewCampaign = document.getElementById("btnOpenNewCampaign");
  btnOpenNewCampaign.addEventListener('click', () => {
    ipcRenderer.send('open-new-campaign-window');
  });

  // Solicitar campañas al backend
  try {
    const campaigns = await ipcRenderer.invoke('get-campaigns');
    const tableBody = document.getElementById('campaignsTableBody');
    tableBody.innerHTML = ''; // Limpia el contenido actual

    // Rellenar la tabla con las campañas
    if (campaigns.length > 0) {
      campaigns.forEach((campaign, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${campaign.campaign_name}</td>
          <td>${campaign.client}</td>
          <td>${campaign.marketUnit}</td>
          <td>${campaign.language}</td>
          <td>${campaign.productive_hours_revenue}</td>
          <td>
            <button class="btn btn-sm btn-primary btnEditCampaign" data-name="${campaign.campaign_name}">Editar</button>
            <button class="btn btn-sm btn-danger btnDeleteCampaign" data-name="${campaign.campaign_name}">Eliminar</button>
          </td>
        `;
        tableBody.appendChild(row);
      });

      // Agregamos evento al boton "Eliminar"
      const deleteButtons = document.querySelectorAll('.btnDeleteCampaign');
      deleteButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
          const campaignName = event.currentTarget.getAttribute('data-name'); // Obtener el nombre de la campaña
          console.log('Nombre de la campaña a eliminar:', campaignName); // Depuración
          const confirmDelete = confirm('¿Estás seguro de que deseas eliminar esta campaña?');
          if (confirmDelete) {
            try {
              await ipcRenderer.invoke('delete-campaign', campaignName);
              alert('Campaña eliminada con éxito.');
              renderCampaigns(content); // Recargar campañas
            } catch (error) {
              console.error('Error al eliminar campaña:', error);
              alert('Error al eliminar la campaña. Consulta la consola para más detalles.');
            }
          }
        });
      });
    } else {
      tableBody.innerHTML = `<tr><td colspan="7">No hay campañas disponibles.</td></tr>`;
    }
  } catch (error) {
    console.error('Error al obtener campañas:', error);
    const tableBody = document.getElementById('campaignsTableBody');
    tableBody.innerHTML = `<tr><td colspan="7">Error al cargar campañas.</td></tr>`;
  }

  // Agregamos evento al botón "Editar"
  const editButtons = document.querySelectorAll('.btnEditCampaign');
  editButtons.forEach(button => {
    button.addEventListener('click', () => {
      const campaignName = button.getAttribute('data-name'); // Obtener el nombre de la campaña
      ipcRenderer.send('open-edit-campaign-window', campaignName);
    });
  });

  // Escuchar el evento para refrescar la tabla de campañas
  ipcRenderer.on('refresh-campaigns', () => {
    const content = document.getElementById('content');
    renderCampaigns(content); // Recargar la tabla de campañas
  });

}

//--------------------CLIENTES--------------------//

// Escuchar el evento para refrescar la tabla de clientes
ipcRenderer.on('refresh-clients', () => {
  const content = document.getElementById('content');
  renderClients(content); // Recargar la tabla de clientes
});

// Función para renderizar la vista de clientes
async function renderClients(content) {
  content.innerHTML = `
    <h1>Clientes existentes</h1>
    <button id="btnOpenNewClient" class="btn btn-primary mb-3">Nuevo cliente</button>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>#</th>
          <th>Nombre</th>
          <th>Email Responsable</th>
          <th>Descripción</th>
          <th>Img</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody id="clientsTableBody">
        <tr><td colspan="7">Cargando clientes...</td></tr>
      </tbody>
    </table>
  `;

  // Botón para abrir la ventana de nuevo cliente
  const btnOpenNewClient = document.getElementById("btnOpenNewClient");
  btnOpenNewClient.addEventListener('click', () => {
    ipcRenderer.send('open-new-client-window');
  });

  // Solicitar clientes al backend
  try {
    const clients = await ipcRenderer.invoke('get-clients');
    const tableBody = document.getElementById('clientsTableBody');
    tableBody.innerHTML = ''; // Limpia el contenido actual

    // Rellenar la tabla con los
    if (clients.length > 0) {
      clients.forEach((clients, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${clients.client_name}</td>
          <td>${clients.email_manager_in_charge}</td>
          <td>${clients.description}</td>
          <td>${clients.image}</td>
          <td>
            <button class="btn btn-sm btn-primary btnEditClient" data-name="${clients.client_name}">Editar</button>
            <button class="btn btn-sm btn-danger btnDeleteClient" data-name="${clients.client_name}">Eliminar</button>
          </td>
        `;
        tableBody.appendChild(row);
      });

      // Agregamos evento al boton "Eliminar"
      const deleteButtons = document.querySelectorAll('.btnDeleteClient');
      deleteButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
          const clientName = event.currentTarget.getAttribute('data-name'); // Obtener el nombre del cliente
          console.log('Nombre del cliente a eliminar:', clientName); // Depuración
          const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este cliente?');
          if (confirmDelete) {
            try {
              await ipcRenderer.invoke('delete-client', clientName);
              alert('Cliente eliminado con éxito.');
            } catch (error) {
              console.error('Error al eliminar cliente:', error);
              alert('Error al eliminar el cliente. Consulta la consola para más detalles.');
            }
          }
        });
      });
    } else {
      tableBody.innerHTML = `<tr><td colspan="7">No hay clientes disponibles.</td></tr>`;
    }
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    const tableBody = document.getElementById('clientsTableBody');
    tableBody.innerHTML = `<tr><td colspan="7">Error al cargar clientes.</td></tr>`;
  }

  // Agregamos evento al botón "Editar"
  const editButtons = document.querySelectorAll('.btnEditClient');
  editButtons.forEach(button => {
    button.addEventListener('click', () => {
      const clientName = button.getAttribute('data-name'); // Obtener el nombre del cliente
      ipcRenderer.send('open-edit-client-window', clientName);
    });
  });

}

