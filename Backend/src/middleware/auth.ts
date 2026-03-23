import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError.js';
import { JWTPayload } from '../types/index.js';

const getJwtSecret = (): string =>
  process.env.JWT_SECRET ||
  process.env.JSON_SECRET_KEY ||
  'your_jwt_secret_key_here_change_in_production';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    const decoded = jwt.verify(token, getJwtSecret()) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Not authorized to access this route';
    next(new AppError(message, 401));
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.userType)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
