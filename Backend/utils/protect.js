// In utils/protect.js
const jwt = require('jsonwebtoken');
const { User } = require('../db/models');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    
    if (!user) return res.status(401).json({ message: 'User no longer exists' });

    req.user = user;  // 🔥 attach user to the request

    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token or token expired' });
  }
};
