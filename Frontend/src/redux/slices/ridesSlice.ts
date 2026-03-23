import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../services/apiClient';

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
  status: 'available' | 'booked' | 'completed' | 'cancelled';
  vehicleInfo: string;
  notes?: string;
  createdAt: string;
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    rating?: number;
  };
}

export interface RidesState {
  rides: IRide[];
  currentRide: IRide | null;
  isLoading: boolean;
  error: string | null;
  totalRides: number;
  page: number;
  hasMore: boolean;
}

const initialState: RidesState = {
  rides: [],
  currentRide: null,
  isLoading: false,
  error: null,
  totalRides: 0,
  page: 1,
  hasMore: true,
};

// Async thunks
export const fetchRides = createAsyncThunk('rides/fetchRides', async (params: { page?: number; limit?: number; status?: string; fromDate?: string; toDate?: string }, { rejectWithValue }) => {
  try {
    const response = await apiClient.getRides(params);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch rides');
  }
});

export const fetchRideById = createAsyncThunk('rides/fetchRideById', async (id: string, { rejectWithValue }) => {
  try {
    const response = await apiClient.getRideById(id);
    return response.data.data.ride;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch ride');
  }
});

export const createRide = createAsyncThunk('rides/createRide', async (rideData: any, { rejectWithValue }) => {
  try {
    const response = await apiClient.createRide(rideData);
    return response.data.data.ride;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create ride');
  }
});

export const bookRide = createAsyncThunk('rides/bookRide', async (payload: { rideId: string; seatsToBook: number }, { rejectWithValue }) => {
  try {
    const response = await apiClient.bookRide(payload.rideId, payload.seatsToBook);
    return response.data.data.ride;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to book ride');
  }
});

export const cancelRide = createAsyncThunk('rides/cancelRide', async (id: string, { rejectWithValue }) => {
  try {
    const response = await apiClient.cancelRide(id);
    return response.data.data.ride;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to cancel ride');
  }
});

const ridesSlice = createSlice({
  name: 'rides',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentRide: (state) => {
      state.currentRide = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Rides
    builder
      .addCase(fetchRides.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRides.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rides = action.payload.data.rides;
        state.totalRides = action.payload.count;
        state.page = action.payload.page;
        state.hasMore = action.payload.count > state.rides.length;
      })
      .addCase(fetchRides.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Ride By ID
    builder
      .addCase(fetchRideById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRideById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRide = action.payload;
      })
      .addCase(fetchRideById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Ride
    builder
      .addCase(createRide.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRide.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rides.unshift(action.payload);
      })
      .addCase(createRide.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Book Ride
    builder
      .addCase(bookRide.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(bookRide.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.rides.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.rides[index] = action.payload;
        }
        if (state.currentRide?.id === action.payload.id) {
          state.currentRide = action.payload;
        }
      })
      .addCase(bookRide.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Cancel Ride
    builder
      .addCase(cancelRide.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelRide.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.rides.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.rides[index] = action.payload;
        }
      })
      .addCase(cancelRide.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentRide } = ridesSlice.actions;
export default ridesSlice.reducer;
