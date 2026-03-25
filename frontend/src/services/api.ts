import { config } from '../config/env';
import type {
  ApiResponse, Employee, Asset, Booking,
  DashboardStats, EmployeeFormData, AssetFormData,
  BookingFormData, User,
} from '../types';

/**
 * Centralized API service.
 * All network calls go through this module — typed fetch wrappers with auth headers.
 */

/** Get stored JWT token */
function getToken(): string | null {
  return localStorage.getItem(config.tokenKey);
}

/** Build common fetch headers including auth */
function headers(): HeadersInit {
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

/** Generic typed fetch with error handling */
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${config.apiBaseUrl}${url}`, {
    ...options,
    headers: { ...headers(), ...(options?.headers || {}) },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra');
  return data;
}

/* ===== Auth API ===== */
export const authApi = {
  login: (email: string, password: string) =>
    request<ApiResponse<{ token: string; user: User }>>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    request<ApiResponse<{ token: string; user: User }>>('/auth/register', {
      method: 'POST', body: JSON.stringify({ name, email, password }),
    }),

  me: () => request<ApiResponse<User>>('/auth/me'),

  uploadAvatar: (avatar: string) =>
    request<ApiResponse<{ avatar: string }>>('/auth/avatar', {
      method: 'PUT', body: JSON.stringify({ avatar }),
    }),
};

/* ===== Employee API ===== */
export const employeeApi = {
  list: (params?: { search?: string; department?: string; role?: string }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.department) qs.set('department', params.department);
    if (params?.role) qs.set('role', params.role);
    const query = qs.toString();
    return request<ApiResponse<Employee[]>>(`/employees${query ? `?${query}` : ''}`);
  },

  get: (id: string) => request<ApiResponse<Employee>>(`/employees/${id}`),

  create: (data: EmployeeFormData) =>
    request<ApiResponse<Employee>>('/employees', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<EmployeeFormData>) =>
    request<ApiResponse<Employee>>(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    request<ApiResponse<null>>(`/employees/${id}`, { method: 'DELETE' }),

  departments: () => request<ApiResponse<string[]>>('/employees/departments'),
};

/* ===== Asset API ===== */
export const assetApi = {
  list: (params?: { search?: string; type?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.type) qs.set('type', params.type);
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return request<ApiResponse<Asset[]>>(`/assets${query ? `?${query}` : ''}`);
  },

  get: (id: string) => request<ApiResponse<Asset>>(`/assets/${id}`),

  create: (data: AssetFormData) =>
    request<ApiResponse<Asset>>('/assets', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<AssetFormData>) =>
    request<ApiResponse<Asset>>(`/assets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    request<ApiResponse<null>>(`/assets/${id}`, { method: 'DELETE' }),

  types: () => request<ApiResponse<string[]>>('/assets/types'),

  rooms: () => request<ApiResponse<Asset[]>>('/assets/rooms'),
};

/* ===== Booking API ===== */
export const bookingApi = {
  list: (params?: { date?: string; room_id?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.date) qs.set('date', params.date);
    if (params?.room_id) qs.set('room_id', params.room_id);
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return request<ApiResponse<Booking[]>>(`/bookings${query ? `?${query}` : ''}`);
  },

  create: (data: BookingFormData) =>
    request<ApiResponse<Booking>>('/bookings', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<BookingFormData>) =>
    request<ApiResponse<Booking>>(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  approve: (id: string) =>
    request<ApiResponse<Booking>>(`/bookings/${id}/approve`, { method: 'PUT' }),

  reject: (id: string) =>
    request<ApiResponse<Booking>>(`/bookings/${id}/reject`, { method: 'PUT' }),

  delete: (id: string) =>
    request<ApiResponse<null>>(`/bookings/${id}`, { method: 'DELETE' }),
};

/* ===== Dashboard API ===== */
export const dashboardApi = {
  stats: () => request<ApiResponse<DashboardStats>>('/dashboard/stats'),
};
