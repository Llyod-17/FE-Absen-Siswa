import { ApiError, ApiResponse } from './types'

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
    apiCall('/token/qr_code/active'),

  getPaginated: (page: number) =>
    apiCall(`/token?page=${page}`),

  create: (payload: {
    duration: number
    category: string
  }) =>
    apiCall('/token/create', {
      method: 'POST',
      body: JSON.stringify({
        duration: payload.duration,
        category: payload.category,
      }),
    }),

  createHadir: () =>
    apiCall('/token/create/hadir', {
      method: 'POST',
    }),

  createTelat: () =>
    apiCall('/token/create/telat', {
      method: 'POST',
    }),
}

export const dashboardAPI = {
  getStats: () => apiCall('/dashboard'),
  getChart: () => apiCall('/dashboard/trend'),
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

export const monitoringAPI = {
  getStudents: (params?: { class_group?: string; status?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.class_group && params.class_group !== 'all') searchParams.append('class_group', params.class_group)
    if (params?.status && params.status !== 'all') searchParams.append('status', params.status)
    return apiCall(`/attendance/students?${searchParams.toString()}`)
  },

  getClasses: () => apiCall('/classes'),
  
  updateStatus: (payload: { nisn: string; status: string }) =>
    apiCall('/attendance/status', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
}
