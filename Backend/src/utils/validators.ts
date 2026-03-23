import Joi from 'joi';
import { AppError } from './appError.js';

export const validateSchema = (schema: Joi.ObjectSchema) => {
  return (data: any) => {
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message).join(', ');
      throw new AppError(messages, 400);
    }

    return value;
  };
};

// Auth Schemas
export const signupSchema = Joi.object({
  firstName: Joi.string().required().trim(),
  lastName: Joi.string().required().trim(),
  email: Joi.string().email().required().lowercase(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  userType: Joi.string().valid('1', '2').required(),
  phone: Joi.string().optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().lowercase(),
  password: Joi.string().required(),
});

// Ride Schemas
export const createRideSchema = Joi.object({
  pickup: Joi.string().required(),
  pickupLat: Joi.number().required(),
  pickupLng: Joi.number().required(),
  dropoff: Joi.string().required(),
  dropoffLat: Joi.number().required(),
  dropoffLng: Joi.number().required(),
  departureDate: Joi.string().required().pattern(/^\d{4}-\d{2}-\d{2}$/),
  departureTime: Joi.string().required().pattern(/^\d{2}:\d{2}$/),
  fare: Joi.number().positive().required(),
  availableSeats: Joi.number().min(1).max(7).required(),
  vehicleInfo: Joi.string().required(),
  notes: Joi.string().optional(),
});

export const bookRideSchema = Joi.object({
  seatsToBook: Joi.number().min(1).required(),
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  phone: Joi.string().optional(),
  profilePicture: Joi.string().optional(),
});
