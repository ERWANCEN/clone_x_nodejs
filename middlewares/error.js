const createError = (status, message, details = null) => {
    // crée une nouvelle instance d'erreur vide
    const error = new Error();
    /* 
        Définit le code d'état de l'erreur en fonction du paramètre "status"
    */
    error.status = status;
    /* 
        Définit le code d'état de l'erreur en fonction du paramètre "message"
    */
    error.message = message;
    /* 
        Permet d'ajouter des infos supplémentaires si besoin
    */
    error.details = details;

    return error;
}

module.exports = createError;