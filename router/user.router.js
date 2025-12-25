const express = require('express');
const router = express.Router();

// IMPORTATION DU CONTROLLER
const UserController = require('../controllers/user.controller');
const verifyToken = require('../middlewares/auth');

router.get('/all', verifyToken, UserController.getAll);
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.delete('/delete/:id', verifyToken, UserController.deleteUser);
router.put('/update/:id', verifyToken, UserController.updateUser);

module.exports = router;