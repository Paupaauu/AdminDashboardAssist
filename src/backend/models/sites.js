// Define el esquema de la base de datos para los documentos de sitios
const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
  site_name: { 
    type: String, 
    required: true 
  },
  country: { 
    type: String, 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  opened_date: {
    type: Date, 
    required: true 
  },
  closed_date: { 
    type: Date, 
    required: false 
  },
  cost_per_hour: {
    type: Number, 
    required: true 
  },

});

module.exports = mongoose.model('site', siteSchema);