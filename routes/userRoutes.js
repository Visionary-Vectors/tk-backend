const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/create_user', userController.createUser);
router.post('/login', userController.loginUser);


module.exports = router;
