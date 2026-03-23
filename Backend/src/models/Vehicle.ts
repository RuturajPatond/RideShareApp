import { Sequelize, DataTypes, Model } from 'sequelize';
import { IVehicle } from '../types/index.js';

class Vehicle extends Model<IVehicle> implements IVehicle {
  declare id: string;
  declare driverId: string;
  declare make: string;
  declare model: string;
  declare year: number;
  declare licensePlate: string;
  declare color: string;
  declare registrationNumber: string;
  declare seatingCapacity: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initialize(sequelize: Sequelize): typeof Vehicle {
    Vehicle.init(
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
        make: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        model: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        year: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 1900,
            max: new Date().getFullYear() + 1,
          },
        },
        licensePlate: {
          type: DataTypes.STRING(20),
          allowNull: false,
          unique: true,
        },
        color: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        registrationNumber: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
        },
        seatingCapacity: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 4,
          validate: {
            min: 1,
            max: 7,
          },
        },
      },
      {
        sequelize,
        modelName: 'Vehicle',
        tableName: 'vehicles',
        timestamps: true,
      }
    );

    return Vehicle;
  }
}

export default Vehicle;
