const Campaign = require('../models/campaigns');

// Función para crear una campaña
const createCampaign = async (data) => {
    try {
        const newCampaign = new Campaign(data);
        await newCampaign.save();
        console.log('Campaña creada:', newCampaign); // Para depurar
    } catch (error) {
        console.error('Error creando campaña:', error); // Asegúrate de que hay un manejo de errores adecuado
    }
};

// Función para obtener todas las campañas
const getCampaigns = async () => {
    try {
        return await Campaign.find(); // Devuelve las campañas
    } catch (error) {
        console.error('Error obteniendo campañas:', error); // Asegúrate de que hay un manejo de errores adecuado
    }
};

module.exports = { createCampaign, getCampaigns };
