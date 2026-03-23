import { Sequelize, DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import { IUser, UserType } from '../types/index.js';

class User extends Model<IUser> implements IUser {
  declare id: string;
  declare firstName: string;
  declare lastName: string;
  declare email: string;
  declare password: string;
  declare phone?: string;
  declare profilePicture?: string;
  declare userType: UserType;
  declare isVerified: boolean;
  declare rating?: number;
  declare totalRides: number;
  declare deletedAt?: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initialize(sequelize: Sequelize): typeof User {
    User.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        firstName: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        lastName: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        phone: {
          type: DataTypes.STRING(15),
          allowNull: true,
        },
        profilePicture: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        userType: {
          type: DataTypes.ENUM('1', '2'),
          allowNull: false,
          comment: "1 = Driver, 2 = Rider",
        },
        isVerified: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        rating: {
          type: DataTypes.DECIMAL(2, 1),
          defaultValue: 5.0,
          validate: {
            min: 1,
            max: 5,
          },
        },
        totalRides: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        paranoid: true,
        defaultScope: {
          attributes: { exclude: ['password'] },
        },
        scopes: {
          withPassword: {
            attributes: { include: ['password'] },
          },
        },
      }
    );

    User.beforeCreate(async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    });

    return User;
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  toJSON(): Partial<IUser> {
    const { password, ...rest } = this.get();
    return rest;
  }
}

export default User;
