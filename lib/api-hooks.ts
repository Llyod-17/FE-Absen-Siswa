'use client'

import { useState, useEffect } from 'react'
import { tokenAPI, dashboardAPI, monitoringAPI } from './api-client'
import {
  Token,
  AttendanceStats,
  ChartDataPoint,
  TokenRequest,
  MonitoringResponse,
  MonitoringSummary,
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
    apiFn: () => Promise<any>
  ): Promise<Token | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiFn()
      if ('data' in result && result.data) {
        const token = result.data as Token
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

function mapDashboardResponse(data: any): AttendanceStats {
  return {
    totalTokens: data.total_token,
    todayAttendance: data.total_absen_hari_ini,
    activeTokens: data.token_aktif,
    totalAttendance: data.token_hari_ini,
    totalHadir: data.total_hadir_hari_ini,
    totalTelat: data.total_telat_hari_ini,
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
        const responseData = result.data as any
        setTokens(responseData.tokens || [])
        setTotalPages(responseData.totalPages || 1)
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
            setClasses(result.data as { id: string; name: string }[])
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
    { id: 'MM', name: 'Multimedia' },
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

      if (result && 'data' in result) {
        const rawResponse = result as any
        const backendStudents = (rawResponse.data || []) as any[]
        const mappedStudents = backendStudents.map((s: any) => ({
          id: s.id,
          nisn: s.nisn,
          name: s.full_name || s.name || '',
          class_group: s.class_group,
          status: s.status,
          timestamp: s.clock_in_time && s.clock_in_time !== '-' ? `${rawResponse.date || new Date().toISOString().split('T')[0]}T${s.clock_in_time}` : undefined
        }))

        setData({
          summary: rawResponse.summary as MonitoringSummary,
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

  const updateStatus = async (nisn: string, status: string) => {
    const result = await monitoringAPI.updateStatus({ nisn, status })
    if ('data' in result || result.success !== false) { // Handle varied success formats
      await fetchData() // refresh
      return true
    }
    return false
  }

  return { data, loading, error, refetch: fetchData, updateStatus }
}