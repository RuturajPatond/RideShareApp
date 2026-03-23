import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';

interface ErrorWithStatus extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

const sendErrorDev = (err: ErrorWithStatus, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err: ErrorWithStatus, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: 'error',
      message: err.message,
    });
  } else {
    logger.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong! Please try again later.',
    });
  }
};

export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    // Create a copy to avoid mutation
    let error = { ...err };
    error.message = err.message;

    // Handle Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
      const message = Object.values((err as any).errors)
        .map((e: any) => e.message)
        .join(', ');
      error = new AppError(message, 400);
    }

    // Handle Sequelize unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
      const field = Object.keys((err as any).fields || {})[0];
      const message = `${field} already exists`;
      error = new AppError(message, 400);
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
      error = new AppError('Invalid token', 401);
    }

    if (err.name === 'TokenExpiredError') {
      error = new AppError('Token expired', 401);
    }

    sendErrorProd(error, res);
  }
};
