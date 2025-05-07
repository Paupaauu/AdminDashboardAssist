//Conexión a la base de datos MongoDB 
 
const mongoose = require('mongoose'); // Importamos mongoose   

const connectDB = async () => { 
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/AssistAdminDashboard', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB conectada correctamente');
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB; // Exportamos la función connectDB para usarla en otros archivos
