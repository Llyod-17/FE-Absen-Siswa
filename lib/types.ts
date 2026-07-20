// Token types
export interface Token {
  id: number
  token_code: string
  is_active: boolean
  validUntil?: string
  valid_until?: string
  expired_at?: string
  createdAt?: string
  created_at?: string
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

export type AttendanceStatus = 'hadir' | 'telat' | 'alfa' | 'sakit' | 'belum_absen'

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
  belum_absen: number
  departments?: Record<string, { total: number; hadir: number }>
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
  totalAlfa?: number
  totalSakit?: number
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

export interface BackendDashboardStats {
  total_token: number
  total_absen_hari_ini: number
  token_aktif: number
  token_hari_ini: number
  total_hadir_hari_ini: number
  total_telat_hari_ini: number
  total_alfa_hari_ini: number
  total_sakit_hari_ini: number
}

export interface BackendStudent {
  id: number
  nisn: string
  full_name?: string
  name?: string
  class_group: string
  status: AttendanceStatus
  clock_in_time?: string
}

export interface BackendMonitoringData {
  summary: MonitoringSummary
  data: BackendStudent[]
  date?: string
}

export interface MonitoringApiResponse extends ApiResponse<BackendStudent[]> {
  date?: string
  summary: MonitoringSummary
}

export interface TopAlfaStudent {
  name: string
  nisn: string
  alfaCount: number
  class_group: string
}

export interface MonthlyRecapData {
  month: string
  Hadir: number
  Sakit: number
  Alfa: number
  Izin: number
  rate: number
}

export interface AdminNotification {
  id: number
  judul: string
  pesan: string
  tipe: 'wa_error' | 'wa_status' | 'daily_recap'
  is_read: boolean
  created_at: string
  updated_at?: string
}
