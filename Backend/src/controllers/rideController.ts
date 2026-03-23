import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import db from '../config/sequelize.js';
import { AppError } from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { validateSchema, createRideSchema, bookRideSchema } from '../utils/validators.js';
import { RideStatus } from '../types/index.js';

export const createRide = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  const validatedData = validateSchema(createRideSchema)(req.body);

  const ride = await db.Ride.create({
    driverId: req.user.id,
    ...validatedData,
    status: RideStatus.AVAILABLE,
  });

  res.status(201).json({
    status: 'success',
    message: 'Ride created successfully',
    data: { ride },
  });
});

export const getRides = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { page = 1, limit = 10, status, fromDate, toDate } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const where: any = {};
  
  if (status) {
    where.status = status;
  }

  if (fromDate || toDate) {
    where.departureDate = {};
    if (fromDate) where.departureDate[Op.gte] = fromDate;
    if (toDate) where.departureDate[Op.lte] = toDate;
  }

  const { count, rows: rides } = await db.Ride.findAndCountAll({
    where,
    include: [
      { model: db.User, as: 'driver', attributes: ['id', 'firstName', 'lastName', 'rating'] },
      { model: db.User, as: 'rider', attributes: ['id', 'firstName', 'lastName'] },
    ],
    offset,
    limit: Number(limit),
    order: [['departureDate', 'ASC'], ['departureTime', 'ASC']],
  });

  res.status(200).json({
    status: 'success',
    count,
    page: Number(page),
    limit: Number(limit),
    data: { rides },
  });
});

export const getRideById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const ride = await db.Ride.findByPk(id, {
    include: [
      { model: db.User, as: 'driver', attributes: ['id', 'firstName', 'lastName', 'rating', 'phone'] },
      { model: db.User, as: 'rider', attributes: ['id', 'firstName', 'lastName'] },
      { model: db.Review, include: [{ model: db.User, as: 'fromUser', attributes: ['firstName', 'lastName'] }] },
    ],
  });

  if (!ride) {
    return next(new AppError('Ride not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { ride },
  });
});

export const updateRide = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  const { id } = req.params;
  const ride = await db.Ride.findByPk(id);

  if (!ride) {
    return next(new AppError('Ride not found', 404));
  }

  if (ride.driverId !== req.user.id) {
    return next(new AppError('You are not authorized to update this ride', 403));
  }

  const updatedRide = await ride.update(req.body);

  res.status(200).json({
    status: 'success',
    message: 'Ride updated successfully',
    data: { ride: updatedRide },
  });
});

export const bookRide = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  const { id: rideId } = req.params;
  const validatedData = validateSchema(bookRideSchema)(req.body);
  const ride = await db.Ride.findByPk(rideId);

  if (!ride) {
    return next(new AppError('Ride not found', 404));
  }

  if (ride.status === 'cancelled') {
    return next(new AppError('This ride has been cancelled', 400));
  }

  const seatsAvailable = ride.availableSeats - ride.bookedSeats;
  
  if (validatedData.seatsToBook > seatsAvailable) {
    return next(new AppError(`Only ${seatsAvailable} seats available`, 400));
  }

  // Update ride with rider info
  ride.riderId = req.user.id;
  ride.bookedSeats += validatedData.seatsToBook;
  
  if (ride.bookedSeats >= ride.availableSeats) {
    ride.status = RideStatus.BOOKED;
  }

  await ride.save();

  res.status(200).json({
    status: 'success',
    message: 'Ride booked successfully',
    data: { ride },
  });
});

export const cancelRide = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  const { id } = req.params;
  const ride = await db.Ride.findByPk(id);

  if (!ride) {
    return next(new AppError('Ride not found', 404));
  }

  if (ride.driverId !== req.user.id) {
    return next(new AppError('Only the driver can cancel the ride', 403));
  }

  ride.status = RideStatus.CANCELLED;
  await ride.save();

  res.status(200).json({
    status: 'success',
    message: 'Ride cancelled successfully',
    data: { ride },
  });
});
