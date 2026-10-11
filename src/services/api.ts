import axios from 'axios';
import type {
  Product,
  Restaurant,
  MenuItem,
  Report,
  ApiResponse,
  PaginatedResponse,
  User,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('foodlens_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function unwrapError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.detail || err.message || 'Something went wrong';
  }
  return 'Something went wrong';
}

/**
 * Product Service — backed by FastAPI, which proxies real, live data
 * from Open Food Facts (world.openfoodfacts.org). No mock data.
 */
export const productService = {
  getProduct: async (barcode: string): Promise<ApiResponse<Product>> => {
    try {
      const { data } = await apiClient.get(`/api/products/${barcode}`);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: unwrapError(err) };
    }
  },

  scanBarcode: async (barcode: string): Promise<ApiResponse<Product>> => {
    try {
      const { data } = await apiClient.get(`/api/products/barcode/${barcode}`);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: unwrapError(err) };
    }
  },

  searchProducts: async (
    query: string,
    page: number = 1
  ): Promise<ApiResponse<PaginatedResponse<Product>>> => {
    try {
      const { data } = await apiClient.get('/api/products/search', {
        params: { query, page, pageSize: 20 },
      });
      return { success: true, data };
    } catch (err) {
      return { success: false, error: unwrapError(err) };
    }
  },

  browseCategory: async (
    category: string,
    page: number = 1
  ): Promise<ApiResponse<PaginatedResponse<Product>>> => {
    try {
      const { data } = await apiClient.get(`/api/products/category/${category}`, {
        params: { page, pageSize: 20 },
      });
      return { success: true, data };
    } catch (err) {
      return { success: false, error: unwrapError(err) };
    }
  },
};

/**
 * Restaurant Service
 */
export const restaurantService = {
  getRestaurants: async (page: number = 1): Promise<ApiResponse<PaginatedResponse<Restaurant>>> => {
    try {
      const { data } = await apiClient.get('/api/restaurants', { params: { page } });
      return { success: true, data };
    } catch (err) {
      return { success: false, error: unwrapError(err) };
    }
  },

  getRestaurant: async (id: string): Promise<ApiResponse<Restaurant>> => {
    try {
      const { data } = await apiClient.get(`/api/restaurants/${id}`);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: unwrapError(err) };
    }
  },

  searchRestaurants: async (query: string): Promise<ApiResponse<PaginatedResponse<Restaurant>>> => {
    try {
      const { data } = await apiClient.get('/api/restaurants', { params: { search: query } });
      return { success: true, data };
    } catch (err) {
      return { success: false, error: unwrapError(err) };
    }
  },

  getMenuItems: async (restaurantId: string): Promise<ApiResponse<MenuItem[]>> => {
    try {
      const { data } = await apiClient.get(`/api/restaurants/${restaurantId}/menu`);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: unwrapError(err) };
    }
  },
};

/**
 * Auth Service — talks to the real FastAPI auth endpoints (JWT + email OTP verification)
 */
export const authService = {
  // Step 1 of signup: creates the (unverified) account and triggers an OTP email
  signup: async (name: string, email: string, password: string, phone?: string) => {
    try {
      const { data } = await apiClient.post('/api/auth/signup', { name, email, password, phone });
      return { success: true, data };
    } catch (err) {
      return { success: false, error: unwrapError(err) };
    }
  },

  sendOtp: async (identifier: string, purpose: 'signup' | 'login' = 'signup') => {
    try {
      const { data } = await apiClient.post('/api/auth/send-otp', { identifier, purpose });
      return { success: true, data };
    } catch (err) {
      return { success: false, error: unwrapError(err) };
    }
  },

  // Step 2 of signup: verifies the emailed OTP and stores the resulting session token
  verifyOTP: async (identifier: string, otp: string, purpose: 'signup' | 'login' = 'signup') => {
    try {
      const { data } = await apiClient.post('/api/auth/verify-otp', { identifier, otp, purpose });
      const token = data?.token || data?.access_token;
      if (token) localStorage.setItem('foodlens_token', token);
      if (data?.user) localStorage.setItem('foodlens_user', JSON.stringify(data.user));
      return { success: true, data };
    } catch (err) {
      return { success: false, error: unwrapError(err) };
    }
  },

  login: async (identifier: string, password: string): Promise<ApiResponse<{ access_token: string; user: User }>> => {
    try {
      const { data } = await apiClient.post('/api/auth/login', { identifier, password });
      if (data?.access_token) {
        localStorage.setItem('foodlens_token', data.access_token);
        if (data?.refresh_token) localStorage.setItem('foodlens_refresh', data.refresh_token);
        if (data?.user) localStorage.setItem('foodlens_user', JSON.stringify(data.user));
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, error: unwrapError(err) };
    }
  },

  me: async (): Promise<ApiResponse<User>> => {
    try {
      const { data } = await apiClient.get('/api/auth/me');
      if (data) localStorage.setItem('foodlens_user', JSON.stringify(data));
      return { success: true, data };
    } catch (err) {
      return { success: false, error: unwrapError(err) };
    }
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const refresh_token = localStorage.getItem('foodlens_refresh');
    localStorage.removeItem('foodlens_token');
    localStorage.removeItem('foodlens_refresh');
    localStorage.removeItem('foodlens_user');
    try {
      await apiClient.post('/api/auth/logout', refresh_token ? { refresh_token } : {});
    } catch {
      // token already cleared locally either way
    }
    return { success: true, data: null };
  },

  isAuthenticated: (): boolean => !!localStorage.getItem('foodlens_token'),

  // Synchronous read of the last-known user, cached locally on login/signup — for
  // instant UI personalization without waiting on a network round trip.
  getCachedUser: (): { name?: string; email?: string } | null => {
    const raw = localStorage.getItem('foodlens_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
};

/**
 * User Service — real profile read/update/delete against FastAPI's /api/users/me
 */
export const userService = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    try {
      const { data } = await apiClient.get('/api/users/me');
      localStorage.setItem('foodlens_user', JSON.stringify(data));
      return { success: true, data };
    } catch (err) {
      return { success: false, error: unwrapError(err) };
    }
  },

  updateProfile: async (fields: { name?: string; phone?: string }): Promise<ApiResponse<User>> => {
    try {
      const { data } = await apiClient.patch('/api/users/me', fields);
      localStorage.setItem('foodlens_user', JSON.stringify(data));
      return { success: true, data };
    } catch (err) {
      return { success: false, error: unwrapError(err) };
    }
  },

  deleteAccount: async (): Promise<ApiResponse<null>> => {
    try {
      await apiClient.delete('/api/users/me');
      localStorage.removeItem('foodlens_token');
      localStorage.removeItem('foodlens_refresh');
      localStorage.removeItem('foodlens_user');
      return { success: true, data: null };
    } catch (err) {
      return { success: false, error: unwrapError(err) };
    }
  },
};

/**
 * Report Service
 */
export const reportService = {
  submitReport: async (
    type: string,
    description: string,
    productId?: string,
    restaurantId?: string
  ): Promise<ApiResponse<Report>> => {
    try {
      const { data } = await apiClient.post('/api/reports', {
        type,
        description,
        product_id: productId,
        restaurant_id: restaurantId,
      });
      return { success: true, data };
    } catch (err) {
      return { success: false, error: unwrapError(err) };
    }
  },

  getReports: async (page: number = 1): Promise<ApiResponse<PaginatedResponse<Report>>> => {
    try {
      const { data } = await apiClient.get('/api/reports', { params: { page } });
      return { success: true, data };
    } catch (err) {
      return { success: false, error: unwrapError(err) };
    }
  },
};

export default apiClient;
