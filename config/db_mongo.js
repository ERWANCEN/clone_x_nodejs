const mongoose = require('mongoose');

const connectDB = (mongoURI, dbName) => {
    mongoose.connect(mongoURI, {dbName: dbName})
        .then(() => console.log('Connexion à mongo réussie !'))
        .catch(error => console.log(`Erreur de connexion à mongo : ${error}`))
}

module.exports = connectDB;