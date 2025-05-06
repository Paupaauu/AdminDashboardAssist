const mongoose = require('mongoose');

// Esquema para la colección Clients
const clientsSchema = new mongoose.Schema({
    client_name: {
        type: String,
        required: true,
        unique: true,
    },
    client_shortname: {
        type: String,
        required: true,
    },
});

// Modelo para la colección Clients
module.exports = mongoose.model('clients', clientsSchema);