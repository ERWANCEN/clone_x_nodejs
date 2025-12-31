const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Si déjà connecté, on ne fait rien (Optimisation Vercel)
    if (mongoose.connection.readyState === 1) {
      return;
    }

    // On récupère l'URI depuis les variables d'environnement
    // (Note: on enlève les arguments de la fonction pour simplifier)
    const uri = process.env.MONGO_URI;
    
    if (!uri) {
        throw new Error("La variable MONGO_URI est manquante !");
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout rapide (5s)
      socketTimeoutMS: 45000,
    });

    console.log("MongoDB connecté avec succès !");
  } catch (error) {
    console.error("Erreur connexion MongoDB :", error);
    throw error;
  }
};

module.exports = connectDB;