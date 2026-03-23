import { Router } from 'express';
import {
  createRide,
  getRides,
  getRideById,
  updateRide,
  bookRide,
  cancelRide,
} from '../controllers/rideController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { UserType } from '../types/index.js';

const router = Router();

// Public routes
router.get('/', getRides);
router.get('/:id', getRideById);

// Protected routes
router.use(protect);

// Driver routes
router.post('/', restrictTo(UserType.DRIVER), createRide);
router.patch('/:id', restrictTo(UserType.DRIVER), updateRide);
router.delete('/:id', restrictTo(UserType.DRIVER), cancelRide);

// Rider routes
router.post('/:id/book', restrictTo(UserType.RIDER), bookRide);

export default router;
