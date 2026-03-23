import axios, { AxiosInstance } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const unique = (items: string[]): string[] => Array.from(new Set(items));

const getExpoDevServerHosts = (): string[] => {
  const candidates: string[] = [];

  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any)?.manifest?.debuggerHost ||
    (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri;

  if (typeof hostUri === 'string' && hostUri.trim().length > 0) {
    candidates.push(hostUri.split(':')[0]);
  }

  return unique(candidates.filter(Boolean));
};

const withAndroidHostVariants = (url: string): string[] => {
  if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
    return [url];
  }

  const variants: string[] = [];
  const expoDevHosts = getExpoDevServerHosts();

  for (const host of expoDevHosts) {
    variants.push(url.replace('localhost', host).replace('127.0.0.1', host));
  }

  const localhostToAndroid = url.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');

  if (Platform.OS === 'android') {
    variants.unshift(localhostToAndroid);
    variants.push(url);
    return unique(variants);
  }

  variants.unshift(url);
  return unique(variants);
};

const withPortFallbacks = (url: string): string[] => {
  try {
    const parsed = new URL(url);

    // Mirror backend behavior where APP_PORT can fallback to the next available ports.
    if (!parsed.port) {
      return [url];
    }

    const basePort = Number(parsed.port);
    if (!Number.isFinite(basePort)) {
      return [url];
    }

    const candidates = [url];

    for (let offset = 1; offset <= 3; offset += 1) {
      const next = new URL(url);
      next.port = String(basePort + offset);
      candidates.push(next.toString().replace(/\/$/, ''));
    }

    return candidates;
  } catch {
    return [url];
  }
};

const getApiBaseUrls = (): string[] => {
  const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (configuredBaseUrl) {
    return withPortFallbacks(configuredBaseUrl).flatMap((url) => withAndroidHostVariants(url));
  }

  const defaults = [
    'http://localhost:3001/api/v1',
    'http://localhost:3002/api/v1',
    'http://localhost:3000/api/v1',
  ];

  return defaults.flatMap((url) => withAndroidHostVariants(url));
};

const API_BASE_URLS = unique(getApiBaseUrls());

type RetriableRequest = {
  _fallbackAttemptCount?: number;
};

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;
  private activeBaseUrlIndex = 0;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URLS[this.activeBaseUrlIndex],
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Add response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as RetriableRequest | undefined;
        const attemptCount = originalRequest?._fallbackAttemptCount || 0;

        if (
          !error.response &&
          originalRequest &&
          this.activeBaseUrlIndex < API_BASE_URLS.length - 1 &&
          attemptCount < API_BASE_URLS.length - 1
        ) {
          this.activeBaseUrlIndex += 1;
          this.client.defaults.baseURL = API_BASE_URLS[this.activeBaseUrlIndex];
          originalRequest._fallbackAttemptCount = attemptCount + 1;
          return this.client(originalRequest as any);
        }

        if (error.response?.status === 401) {
          // Handle unauthorized error
          this.clearToken();
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string): void {
    this.token = token;
  }

  clearToken(): void {
    this.token = null;
  }

  getToken(): string | null {
    return this.token;
  }

  // Auth endpoints
  signup(data: { firstName: string; lastName: string; email: string; password: string; confirmPassword: string; userType: '1' | '2' }) {
    return this.client.post('/auth/signup', data);
  }

  login(data: { email: string; password: string }) {
    return this.client.post('/auth/login', data);
  }

  logout() {
    return this.client.get('/auth/logout');
  }

  getMe() {
    return this.client.get('/auth/me');
  }

  // Rides endpoints
  getRides(params?: { page?: number; limit?: number; status?: string; fromDate?: string; toDate?: string }) {
    return this.client.get('/rides', { params });
  }

  getRideById(id: string) {
    return this.client.get(`/rides/${id}`);
  }

  createRide(data: any) {
    return this.client.post('/rides', data);
  }

  updateRide(id: string, data: any) {
    return this.client.patch(`/rides/${id}`, data);
  }

  bookRide(rideId: string, seatsToBook: number) {
    return this.client.post(`/rides/${rideId}/book`, { seatsToBook });
  }

  cancelRide(id: string) {
    return this.client.delete(`/rides/${id}`);
  }

  // User endpoints
  getProfile() {
    return this.client.get('/users/profile');
  }

  updateProfile(data: any) {
    return this.client.patch('/users/profile', data);
  }

  // Vehicle endpoints
  addVehicle(data: any) {
    return this.client.post('/users/vehicles', data);
  }

  getVehicles() {
    return this.client.get('/users/vehicles');
  }

  updateVehicle(id: string, data: any) {
    return this.client.patch(`/users/vehicles/${id}`, data);
  }

  deleteVehicle(id: string) {
    return this.client.delete(`/users/vehicles/${id}`);
  }

  // Reviews endpoints
  addReview(data: any) {
    return this.client.post('/users/reviews', data);
  }

  getUserReviews(userId: string) {
    return this.client.get(`/users/${userId}/reviews`);
  }
}

export const apiClient = new APIClient();
