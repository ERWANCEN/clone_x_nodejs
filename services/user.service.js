const ModelUser = require('../models/user.model');
const createError = require('../middlewares/error');

// Verify that the user exists AND that he is an admin
const checkAdmin = async (userId) => {
    const user = await ModelUser.findById(userId);

    if (!user) throw createError(404, 'User not found');

    if (user.role !== 'admin') throw createError(403, "You're not allowed to perform this action");
    else return user;
};

module.exports = {
    checkAdmin
};