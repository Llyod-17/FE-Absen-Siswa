import {
  ApiError,
  ApiResponse,
  Token,
  BackendDashboardStats,
  ChartDataPoint,
  BackendStudent,
  MonitoringApiResponse,
  TopAlfaStudent,
  MonthlyRecapData,
  AdminNotification,
} from './types'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  '/api/v1'

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>
}

export async function apiCall<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T> | ApiError> {
  try {
    const url = `${API_URL}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    const token = localStorage.getItem('authToken')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    const textResult = await response.text()
    let data;

    try {
      data = JSON.parse(textResult)
    } catch {
      return {
        success: false,
        message: textResult || `HTTP Error ${response.status}`,
        code: String(response.status)
      } as ApiError
    }

    if (!response.ok) {
      return {
        success: false,
        message: data?.message || 'An error occurred',
        code: data?.code || String(response.status),
      } as ApiError
    }

    return data as ApiResponse<T>
  } catch (error) {
    console.error('[v0] API Error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    }
  }
}

export const tokenAPI = {

  getAll: () =>
    apiCall<Token[]>('/token/qr_code/active'),

  getPaginated: (page: number) =>
    apiCall<{ tokens: Token[]; totalPages: number }>(`/token?page=${page}`),

  create: (payload: {
    duration: number
    category: string
  }) =>
    apiCall<Token>('/token/create', {
      method: 'POST',
      body: JSON.stringify({
        duration: payload.duration,
        category: payload.category,
      }),
    }),

  createHadir: () =>
    apiCall<Token>('/token/create/hadir', {
      method: 'POST',
    }),

  createTelat: () =>
    apiCall<Token>('/token/create/telat', {
      method: 'POST',
    }),
    
  getImageUrl: (id: number) => `${API_URL}/token/${id}/image`,
  
  deactivate: (id: number) =>
    apiCall<ApiResponse<string>>(`/token/${id}/deactivate`, {
      method: 'POST',
    }),
}

export const dashboardAPI = {
  getStats: () => apiCall<BackendDashboardStats>('/dashboard'),
  getChart: () => apiCall<ChartDataPoint[]>('/dashboard/trend'),
}

export const exportAPI = {
  getAttendance: (params?: { kelas?: string; jurusan?: string; tanggal?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.kelas) searchParams.append('kelas', params.kelas)
    if (params?.jurusan) searchParams.append('jurusan', params.jurusan)
    if (params?.tanggal) searchParams.append('tanggal', params.tanggal)
    return apiCall(`/export/attendance?${searchParams.toString()}`)
  },
}

export const logsAPI = {
  getHistory: () => apiCall('/logs/'),
}

export const importAPI = {
  importUsers: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    // We fetch directly because apiCall sets Content-Type to application/json by default
    const token = localStorage.getItem('authToken')
    return fetch(`${API_URL}/import/users`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(r => r.json())
  }
}

export const notificationAPI = {
  getSettings: () => apiCall('/notification/settings'),
  updateSettings: (payload: any) =>
    apiCall('/notification/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  test: () => apiCall('/notification/test', { method: 'POST' }),
  getLogs: () => apiCall('/notification/logs'),
  trigger: (payload: any) =>
    apiCall('/notification/trigger', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getWaStatus: () => apiCall('/notification/wa/status'),
  pairWa: () => apiCall('/notification/wa/pair', { method: 'POST' }),
  logoutWa: () => apiCall('/notification/wa/logout', { method: 'POST' }),
}

export const monitoringAPI = {
  getStudents: (params?: { class_group?: string; status?: string }): Promise<MonitoringApiResponse | ApiError> => {
    const searchParams = new URLSearchParams()
    if (params?.class_group && params.class_group !== 'all') searchParams.append('class_group', params.class_group)
    if (params?.status && params.status !== 'all') searchParams.append('status', params.status)
    return apiCall<BackendStudent[]>(`/attendance/students?${searchParams.toString()}`) as Promise<MonitoringApiResponse | ApiError>
  },

  getClasses: () => apiCall<string[]>('/classes'),
  
  updateStatus: (payload: { user_id: number; status: string }) =>
    apiCall('/attendance/status', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getTopAlfa: () => apiCall<TopAlfaStudent[]>('/attendance/top-alfa'),
  
  getMonthlyRecap: () => apiCall<MonthlyRecapData[]>('/attendance/monthly-recap'),
  
  getLogs: () => apiCall('/attendance/logs'),
}

export interface UserDetails {
  id: number
  nisn: string
  full_name: string
  username: string
  role: string
  class_group: string
  parent_phone: string
}

export const usersAPI = {
  getAll: (params?: { class_group?: string; search?: string }) => {
    const searchParams = new URLSearchParams()
    searchParams.append('role', 'siswa')
    searchParams.append('limit', '100') // Fetch many students for search/filter list
    if (params?.class_group) searchParams.append('class_group', params.class_group)
    if (params?.search) searchParams.append('search', params.search)
    return apiCall<{ users: UserDetails[]; total: number }>(`/users?${searchParams.toString()}`)
  },
  getById: (id: number) => apiCall<UserDetails>(`/users/${id}`),
  create: (payload: {
    nisn: string
    full_name: string
    username: string
    class_group: string
    parent_phone: string
  }) =>
    apiCall<ApiResponse<UserDetails>>('/users', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        role: 'siswa',
        password: 'password123', // default password
      }),
    }),
  update: (
    id: number,
    payload: {
      nisn: string
      full_name: string
      username: string
      class_group: string
      parent_phone: string
    }
  ) =>
    apiCall<ApiResponse<UserDetails>>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...payload,
        role: 'siswa',
      }),
    }),
  delete: (id: number) =>
    apiCall<ApiResponse<string>>(`/users/${id}`, {
      method: 'DELETE',
    }),
  resetPassword: (id: number) =>
    apiCall<ApiResponse<string>>(`/users/${id}/reset-password`, {
      method: 'POST',
    }),
}

export const adminNotificationAPI = {
  getAll: () =>
    apiCall<AdminNotification[]>('/notifications'),
  markAsRead: (id: number) =>
    apiCall(`/notifications/read/${id}`, { method: 'PUT' }),
  markAllAsRead: () =>
    apiCall('/notifications/read-all', { method: 'PUT' }),
  deleteBulk: (ids: number[]) =>
    apiCall('/notifications/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    }),
  deleteAll: () =>
    apiCall('/notifications/all', { method: 'DELETE' }),
}
