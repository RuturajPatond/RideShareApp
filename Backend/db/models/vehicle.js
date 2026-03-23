const { Model, DataTypes } = require('sequelize');

class Vehicle extends Model {
  static associate(models) {
    // Make sure the model name matches exactly what's in index.js
    Vehicle.belongsTo(models.User, { foreignKey: 'userId', as: 'owner' });
  }
}

// Define fields for initialization
Vehicle.fields = {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notNull: true, notEmpty: true },
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notNull: true, notEmpty: true },
  },
  plate: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { notNull: true, notEmpty: true },
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notNull: true, notEmpty: true },
  },
  createdAt: { type: DataTypes.DATE, allowNull: false },
  updatedAt: { type: DataTypes.DATE, allowNull: false },
  deletedAt: { type: DataTypes.DATE, allowNull: true },
};

module.exports = Vehicle;
