import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../services/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  userType: '1' | '2';
  isVerified: boolean;
  rating?: number;
  totalRides: number;
  createdAt: string;
}

export interface AuthState {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isBootstrapping: true,
};

// Async thunks
export const signup = createAsyncThunk('auth/signup', async (payload: any, { rejectWithValue }) => {
  try {
    const response = await apiClient.signup(payload);
    const { user, token } = response.data.data;
    await AsyncStorage.setItem('token', token);
    apiClient.setToken(token);
    return { user, token };
  } catch (error: any) {
    if (!error.response) {
      return rejectWithValue('Cannot reach backend API. Check EXPO_PUBLIC_API_URL and backend server status.');
    }

    return rejectWithValue(error.response?.data?.message || 'Signup failed');
  }
});

export const login = createAsyncThunk('auth/login', async (credentials: { email: string; password: string }, { rejectWithValue }) => {
  try {
    const response = await apiClient.login(credentials);
    const { user, token } = response.data.data;
    await AsyncStorage.setItem('token', token);
    apiClient.setToken(token);
    return { user, token };
  } catch (error: any) {
    if (!error.response) {
      return rejectWithValue('Cannot reach backend API. Check EXPO_PUBLIC_API_URL and backend server status.');
    }

    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await apiClient.logout();
    await AsyncStorage.removeItem('token');
    apiClient.clearToken();
    return null;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Logout failed');
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.getMe();
    return response.data.data.user;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
  }
});

export const restoreToken = createAsyncThunk('auth/restoreToken', async (_, { rejectWithValue }) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      apiClient.setToken(token);
      const response = await apiClient.getMe();
      return { user: response.data.data.user, token };
    }
    return null;
  } catch (error: any) {
    if (!error.response) {
      return rejectWithValue('Cannot reach backend API. Check EXPO_PUBLIC_API_URL and backend server status.');
    }

    return rejectWithValue(error.response?.data?.message || 'Token restoration failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Signup
    builder
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });

    // Get Me
    builder
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getMe.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      });

    // Restore Token
    builder
      .addCase(restoreToken.pending, (state) => {
        state.isBootstrapping = true;
      })
      .addCase(restoreToken.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
        state.isBootstrapping = false;
      })
      .addCase(restoreToken.rejected, (state) => {
        state.isBootstrapping = false;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
