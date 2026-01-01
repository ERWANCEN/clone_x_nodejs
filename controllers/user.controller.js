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
        // “10” is the number of salting rounds
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
        // Search for the user in the database
        const user = await ModelUser.findOne({email: req.body.email});

        // If the user is not found, return a 404 error
        if(!user) return res.status(404).json('User not found');

        // Compares the password provided in the request with the user's password stored in the database
        const passwordComparison = await bcrypt.compare(req.body.password, user.password);

        // If the password is incorrect, returns a 400 error
        if(!passwordComparison) return res.status(400).json('Wrong Credentials');

        // Create a JWT (JSON Web Token)
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

        if(!user) return res.status(404).json('User not found');
        
        res.status(200).json('User deleted');
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

        if(!user) return res.status(404).json('User not found');

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