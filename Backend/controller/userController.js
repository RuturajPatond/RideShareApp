const { User,Ride }  = require('../db/models');
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: ['id', 'firstName', 'lastName', 'email'] });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserRides = async (req, res) => {
  try {
    const rides = await Ride.findAll({ where: { driverId: req.params.id } });
    res.json({ success: true, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
