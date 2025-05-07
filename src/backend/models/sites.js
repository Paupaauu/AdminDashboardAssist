// Define el esquema de la base de datos para los documentos de sitios
const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: false 
  }
});

module.exports = mongoose.model('site', siteSchema);