const mongoose = require('mongoose');
const Campaign = require('./src/backend/models/campaigns');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/AssistAdminDashboard', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB conectada correctamente');

        // Probar la consulta
        const campaigns = await Campaign.find();
        console.log('Campañas obtenidas:', campaigns);

        // Cerrar la conexión
        mongoose.connection.close();
    } catch (error) {
        console.error('Error conectando a MongoDB o ejecutando la consulta:', error);
    }
};

connectDB();