'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Rides', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      driverId: {
        type: Sequelize.INTEGER
      },
      riderId: {
        type: Sequelize.INTEGER
      },
      pickup: {
        type: Sequelize.STRING
      },
      dropoff: {
        type: Sequelize.STRING
      },
      departureTime: {
        type: Sequelize.STRING
      },
      departureDate: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('available', 'booked', 'completed')
      },
      fare: {
        type: Sequelize.FLOAT
      },
      vehicle: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Rides');
  }
};