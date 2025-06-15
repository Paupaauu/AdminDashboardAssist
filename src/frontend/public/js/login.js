const { ipcRenderer } = require('electron');

document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const useremail = document.getElementById('useremail').value.trim();
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('loginError');
  errorDiv.classList.add('d-none');

  const ok = await ipcRenderer.invoke('do-login', { useremail, password });
  if (ok) {
    window.location = 'index.html';
  } else {
    errorDiv.textContent = "Usuario o contraseña incorrectos";
    errorDiv.classList.remove('d-none');
  }
});

// Si quieres implementar recuperación de contraseña, pon aquí el código para el botón/link