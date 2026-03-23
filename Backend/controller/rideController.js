const { Ride } = require('../db/models');

exports.createRide = async (req, res) => {
  try {
    const {pickup, dropoff, departureTime, departureDate, fare, vehicle, seats } = req.body;
    const driverId = req.user.id;
    
    const ride = await Ride.create({
      driverId, 
      pickup, 
      dropoff, 
      departureTime, 
      departureDate, 
      fare,
      vehicle: vehicle || null,
      seats: seats || 1  // Default to 1 if not provided
    });
    
    res.status(201).json({ 
      status: 'success',  // Changed from 'success: true'
      message: 'Ride published successfully', 
      ride 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      status: 'error',  // Changed from 'success: false'
      message: error.message 
    });
  }
};

exports.getAvailableRides = async (req, res) => {
  try {
    const rides = await Ride.findAll({ where: { status: 'available' } });
    res.json({ success: true, rides });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bookRide = async (req, res) => {
  try {
    const { rideId, riderId } = req.body;
    const ride = await Ride.findByPk(rideId);

    if (!ride || ride.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Ride not available' });
    }

    // Optional: Use transaction for safety in production
    ride.status = 'booked';
    ride.riderId = riderId;
    await ride.save();

    res.json({ success: true, message: 'Ride booked successfully', ride });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
