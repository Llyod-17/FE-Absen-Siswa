import type { AttendanceStatus } from './types'

/* =========================================================
   CUSTOMIZABLE JURUSAN & KELAS FALLBACKS
========================================================= */
export const AVAILABLE_CLASSES = [
  'X RPL 1',
  'X RPL 2',
  'XI RPL 1',
  'XII RPL 1',
  'X TKJ 1',
  'XI TKJ 1',
  'XII TKJ 1',
  'X DKV 1',
  'XI DKV 1',
  'XII DKV 1',
  'X PKM 1',
  'XI PKM 1',
  'XII PKM 1',
  'X TOI 1',
  'XI TOI 1',
  'XII TOI 1'
]

export const STATUS_LIST = [
  'Semua Status',
  'HADIR',
  'BELUM_ABSEN',
  'TELAT',
  'SAKIT',
  'ALFA'
]

/* =========================================================
   STATUS MAPS – Slate/Indigo Modern Light Theme Badges
   Hadir       → Emerald
   Telat       → Amber
   Sakit       → Orange
   Alfa        → Rose
   Belum Absen → Slate
========================================================= */

export const STATUS_COLORS: Record<AttendanceStatus, string> = {
  hadir: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  telat: 'bg-amber-50 text-amber-700 border border-amber-200',
  alfa: 'bg-rose-50 text-rose-700 border border-rose-200',
  sakit: 'bg-orange-50 text-orange-700 border border-orange-200',
  belum_absen: 'bg-slate-100 text-slate-700 border border-slate-200',
}

export const STATUS_LABELS: Record<AttendanceStatus, string> = {
  hadir: 'HADIR',
  telat: 'TELAT',
  alfa: 'ALPA',
  sakit: 'SAKIT',
  belum_absen: 'BELUM ABSEN',
}

/* =========================================================
   ANIMATION VARIANTS – reusable framer-motion presets
 ========================================================= */

export const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

export const itemVariants: any = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
}

/* Modern Slate/Indigo card class */
export const cardClass = `
  bg-white border border-slate-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200
`
