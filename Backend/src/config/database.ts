import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

interface DatabaseConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: 'postgres' | 'mysql' | 'sqlite' | 'mariadb';
  seederStorage: string;
  logging: boolean;
}

interface AllConfigs {
  development: DatabaseConfig;
  test: DatabaseConfig;
  production: DatabaseConfig;
}

const dbConfig: AllConfigs = {
  development: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'yatri_db',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    seederStorage: 'sequelize',
    logging: process.env.NODE_ENV === 'development',
  },

  test: {
    username: 'postgres',
    password: 'postgres',
    database: 'yatri_db_test',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    seederStorage: 'sequelize',
    logging: false,
  },

  production: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'yatri_db',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    seederStorage: 'sequelize',
    logging: false,
  },
};

export default dbConfig;
