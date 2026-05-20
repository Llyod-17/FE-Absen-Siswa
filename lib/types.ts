// Token types
export interface Token {
  id: number
  token_code: string
  is_active: boolean
  validUntil: string
  createdAt: string
  category: 'hadir' | 'telat'
  created_by: {
    id: number
    full_name: string
  }
}

export interface TokenRequest {
  duration: number
  category: 'hadir' | 'telat'
}

export interface TokenResponse {
  success: boolean
  data?: Token
  message?: string
}

export type AttendanceStatus = 'hadir' | 'telat' | 'alfa' | 'sakit' | 'izin' | 'belum_absen'

export interface AttendanceRecord {
  id: string
  userId: string
  userName: string
  tokenId: string
  timestamp: string
  status: AttendanceStatus
}

export interface MonitoringSummary {
  total: number
  hadir: number
  telat: number
  alfa: number
  sakit: number
  izin: number
  belum_absen: number
}

export interface StudentAttendance {
  id: number
  nisn: string
  name: string
  class_group: string
  status: AttendanceStatus
  timestamp?: string
}

export interface MonitoringResponse {
  summary: MonitoringSummary
  data: StudentAttendance[]
}

export interface AttendanceStats {
  totalTokens: number
  todayAttendance: number
  activeTokens: number
  totalAttendance: number
  totalHadir?: number
  totalTelat?: number
}

export interface ChartDataPoint {
  date: string
  attendance: number
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message: string
}

export interface ApiError {
  success?: boolean
  code?: string
  message: string
}
