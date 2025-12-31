const createError = require('../middlewares/error');
const ModelUser = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ENV = require('../config/env');
const { checkAdmin } = require('../services/user.service');

// Get all users
const getAll = async (req, res, next) => {
    try {
        // Status admin verification
        await checkAdmin(req.auth.id);
        const users = await ModelUser.find();
        res.status(200).json(users);
    } catch (error) {
        next(createError(error.status || 500, "Failed to get all users", error.message));
    }
}

// Add a new user
const register = async (req, res, next) => {
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
const login = async (req, res, next) => {
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

        // Créer un JWT (Json Web Token)
        const token = jwt.sign(
            { id: user._id },
            ENV.TOKEN, 
            { expiresIn: "24h" }
        )

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
        const currentUserId = req.auth.id; // The connected user
        const targetUserId = req.params.id; // The user to delete

        // If I'm not deleting my account...
        if (currentUserId !== targetUserId) {
            // Then I should be an admin
            await checkAdmin(currentUserId);
        }

        const user = await ModelUser.findByIdAndDelete(req.params.id);

        if(!user) return res.status(404).json('User not found !');
        
        res.status(200).json('User deleted !');
    } catch (error) {
        next(createError(error.status || 500, "Failed to delete user", error.message));
    }
};

const updateUser = async (req, res, next) => {
    try {
        // Is it me?
        if (req.auth.id !== req.params.id) {
            // If it's not me, am I admin?
            await checkAdmin(req.auth.id);
        }

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