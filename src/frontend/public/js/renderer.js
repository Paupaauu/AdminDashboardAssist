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
      renderMain(content);
      break;
    case 'workers':
      renderWorkers(content);
      break;
    case 'campaigns':
      renderCampaigns(content);
      break;
    case 'clients':
      renderClients(content);
      break;
    case 'sites': // Añadimos la lógica para renderizar la vista de sites
      renderSites(content);
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
          <td>${campaign.productive_hours_revenue.toFixed(2)}€</td>
          <td>
            <button class="btn btn-sm btn-primary btn-sm btnEditCampaign" data-name="${campaign.campaign_name}">Editar</button>
            <button class="btn btn-sm btn-danger btn-sm btnDeleteCampaign" data-name="${campaign.campaign_name}">Eliminar</button>
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
    <div class="row" id="clientsCardsContainer">
      <!-- Aquí se insertarán las tarjetas de los clientes -->
    </div>
  `;

  // Botón para abrir la ventana de nuevo cliente
  const btnOpenNewClient = document.getElementById("btnOpenNewClient");
  btnOpenNewClient.addEventListener('click', () => {
    ipcRenderer.send('open-new-client-window');
  });

  // Solicitar clientes al backend
  try {
    const clients = await ipcRenderer.invoke('get-clients');
    const container = document.getElementById('clientsCardsContainer');
    container.innerHTML = ''; // Limpia el contenido actual

    // Rellenar el contenedor con las tarjetas de los clientes
    if (clients.length > 0) {
      clients.forEach(client => {
        const card = document.createElement('div');
        card.className = 'col-12 col-sm-6 col-md-4 col-lg-3 mb-4';
        card.innerHTML = `
            <div class="card shadow-sm">
                <img src="file://${__dirname}/../public/${client.image}" class="card-img-top" alt="${client.client_name}">
                <div class="card-body">
                    <h5 class="card-title">${client.client_name}</h5>
                    <p class="card-text email"> ${client.email_manager_in_charge}</p>
                    <p class="card-text">${client.description}</p>
                </div>
                <div class="card-footer d-flex justify-content-end">
                    <button class="btn btn-primary btn-sm btnEditClient me-2" data-name="${client.client_name}">Editar</button>
                    <button class="btn btn-danger btn-sm btnDeleteClient" data-name="${client.client_name}">Eliminar</button>
                </div>
            </div>
        `;
        container.appendChild(card);
      });
      // Agregar eventos a los botones
      const deleteButtons = document.querySelectorAll('.btnDeleteClient');
      deleteButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
          const clientName = event.currentTarget.getAttribute('data-name');
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

      const editButtons = document.querySelectorAll('.btnEditClient');
      editButtons.forEach(button => {
        button.addEventListener('click', () => {
          const clientName = button.getAttribute('data-name');
          ipcRenderer.send('open-edit-client-window', clientName);
        });
      });
    } else {
      container.innerHTML = `<p>No hay clientes disponibles.</p>`;
    }
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    const container = document.getElementById('clientsCardsContainer');
    container.innerHTML = `<p>Error al cargar clientes.</p>`;
  }
}

//--------------------SITES--------------------//
// Escuchar el evento para refrescar la tabla de sitios
ipcRenderer.on('refresh-sites', () => {
  const content = document.getElementById('content');
  renderSites(content); // Recargar la tabla de sitios
});

// Función para renderizar la vista de sitios
async function renderSites(content) {
  content.innerHTML = `
    <h1>Sitios Existentes</h1>
    <button id="btnOpenNewSite" class="btn btn-primary mb-3">Nuevo sitio</button>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>#</th>
          <th>Nombre del Sitio</th>
          <th>País</th>
          <th>Dirección</th>
          <th>Fecha de Apertura</th>
          <th>Fecha de Cierre</th>
          <th>Costo por Hora (€)</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody id="sitesTableBody">
        <tr><td colspan="8">Cargando sitios...</td></tr>
      </tbody>
    </table>
  `;

  const btnOpenNewSite = document.getElementById("btnOpenNewSite");
  btnOpenNewSite.addEventListener('click', () => {
    ipcRenderer.send('open-new-site-window');
  });

  try {
    const sites = await ipcRenderer.invoke('get-sites');
    const tableBody = document.getElementById('sitesTableBody');
    tableBody.innerHTML = ''; // Limpia el contenido actual

    if (sites.length > 0) {
      sites.forEach((site, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${site.site_name}</td>
          <td>${site.country}</td>
          <td>${site.address}</td>
          <td>${new Date(site.opened_date).toLocaleDateString()}</td>
          <td>${site.closed_date ? new Date(site.closed_date).toLocaleDateString() : 'N/A'}</td>
          <td>${site.cost_per_hour.toFixed(2)}€</td>
          <td>
            <button class="btn btn-sm btn-primary btnEditSite me-2" data-name="${site.site_name}">Editar</button>
            <button class="btn btn-sm btn-danger btnDeleteSite" data-name="${site.site_name}">Eliminar</button>
          </td>
        `;
        tableBody.appendChild(row);
      });

      // Agregar eventos a los botones
      document.querySelectorAll('.btnDeleteSite').forEach(button => {
        button.addEventListener('click', async (event) => {
          const siteName = event.currentTarget.getAttribute('data-name');
          const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este sitio?');
          if (confirmDelete) {
            try {
              await ipcRenderer.invoke('delete-site', siteName);
              alert('Sitio eliminado con éxito.');
              renderSites(content); // Recargar sitios
            } catch (error) {
              console.error('Error al eliminar sitio:', error);
              alert('Error al eliminar el sitio.');
            }
          }
        });
      });

      document.querySelectorAll('.btnEditSite').forEach(button => {
        button.addEventListener('click', () => {
          const siteName = button.getAttribute('data-name');
          ipcRenderer.send('open-edit-site-window', siteName);
        });
      });
    } else {
      tableBody.innerHTML = `<tr><td colspan="8">No hay sitios disponibles.</td></tr>`;
    }
  } catch (error) {
    console.error('Error al obtener sitios:', error);
    const tableBody = document.getElementById('sitesTableBody');
    tableBody.innerHTML = `<tr><td colspan="8">Error al cargar sitios.</td></tr>`;
  }
}

//--------------------WORKERS--------------------//
async function renderWorkers(content) {
  content.innerHTML = `
      <h1>Trabajadores existentes</h1>
      <div class="mb-3">
        <h5>Buscar trabajadores:</h5>
        <form id="workerSearchForm" class="row row-cols-lg-auto g-3 align-items-center">
          <div class="col">
            <input type="text" class="form-control" id="searchAgentId" placeholder="ID del trabajador">
          </div>
          <div class="col">
            <input type="text" class="form-control" id="searchAgentName" placeholder="Nombre">
          </div>
          <div class="col">
            <input type="text" class="form-control" id="searchAgentSurname1" placeholder="Primer apellido">
          </div>
          <div class="col">
            <input type="text" class="form-control" id="searchAgentSurname2" placeholder="Segundo apellido">
          </div>
          <div class="col">
            <input type="text" class="form-control" id="searchSite" placeholder="Sitio">
          </div>
          <div class="col">
            <input type="text" class="form-control" id="searchCampaign" placeholder="Campaña">
          </div>
          <div class="col">
            <button type="submit" class="btn btn-primary">Buscar</button>
            <button type="button" id="btnClearFilters" class="btn btn-secondary">Limpiar</button>
          </div>
        </form>
      </div>
      <button id="btnOpenNewWorker" class="btn btn-primary mb-3">Nuevo trabajador</button>
      <table class="table table-striped">
          <thead>
              <tr>
                  <th>#</th>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Primer Apellido</th>
                  <th>Segundo Apellido</th>
                  <th>Sitio</th>
                  <th>Actividad</th>
                  <th>Campaña</th>
                  <th>Horas Trabajadas</th>
                  <th>Acciones</th>
              </tr>
          </thead>
          <tbody id="workersTableBody">
              <tr><td colspan="9">Cargando trabajadores...</td></tr>
          </tbody>
      </table>
  `;

  // Botón para abrir la ventana de nuevo trabajador
  const btnOpenNewWorker = document.getElementById("btnOpenNewWorker");
  btnOpenNewWorker.addEventListener('click', () => {
      ipcRenderer.send('open-new-worker-window');
  });

  // Escuchar el evento de búsqueda
  const workerSearchForm = document.getElementById("workerSearchForm");
  workerSearchForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      // Obtener los valores de los campos de búsqueda
      const searchCriteria = {
          agent_id: document.getElementById("searchAgentId").value.trim(),
          agent_name: document.getElementById("searchAgentName").value.trim(),
          agent_surname1: document.getElementById("searchAgentSurname1").value.trim(),
          agent_surname2: document.getElementById("searchAgentSurname2").value.trim(),
          site: document.getElementById("searchSite").value.trim(),
          campaign: document.getElementById("searchCampaign").value.trim(),
      };

      // Enviar los criterios de búsqueda al proceso principal
      const workers = await ipcRenderer.invoke('search-workers', searchCriteria);
      renderWorkersTable(workers); // Renderizar la tabla con los resultados
  });

  // Botón para limpiar los filtros
  const btnClearFilters = document.getElementById("btnClearFilters");
  btnClearFilters.addEventListener('click', async () => {
      // Limpiar los campos del formulario
      document.getElementById("searchAgentId").value = '';
      document.getElementById("searchAgentName").value = '';
      document.getElementById("searchAgentSurname1").value = '';
      document.getElementById("searchAgentSurname2").value = '';
      document.getElementById("searchSite").value = '';
      document.getElementById("searchCampaign").value = '';

      // Cargar todos los trabajadores nuevamente
      const workers = await ipcRenderer.invoke('get-workers');
      renderWorkersTable(workers); // Renderizar la tabla con todos los trabajadores
  });

  // Manejar el evento `refresh-workers` para actualizar la tabla automáticamente
  ipcRenderer.on('refresh-workers', async () => {
      const workers = await ipcRenderer.invoke('get-workers');
      renderWorkersTable(workers); // Renderizar la tabla con todos los trabajadores
  });

  // Cargar todos los trabajadores al inicio
  const workers = await ipcRenderer.invoke('get-workers');
  renderWorkersTable(workers); // Renderizar la tabla con todos los trabajadores
}

// Función para renderizar la tabla de trabajadores
function renderWorkersTable(workers) {
    const tableBody = document.getElementById('workersTableBody');
    tableBody.innerHTML = ''; // Limpia el contenido actual

    if (workers.length > 0) {
        workers.forEach((worker, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${worker.agent_id}</td>
                <td>${worker.agent_name}</td>
                <td>${worker.agent_surname1}</td>
                <td>${worker.agent_surname2}</td>
                <td>${worker.site}</td>
                <td>${worker.activity}</td>
                <td>${worker.campaign}</td>
                <td>${worker.hours_worked} h</td>
                <td>
                    <button class="btn btn-sm btn-primary btnEditWorker me-2" data-id="${worker.agent_id}">Editar</button>
                    <button class="btn btn-sm btn-danger btnDeleteWorker" data-id="${worker.agent_id}">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Agregar eventos a los botones de acciones
        document.querySelectorAll('.btnDeleteWorker').forEach(button => {
            button.addEventListener('click', async (event) => {
                const workerId = event.currentTarget.getAttribute('data-id');
                const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este trabajador?');
                if (confirmDelete) {
                    try {
                        await ipcRenderer.invoke('delete-worker', workerId);
                        alert('Trabajador eliminado con éxito.');
                        const workers = await ipcRenderer.invoke('get-workers');
                        renderWorkersTable(workers); // Recargar la tabla
                    } catch (error) {
                        console.error('Error al eliminar trabajador:', error);
                        alert('Error al eliminar el trabajador.');
                    }
                }
            });
        });

        document.querySelectorAll('.btnEditWorker').forEach(button => {
            button.addEventListener('click', () => {
                const workerId = button.getAttribute('data-id');
                ipcRenderer.send('open-edit-worker-window', workerId);
            });
        });
    } else {
        tableBody.innerHTML = `<tr><td colspan="9">No se encontraron trabajadores.</td></tr>`;
    }
}
//--------------------MAIN--------------------//
async function renderMain(content) {
  content.innerHTML = `
    <h1>Situación Global</h1>
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">Agentes por Sitio</h5>
            <canvas id="agentsBySiteChart" height="180"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">Margen Monetario por Cliente</h5>
            <canvas id="marginByClientChart" height="180"></canvas>
          </div>
        </div>
      </div>
    </div>

    <h2 class="mt-5">KPIs de Campañas</h2>
    <table class="table table-striped mt-3">
      <thead>
        <tr>
          <th>Campaña</th>
          <th>Cliente</th>
          <th>Unidad de Mercado</th>
          <th>Idioma</th>
          <th>Precio/h</th>
          <th>Horas</th>
          <th>Coste Total</th>
          <th>Beneficio</th>
          <th>Margen (€)</th>
          <th>Margen (%)</th>
        </tr>
      </thead>
      <tbody id="campaignsKpiBody">
        <tr><td colspan="10">Cargando...</td></tr>
      </tbody>
    </table>
  `;

  const kpi = await ipcRenderer.invoke('get-campaigns-kpi');
  // 1. Gráfico Agentes por Sitio
  if (kpi.agentsBySite) {
    const labels = kpi.agentsBySite.map(e => e.site);
    const data = kpi.agentsBySite.map(e => e.totalAgents);
    const ctx = document.getElementById('agentsBySiteChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Nº de Agentes',
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.7)'
        }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }
  // 2. Gráfico Margen por Cliente
  if (kpi.clientMargins) {
    const labels = kpi.clientMargins.map(e => e.client);
    const data = kpi.clientMargins.map(e => e.margen);
    const ctx = document.getElementById('marginByClientChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Margen (€)',
          data,
          backgroundColor: 'rgba(255, 99, 132, 0.7)'
        }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }
  // 3. Tabla KPIs campañas
  const tbody = document.getElementById('campaignsKpiBody');
  tbody.innerHTML = "";
  if (kpi.campaignKPIs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10">No hay campañas.</td></tr>`;
    return;
  }
  kpi.campaignKPIs.forEach(kpiRow => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${kpiRow.campaign_name}</td>
      <td>${kpiRow.client}</td>
      <td>${kpiRow.marketUnit}</td>
      <td>${kpiRow.language}</td>
      <td>${kpiRow.precioHora.toFixed(2)} €</td>
      <td>${kpiRow.horas}</td>
      <td>${kpiRow.coste.toFixed(2)} €</td>
      <td>${kpiRow.beneficio.toFixed(2)} €</td>
      <td>${kpiRow.margen.toFixed(2)} €</td>
      <td>${kpiRow.margenPorc.toFixed(2)} %</td>
    `;
    tbody.appendChild(row);
  });
}