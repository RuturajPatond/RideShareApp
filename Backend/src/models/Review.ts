import { Sequelize, DataTypes, Model } from 'sequelize';

interface IReview {
  id: string;
  fromUserId: string;
  toUserId: string;
  rideId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

class Review extends Model<IReview> implements IReview {
  declare id: string;
  declare fromUserId: string;
  declare toUserId: string;
  declare rideId: string;
  declare rating: number;
  declare comment?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initialize(sequelize: Sequelize): typeof Review {
    Review.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        fromUserId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        toUserId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        rideId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'rides',
            key: 'id',
          },
        },
        rating: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 1,
            max: 5,
          },
        },
        comment: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'Review',
        tableName: 'reviews',
        timestamps: true,
      }
    );

    return Review;
  }
}

export default Review;
