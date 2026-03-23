export enum UserType {
  DRIVER = '1',
  RIDER = '2',
}

export enum RideStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  profilePicture?: string;
  userType: UserType;
  isVerified: boolean;
  rating?: number;
  totalRides: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface IRide {
  id: string;
  driverId: string;
  riderId?: string;
  pickup: string;
  pickupLat: number;
  pickupLng: number;
  dropoff: string;
  dropoffLat: number;
  dropoffLng: number;
  departureDate: string;
  departureTime: string;
  fare: number;
  availableSeats: number;
  bookedSeats: number;
  status: RideStatus;
  vehicleInfo: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVehicle {
  id: string;
  driverId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  registrationNumber: string;
  seatingCapacity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    user: Partial<IUser>;
    token: string;
  };
}

export interface JWTPayload {
  id: string;
  email: string;
  userType: UserType;
}
