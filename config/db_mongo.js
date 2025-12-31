const mongoose = require('mongoose');

// On rend la fonction ASYNC pour pouvoir utiliser AWAIT
const connectDB = async (mongoURI, dbName) => {
    try {
        // 1. OPTIMISATION VERCEL : 
        // Si on est déjà connecté (readyState = 1), on ne refait rien.
        // Cela évite de se reconnecter à chaque requête.
        if (mongoose.connection.readyState === 1) {
            // console.log("Déjà connecté à MongoDB"); // Optionnel
            return;
        }

        // 2. ON ATTEND LA CONNEXION (AWAIT)
        // On ajoute un timeout court (5s) pour ne pas bloquer Vercel indéfiniment
        await mongoose.connect(mongoURI, {
            dbName: dbName,
            serverSelectionTimeoutMS: 5000 
        });

        console.log('Connexion à mongo réussie !');

    } catch (error) {
        console.log(`Erreur de connexion à mongo : ${error}`);
        // On renvoie l'erreur pour que le code sache que ça a échoué
        throw error; 
    }
}

module.exports = connectDB;