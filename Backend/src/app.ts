import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';
import { QueryTypes } from 'sequelize';

import db from './config/sequelize.js';
import { AppError } from './utils/appError.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

// Import routes
import authRoute from './routes/authRoute.js';
import rideRoute from './routes/rideRoute.js';
import userRoute from './routes/userRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const app: Application = express();
const NODE_ENV = process.env.NODE_ENV || 'development';

const parseOrigins = (origins?: string): string[] => {
  if (!origins) return [];
  return origins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const defaultDevOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://localhost:19006',
  'http://127.0.0.1:19006',
];

const configuredOrigins = parseOrigins(process.env.FRONTEND_URL);
const allowedOrigins = configuredOrigins.length > 0 ? configuredOrigins : defaultDevOrigins;

const findAvailablePort = async (startingPort: number, maxAttempts = 20): Promise<number> => {
  const isPortAvailable = (port: number): Promise<boolean> =>
    new Promise((resolve) => {
      const probe = net.createServer();

      probe.once('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          resolve(false);
          return;
        }

        resolve(false);
      });

      probe.once('listening', () => {
        probe.close(() => resolve(true));
      });

      probe.listen(port);
    });

  for (let offset = 0; offset < maxAttempts; offset += 1) {
    const candidatePort = startingPort + offset;
    const available = await isPortAvailable(candidatePort);

    if (available) {
      return candidatePort;
    }
  }

  throw new AppError(`Unable to find an open port starting from ${startingPort}`, 500);
};

// ============= SECURITY MIDDLEWARE =============
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new AppError(`CORS blocked for origin: ${origin}`, 403));
    },
    credentials: true,
  })
);

// ============= BODY PARSER MIDDLEWARE =============
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============= REQUEST LOGGING =============
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));

// ============= HEALTH CHECK =============
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============= API ROUTES =============
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/rides', rideRoute);
app.use('/api/v1/users', userRoute);

// ============= 404 HANDLER =============
app.use('*', (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// ============= GLOBAL ERROR HANDLER =============
app.use(errorHandler);

// ============= DATABASE CONNECTION & SERVER START =============
const APP_PORT = Number(process.env.APP_PORT) || 3000;

const normalizeTableName = (table: unknown): string => {
  if (typeof table === 'string') return table;

  if (table && typeof table === 'object') {
    const maybeTable = (table as { tableName?: string }).tableName;
    if (typeof maybeTable === 'string') return maybeTable;
  }

  return '';
};

const migrateLegacyUsersIfNeeded = async () => {
  const queryInterface = db.sequelize.getQueryInterface();
  const tables = (await queryInterface.showAllTables()).map((table) => normalizeTableName(table));
  const hasUsersTable = tables.includes('users');
  const hasLegacyUserTable = tables.includes('user');

  if (!hasUsersTable || !hasLegacyUserTable) {
    return;
  }

  const usersCountResult = (await db.sequelize.query('SELECT COUNT(*)::int AS count FROM "users"', {
    type: QueryTypes.SELECT,
  })) as Array<{ count: number }>;

  if ((usersCountResult[0]?.count || 0) > 0) {
    return;
  }

  const legacyRows = (await db.sequelize.query(
    'SELECT "id", "firstName", "lastName", "email", "password", "userType", "createdAt", "updatedAt", "deletedAt" FROM "user" WHERE "deletedAt" IS NULL',
    { type: QueryTypes.SELECT }
  )) as Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    userType: string;
    createdAt: Date;
    updatedAt: Date;
  }>;

  if (legacyRows.length === 0) {
    return;
  }

  await db.User.bulkCreate(
    legacyRows.map((row) => ({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      password: row.password,
      userType: row.userType === '0' ? '1' : row.userType,
      phone: null,
      profilePicture: null,
      isVerified: false,
      rating: 5,
      totalRides: 0,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })),
    { hooks: false }
  );

  logger.info(`✅ Migrated ${legacyRows.length} legacy users from user -> users table`);
};

const start = async () => {
  try {
    // Sync database
    await db.sequelize.authenticate();
    logger.info(`✅ Database connected successfully on ${NODE_ENV} environment`);

    // Keep development databases aligned with TypeScript models.
    if (NODE_ENV !== 'production') {
      // Use non-alter sync to avoid brittle enum migration SQL on legacy schemas.
      await db.sequelize.sync();
      await migrateLegacyUsersIfNeeded();
      logger.info('✅ Database schema synchronized for development');
    }

    const activePort = await findAvailablePort(APP_PORT);

    if (activePort !== APP_PORT) {
      logger.warn(`⚠️ Port ${APP_PORT} is in use. Falling back to ${activePort}`);
    }

    app.listen(activePort, '0.0.0.0', () => {
      logger.info(`🚀 Server is running on 0.0.0.0:${activePort}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  logger.error('UNHANDLED REJECTION 💥', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('UNCAUGHT EXCEPTION 💥', error);
  process.exit(1);
});

start();

export default app;
