const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./src/backend/models/users');

// Cambia la URL y el nombre de usuario según tu modelo
mongoose.connect('mongodb://127.0.0.1:27017/AssistAdminDashboard')
  .then(async () => {
    const hash = bcrypt.hashSync('test123', 10); // La contraseña real y los rounds. Los rounds son el número de veces que se aplica el algoritmo de hash, 10 es un valor común. Cuanto más alto, más seguro pero también más lento.
    await User.create({ useremail: 'pauduraperez@email.com', password: hash }); // O 'useremail' si así se llama en tu modelo
    console.log('Usuario creado');
    process.exit();
  });