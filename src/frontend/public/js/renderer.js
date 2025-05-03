function loadView(view) {
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => link.classList.remove('active')); 

  const selectedLink = document.getElementById(view);
  if (selectedLink) {
    selectedLink.classList.add('active');
  }

  fetch(`${view}.html`)
      .then(response => response.text())
      .then(html => {
          const content = document.getElementById('content');
          content.innerHTML = html;

          // Cargar el script asociado después de cargar el HTML
          const script = document.createElement('script');
          script.src = `../public/js/${view}Renderer.js`; // por ejemplo: campaignsRenderer.js
          script.type = 'text/javascript';
          script.onload = () => console.log(`${view}Renderer cargado`);
          document.body.appendChild(script);
      })
      .catch(error => console.error('Error al cargar la vista:', error));
}
