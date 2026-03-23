const express = require('express');
const router = express.Router();
const userController = require('../controller/userController.js');

// Get user profile
router.get('/:id', userController.getUserProfile);

// Get all rides by a user
router.get('/:id/rides', userController.getUserRides);

module.exports = router;