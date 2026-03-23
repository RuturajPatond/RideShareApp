import { Sequelize, DataTypes, Model } from 'sequelize';
import dbConfig from './database.js';
import User from '../models/User.js';
import Ride from '../models/Ride.js';
import Vehicle from '../models/Vehicle.js';
import Review from '../models/Review.js';

const env = (process.env.NODE_ENV || 'development') as 'development' | 'test' | 'production';
const config = dbConfig[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const db = {
  sequelize,
  Sequelize,
  User: User.initialize(sequelize),
  Ride: Ride.initialize(sequelize),
  Vehicle: Vehicle.initialize(sequelize),
  Review: Review.initialize(sequelize),
};

// Setup associations
db.User.hasMany(db.Ride, { foreignKey: 'driverId', as: 'ridesAsDriver' });
db.User.hasMany(db.Ride, { foreignKey: 'riderId', as: 'ridesAsRider' });
db.User.hasMany(db.Vehicle, { foreignKey: 'driverId' });
db.User.hasMany(db.Review, { foreignKey: 'fromUserId', as: 'reviewsGiven' });
db.User.hasMany(db.Review, { foreignKey: 'toUserId', as: 'reviewsReceived' });

db.Ride.belongsTo(db.User, { foreignKey: 'driverId', as: 'driver' });
db.Ride.belongsTo(db.User, { foreignKey: 'riderId', as: 'rider' });
db.Ride.hasMany(db.Review, { foreignKey: 'rideId' });

db.Vehicle.belongsTo(db.User, { foreignKey: 'driverId' });

db.Review.belongsTo(db.User, { foreignKey: 'fromUserId', as: 'fromUser' });
db.Review.belongsTo(db.User, { foreignKey: 'toUserId', as: 'toUser' });
db.Review.belongsTo(db.Ride, { foreignKey: 'rideId' });

export default db;
