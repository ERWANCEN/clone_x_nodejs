const express = require('express');
const router = express.Router();

// IMPORTATION DU CONTROLLER
const UserController = require('../controllers/user.controller');

router.get('/all', UserController.getAll);
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.delete('/delete/:id', UserController.deleteUser);
router.put('/update/:id', UserController.updateUser);

module.exports = router;