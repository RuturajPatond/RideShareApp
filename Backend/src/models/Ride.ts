import { Sequelize, DataTypes, Model } from 'sequelize';
import { IRide, RideStatus } from '../types/index.js';

class Ride extends Model<IRide> implements IRide {
  declare id: string;
  declare driverId: string;
  declare riderId?: string;
  declare pickup: string;
  declare pickupLat: number;
  declare pickupLng: number;
  declare dropoff: string;
  declare dropoffLat: number;
  declare dropoffLng: number;
  declare departureDate: string;
  declare departureTime: string;
  declare fare: number;
  declare availableSeats: number;
  declare bookedSeats: number;
  declare status: RideStatus;
  declare vehicleInfo: string;
  declare notes?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initialize(sequelize: Sequelize): typeof Ride {
    Ride.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        driverId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        riderId: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        pickup: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        pickupLat: {
          type: DataTypes.DECIMAL(10, 8),
          allowNull: false,
        },
        pickupLng: {
          type: DataTypes.DECIMAL(11, 8),
          allowNull: false,
        },
        dropoff: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        dropoffLat: {
          type: DataTypes.DECIMAL(10, 8),
          allowNull: false,
        },
        dropoffLng: {
          type: DataTypes.DECIMAL(11, 8),
          allowNull: false,
        },
        departureDate: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        departureTime: {
          type: DataTypes.TIME,
          allowNull: false,
        },
        fare: {
          type: DataTypes.DECIMAL(8, 2),
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        availableSeats: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
          validate: {
            min: 1,
            max: 7,
          },
        },
        bookedSeats: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        status: {
          type: DataTypes.ENUM('available', 'booked', 'completed', 'cancelled'),
          allowNull: false,
          defaultValue: 'available',
        },
        vehicleInfo: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'Ride',
        tableName: 'rides',
        timestamps: true,
      }
    );

    return Ride;
  }
}

export default Ride;
