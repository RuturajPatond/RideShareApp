const { Model, DataTypes } = require('sequelize');

class Ride extends Model {
  static associate(models) {
    Ride.belongsTo(models.User, { foreignKey: 'driverId', as: 'driver' });
    Ride.belongsTo(models.User, { foreignKey: 'riderId', as: 'rider' });
  }
}

// Define fields for initialization
Ride.fields = {
  driverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    reference: {
      model: 'Users',
      key: 'id',
    },
  },
  pickup: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dropoff: {
    type: DataTypes.STRING,
    allowNull: false
  },
  departureDate : {
    type: DataTypes.STRING,
    allowNull: false
  },
  departureTime: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fare: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  vehicle: {
    type: DataTypes.STRING,
    defaultValue: 'available'
  },
  seats: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1  // Default to 1 seat
    },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'available'
  },
  riderId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
};

module.exports = Ride;
