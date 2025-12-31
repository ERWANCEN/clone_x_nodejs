const express = require('express');
const router = express.Router();

// IMPORTING THE CONTROLLER
const verifyToken = require('../middlewares/auth');
const UserController = require('../controllers/user.controller');

router.get('/all', verifyToken, UserController.getAll);
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.delete('/delete/:id', verifyToken, UserController.deleteUser);
router.put('/update/:id', verifyToken, UserController.updateUser);

module.exports = router;