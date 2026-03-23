const express = require('express');
const router = express.Router();
const rideController = require('../controller/rideController.js');
const { protect } = require('../utils/protect.js');

// Publish a ride
router.post('/publish', protect, rideController.createRide); 

// Get all available rides
router.get('/available', rideController.getAvailableRides);

// Book a ride
router.post('/book', rideController.bookRide);

module.exports = router;
