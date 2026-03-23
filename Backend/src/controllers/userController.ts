import { Request, Response, NextFunction } from 'express';
import db from '../config/sequelize.js';
import { AppError } from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { validateSchema, updateProfileSchema } from '../utils/validators.js';

// User Profile
export const getProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  const user = await db.User.findByPk(req.user.id, {
    include: [
      { model: db.Vehicle },
      { model: db.Review, as: 'reviewsReceived', include: [{ model: db.User, as: 'fromUser', attributes: ['firstName', 'lastName'] }] },
    ],
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  const validatedData = validateSchema(updateProfileSchema)(req.body);

  const user = await db.User.findByPk(req.user.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  await user.update(validatedData);

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: { user },
  });
});

// Vehicle Management
export const addVehicle = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  const { make, model, year, licensePlate, color, registrationNumber, seatingCapacity } = req.body;

  if (!make || !model || !year || !licensePlate || !color || !registrationNumber) {
    return next(new AppError('Please provide all required vehicle details', 400));
  }

  const vehicle = await db.Vehicle.create({
    driverId: req.user.id,
    make,
    model,
    year,
    licensePlate,
    color,
    registrationNumber,
    seatingCapacity: seatingCapacity || 4,
  });

  res.status(201).json({
    status: 'success',
    message: 'Vehicle added successfully',
    data: { vehicle },
  });
});

export const getVehicles = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  const vehicles = await db.Vehicle.findAll({
    where: { driverId: req.user.id },
  });

  res.status(200).json({
    status: 'success',
    count: vehicles.length,
    data: { vehicles },
  });
});

export const updateVehicle = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  const { vehicleId } = req.params;
  const vehicle = await db.Vehicle.findByPk(vehicleId);

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  if (vehicle.driverId !== req.user.id) {
    return next(new AppError('Not authorized to update this vehicle', 403));
  }

  const updatedVehicle = await vehicle.update(req.body);

  res.status(200).json({
    status: 'success',
    message: 'Vehicle updated successfully',
    data: { vehicle: updatedVehicle },
  });
});

export const deleteVehicle = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  const { vehicleId } = req.params;
  const vehicle = await db.Vehicle.findByPk(vehicleId);

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  if (vehicle.driverId !== req.user.id) {
    return next(new AppError('Not authorized to delete this vehicle', 403));
  }

  await vehicle.destroy();

  res.status(204).send();
});

// Reviews
export const addReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  const { toUserId, rideId, rating, comment } = req.body;

  if (!toUserId || !rideId || !rating) {
    return next(new AppError('Please provide toUserId, rideId, and rating', 400));
  }

  if (rating < 1 || rating > 5) {
    return next(new AppError('Rating must be between 1 and 5', 400));
  }

  const review = await db.Review.create({
    fromUserId: req.user.id,
    toUserId,
    rideId,
    rating,
    comment,
  });

  res.status(201).json({
    status: 'success',
    message: 'Review added successfully',
    data: { review },
  });
});

export const getUserReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  const reviews = await db.Review.findAll({
    where: { toUserId: userId },
    include: [{ model: db.User, as: 'fromUser', attributes: ['firstName', 'lastName', 'profilePicture'] }],
  });

  const averageRating =
    reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;

  res.status(200).json({
    status: 'success',
    count: reviews.length,
    averageRating,
    data: { reviews },
  });
});
