import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export default {
  up: (queryInterface, Sequelize) => {
    const password = 'admin@1234';
    const hashedPassword = bcrypt.hashSync(password, 10);
    return queryInterface.bulkInsert('users', [
      {
        id: randomUUID(),
        userType: '1',
        firstName: 'Ruturaj', 
        lastName: 'Patond',
        email: 'admin@gmail.com',
        password: hashedPassword,
        phone: null,
        profilePicture: null,
        isVerified: false,
        rating: 5,
        totalRides: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', { email: 'admin@gmail.com' }, {});
  },
};