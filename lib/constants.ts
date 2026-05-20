import type { AttendanceStatus } from './types'

/* =========================================================
   STATUS MAPS – shared across monitoring table, badges, etc.
========================================================= */

export const STATUS_COLORS: Record<AttendanceStatus, string> = {
  hadir: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  telat: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  alfa: 'bg-red-500/20 text-red-400 border-red-500/30',
  sakit: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  izin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  belum_absen: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

export const STATUS_LABELS: Record<AttendanceStatus, string> = {
  hadir: 'HADIR',
  telat: 'TELAT',
  alfa: 'ALFA',
  sakit: 'SAKIT',
  izin: 'IZIN',
  belum_absen: 'BELUM ABSEN',
}

/* =========================================================
   ANIMATION VARIANTS – reusable framer-motion presets
========================================================= */

export const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
}

export const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

export const cardClass = `
  bg-slate-900/70 backdrop-blur-xl
  border border-slate-700/50
  rounded-2xl shadow-xl shadow-black/30
`
