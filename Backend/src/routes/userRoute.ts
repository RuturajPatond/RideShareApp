import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  addVehicle,
  getVehicles,
  updateVehicle,
  deleteVehicle,
  addReview,
  getUserReviews,
} from '../controllers/userController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { UserType } from '../types/index.js';

const router = Router();

// Protected routes - All users
router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

// User reviews
router.get('/:userId/reviews', getUserReviews);
router.post('/reviews', addReview);

// Vehicle routes - Drivers only
router.post('/vehicles', restrictTo(UserType.DRIVER), addVehicle);
router.get('/vehicles', restrictTo(UserType.DRIVER), getVehicles);
router.patch('/vehicles/:vehicleId', restrictTo(UserType.DRIVER), updateVehicle);
router.delete('/vehicles/:vehicleId', restrictTo(UserType.DRIVER), deleteVehicle);

export default router;
