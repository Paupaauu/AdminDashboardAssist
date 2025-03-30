const mongoose = require('mongoose');

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

module.exports = connectDB;
