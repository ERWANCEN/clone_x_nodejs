const ModelUser = require('../models/User.model');
const bcrypt = require('bcrypt');

// Get all users
const getAll = async (req, res) => {
    try {
        const users = await ModelUser.find();
        res.status(200).json(users);
    } catch (error) {
        next(createError(error.status || 500, "Failed to get all users", error.message));
    }
}

// Add a new user
const register = async (req, res) => {
    try {
        // "10" est le nombre de tours de salage
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = await ModelUser.create({
            ...req.body,
            password: hashedPassword
        })
        console.log(req.body);
        

        res.status(201).json(user);
    } catch (error) {
        next(createError(error.status || 500, "Failed to register", error.message));
    }
}

// User login
const login = async (req, res) => {
    try {
        // 1 - Recherche l utilisateur dans la base de données
        const user = await ModelUser.findOne({email: req.body.email});

        // 2 - Si l utilisateur n est pas trouvé, renvoie une erreur 404
        if(!user) return res.status(404).json('USER NOT FOUND');

        // 3 - Compare le mot de passe fourni dans la requête 
        // Avec le mot de passe de l utilisateur qui est dans la bdd
        const passwordComparison = await bcrypt.compare(req.body.password, user.password);

        // 4 - Si le mot de passe est incorrect, renvoie une erreur 400
        if(!passwordComparison) return res.status(400).json('Wrong Credentials !');

        const { password, ...others } = user._doc

        res.cookie(
            'access_token', 
            token,
            { httpOnly: true }
        )
        .status(200)
        .json(others);
    } catch (error) {
        next(createError(error.status || 500, "Failed to log in", error.message));
    }
}

const deleteUser = async (req, res, next) => {
    try {
        const user = await ModelUser.findByIdAndDelete(req.params.id);
        if(!user) return res.status(404).json('User not found !');
        res.status(200).json('User deleted !');
    } catch (error) {
        next(createError(error.status || 500, "Failed to delete user", error.message));
    }
};

const updateUser = async (req, res, next) => {
    try {
        const user = await ModelUser.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        if(!user) return res.status(404).json('User not found !');
        res.status(200).json(user);
    } catch (error) {
        next(createError(error.status || 500, "Failed to update user", error.message));
    }
}

module.exports = {
    getAll,
    register,
    login,
    deleteUser,
    updateUser
}