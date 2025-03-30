

// Función para cambiar de vista y marcar la opción activa
function loadView(view) {
  //Eliminamos la clase 'active' de todos los enlaces
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => link.classList.remove('active')); 

  // Ahora, agregamos la clase 'active' al enlace correspondiente
  const selectedLink = document.getElementById(view);
  if (selectedLink) {
    selectedLink.classList.add('active');
  }

  // Cargar la vista correspondiente
  fetch(`${view}.html`)
      .then(response => response.text())
      .then(html => {
          document.getElementById('content').innerHTML = html;
      })
      .catch(error => console.error('Error al cargar la vista:', error));
}
