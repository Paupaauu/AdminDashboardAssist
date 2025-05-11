const mongoose = require('mongoose');

// Esquema para la colección Clients
const clientsSchema = new mongoose.Schema({
        client_name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        email_manager_in_charge: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String, 
            required: false, 
            trim: true
        },
        image: {
            type: String, // URL de la imagen
            required: false, 
            trim: true
        },
    });

// Modelo para la colección Clients
module.exports = mongoose.model('clients', clientsSchema);