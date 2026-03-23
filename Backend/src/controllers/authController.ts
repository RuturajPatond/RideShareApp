import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../config/sequelize.js';
import { AppError } from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { validateSchema, signupSchema, loginSchema } from '../utils/validators.js';
import { UserType } from '../types/index.js';

const getJwtSecret = (): string =>
  process.env.JWT_SECRET ||
  process.env.JSON_SECRET_KEY ||
  'your_jwt_secret_key_here_change_in_production';

const getJwtExpiry = (): string =>
  process.env.JWT_EXPIRY ||
  process.env.JSON_EXPIRY ||
  '7d';

const generateToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
    getJwtSecret(),
    { expiresIn: getJwtExpiry() }
  );
};

export const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const validatedData = validateSchema(signupSchema)(req.body);

  // Check if user already exists
  const existingUser = await db.User.findOne({ where: { email: validatedData.email } });
  if (existingUser) {
    return next(new AppError('Email already in use', 400));
  }

  // Create user
  const user = await db.User.create({
    firstName: validatedData.firstName,
    lastName: validatedData.lastName,
    email: validatedData.email,
    password: validatedData.password,
    userType: validatedData.userType as UserType,
    phone: validatedData.phone,
  });

  const token = generateToken(user.id);

  res.status(201).json({
    status: 'success',
    message: 'User created successfully',
    data: {
      user: user.toJSON(),
      token,
    },
  });
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const validatedData = validateSchema(loginSchema)(req.body);

  // Find user with password
  const user = await db.User.scope('withPassword').findOne({
    where: { email: validatedData.email },
  });

  if (!user || !(await user.comparePassword(validatedData.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = generateToken(user.id);

  res.status(200).json({
    status: 'success',
    message: 'Logged in successfully',
    data: {
      user: user.toJSON(),
      token,
    },
  });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

export const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  const user = await db.User.findByPk(req.user.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});
