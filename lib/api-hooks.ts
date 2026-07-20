'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { tokenAPI, dashboardAPI, monitoringAPI, usersAPI, UserDetails, adminNotificationAPI } from './api-client'
import {
  Token,
  AttendanceStats,
  ChartDataPoint,
  TokenRequest,
  MonitoringResponse,
  BackendDashboardStats,
  TopAlfaStudent,
  MonthlyRecapData,
  ApiResponse,
  ApiError,
  AdminNotification,
} from './types'

/* =========================================================
   TOKENS
========================================================= */

export function useTokens() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = async () => {
    try {
      setLoading(true)
      const result = await tokenAPI.getAll()

      if ('data' in result && result.data) {
        setTokens(result.data as Token[])
      } else {
        setError(result.message || 'Failed to fetch tokens')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refetch()
  }, [])

  return { tokens, loading, error, refetch }
}

/* =========================================================
   GENERATE TOKEN
========================================================= */

export function useGenerateToken() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedToken, setGeneratedToken] = useState<Token | null>(null)

  // Shared wrapper to avoid duplicating try/catch/loading in every method
  const _callAndSet = async (
    apiFn: () => Promise<ApiResponse<Token> | ApiError>
  ): Promise<Token | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiFn()
      if ('data' in result && result.data) {
        const token = result.data
        setGeneratedToken(token)
        return token
      }
      setError(result.message || 'Failed to generate token')
      return null
    } catch {
      setError('Something went wrong')
      return null
    } finally {
      setLoading(false)
    }
  }

  const generate = (payload: TokenRequest) =>
    _callAndSet(() => tokenAPI.create(payload))

  const generateHadir = () => _callAndSet(tokenAPI.createHadir)
  const generateTelat = () => _callAndSet(tokenAPI.createTelat)

  const reset = () => {
    setGeneratedToken(null)
    setError(null)
  }

  return { generate, generateHadir, generateTelat, loading, error, generatedToken, reset }
}

/* =========================================================
   DASHBOARD STATS
========================================================= */

function mapDashboardResponse(data: BackendDashboardStats): AttendanceStats {
  return {
    totalTokens: data.total_token,
    todayAttendance: data.total_absen_hari_ini,
    activeTokens: data.token_aktif,
    totalAttendance: data.token_hari_ini,
    totalHadir: data.total_hadir_hari_ini,
    totalTelat: data.total_telat_hari_ini,
    totalAlfa: data.total_alfa_hari_ini,
    totalSakit: data.total_sakit_hari_ini,
  }
}

export function useAttendanceStats() {
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const result = await dashboardAPI.getStats()

        if ('data' in result && result.data) {
          const mapped = mapDashboardResponse(result.data)
          setStats(mapped)
        } else {
          setError(result.message || 'Failed to fetch stats')
        }
      } catch {
        setError('Failed to fetch stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}

/* =========================================================
   ATTENDANCE CHART
========================================================= */

export function useAttendanceChart() {
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChart = async () => {
      try {
        setLoading(true)

        const result = await dashboardAPI.getChart()

        // ✅ cek apakah ini success response
        if ('data' in result) {
          setData(result.data as ChartDataPoint[])
        } else {
          setError(result.message || 'Failed to fetch chart')
        }

      } catch (err) {
        setError('Failed to fetch chart')
      } finally {
        setLoading(false)
      }
    }

    fetchChart()
  }, [])

  return { data, loading, error }
}

/* =========================================================
   PAGINATED TOKENS
========================================================= */

export function usePaginatedTokens() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchData = async () => {
    try {
      setLoading(true)
      const result = await tokenAPI.getPaginated(page)

      if ('data' in result && result.data) {
        setTokens(result.data.tokens || [])
        setTotalPages(result.data.totalPages || 1)
      } else {
        setError(result.message || 'Failed to fetch tokens')
      }
    } catch {
      setError('Failed to fetch tokens')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page])

  return {
    tokens,
    loading,
    error,
    page,
    setPage,
    totalPages,
    refetch: fetchData,
  }
}

/* =========================================================
   STATIC DATA
========================================================= */

export function useAvailableClasses() {
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true)
        const result = await monitoringAPI.getClasses()

        if ('data' in result && Array.isArray(result.data) && result.data.length > 0) {
          // Backend mengembalikan array string: ["X-RPL-1", "XI-RPL-1", ...]
          // Kita konversi menjadi format { id, name } untuk dropdown
          if (typeof result.data[0] === 'string') {
            setClasses(
              (result.data as string[]).map((cls) => ({
                id: cls,
                name: cls, // Gunakan value yang sama untuk label dropdown
              }))
            )
          } else {
            // Jika backend sudah mengembalikan format { id, name }
            setClasses(result.data as unknown as { id: string; name: string }[])
          }
        }
      } catch {
        // Endpoint gagal → biarkan classes tetap kosong, UI masih bisa dipakai
        setError(null)
      } finally {
        setLoading(false)
      }
    }

    fetchClasses()
  }, [])

  return { classes, loading, error }
}

export function useAvailableDepartments() {
  const [departments] = useState([
    { id: 'RPL', name: 'RPL' },
    { id: 'TKJ', name: 'TKJ' },
    { id: 'DKV', name: 'DKV' },
    { id: 'PKM', name: 'PKM' },
    { id: 'TOI', name: 'TOI' },
  ])

  return { departments, loading: false, error: null }
}

/* =========================================================
   EXPORT DATA
========================================================= */

export function useExportData() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportToExcel = async (filters: {
    exportType?: string
    classId?: string
    departmentId?: string
    startDate?: string
  }) => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()

      if (filters.exportType) searchParams.append('type', filters.exportType)
      if (filters.classId) searchParams.append('kelas', filters.classId)
      if (filters.departmentId) searchParams.append('jurusan', filters.departmentId)
      if (filters.startDate) searchParams.append('tanggal', filters.startDate)

      const url = `/api/v1/export/attendance?${searchParams.toString()}`

      const headers: Record<string, string> = {}
      const token = localStorage.getItem('authToken')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(url, { headers })

      if (!response.ok) {
        throw new Error(`Export failed with status: ${response.status}`)
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = downloadUrl
      const dateStr =
        filters.startDate || new Date().toISOString().split('T')[0]

      link.setAttribute('download', `Rekap_Absensi_${dateStr}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)

      return { success: true }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Export failed'
      )
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  return { exportToExcel, loading, error }
}

/* =========================================================
   MONITORING
========================================================= */

export function useMonitoringData(filters: { class_group?: string; status?: string }) {
  const [data, setData] = useState<MonitoringResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const result = await monitoringAPI.getStudents(filters)

      if (result && 'data' in result && result.data) {
        const rawResponse = result
        const backendStudents = rawResponse.data || []
        const mappedStudents = backendStudents.map((s) => ({
          id: s.id,
          nisn: s.nisn,
          name: s.full_name || s.name || '',
          class_group: s.class_group,
          status: s.status,
          timestamp: s.clock_in_time && s.clock_in_time !== '-' ? `${rawResponse.date || new Date().toISOString().split('T')[0]}T${s.clock_in_time}` : undefined
        }))

        setData({
          summary: rawResponse.summary,
          data: mappedStudents
        })
        setError(null)
      } else {
        setError(result.message || 'Failed to fetch monitoring data')
      }
    } catch {
      setError('Something went wrong fetching monitoring data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filters.class_group, filters.status])

  const updateStatus = async (userId: number, status: string) => {
    const result = await monitoringAPI.updateStatus({ user_id: userId, status })
    if ('data' in result || result.success !== false) { // Handle varied success formats
      await fetchData() // refresh
      return true
    }
    return false
  }

  const updateMultipleStatuses = async (userIds: number[], status: string) => {
    try {
      const promises = userIds.map((userId) => monitoringAPI.updateStatus({ user_id: userId, status }))
      const results = await Promise.all(promises)
      await fetchData() // refresh once at the end
      return results.some(result => 'data' in result || result.success !== false)
    } catch {
      return false
    }
  }

  return { data, loading, error, refetch: fetchData, updateStatus, updateMultipleStatuses }
}

export function useTopAlfaStudents() {
  const [data, setData] = useState<TopAlfaStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await monitoringAPI.getTopAlfa()
        if (result && 'data' in result && Array.isArray(result.data)) {
          setData(result.data)
        } else {
          setError(result.message || 'Failed to fetch top alfa students')
        }
      } catch {
        setError('Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return { data, loading, error }
}

export function useMonthlyRecap() {
  const [data, setData] = useState<MonthlyRecapData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await monitoringAPI.getMonthlyRecap()
        if (result && 'data' in result && Array.isArray(result.data)) {
          setData(result.data)
        } else {
          setError(result.message || 'Failed to fetch monthly recap')
        }
      } catch {
        setError('Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return { data, loading, error }
}

export function useUsers(filters?: { class_group?: string; search?: string }) {
  const [data, setData] = useState<{ users: UserDetails[]; total: number }>({ users: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const result = await usersAPI.getAll(filters)
      if (result && 'data' in result && result.data) {
        setData(result.data)
      } else {
        setError(result.message || 'Failed to fetch users')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filters?.class_group, filters?.search])

  return { data, loading, error, refetch: fetchData }
}

/* =========================================================
   ADMIN NOTIFICATIONS
========================================================= */

export function useAdminNotifications(pollingIntervalMs = 60_000) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const result = await adminNotificationAPI.getAll()
      if ('data' in result && result.data) {
        const items = Array.isArray(result.data) ? result.data : []
        setNotifications(items)
        setError(null)
      } else {
        setError(result.message || 'Gagal memuat notifikasi')
      }
    } catch {
      setError('Gagal memuat notifikasi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    intervalRef.current = setInterval(fetchNotifications, pollingIntervalMs)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchNotifications, pollingIntervalMs])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const markAsRead = async (id: number) => {
    try {
      await adminNotificationAPI.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch { /* silent */ }
  }

  // Uses the real /notifications/read-all endpoint
  const markAllAsRead = async () => {
    try {
      await adminNotificationAPI.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch { /* silent */ }
  }

  // Delete selected by IDs
  const deleteSelected = async (ids: number[]) => {
    if (ids.length === 0) return
    try {
      await adminNotificationAPI.deleteBulk(ids)
      setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)))
    } catch { /* silent */ }
  }

  // Delete all notifications
  const deleteAll = async () => {
    try {
      await adminNotificationAPI.deleteAll()
      setNotifications([])
    } catch { /* silent */ }
  }

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteSelected,
    deleteAll,
  }
}