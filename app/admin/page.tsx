'use client'

import { motion } from 'framer-motion'
import {
  Users,
  CheckCircle,
  KeyRound,
  Zap,
  TrendingUp,
  Activity,
  Calendar,
  ArrowUpRight,
  Clock,
} from 'lucide-react'
import { StatsCard } from '@/components/stats-card'
import { AttendanceChart } from '@/components/attendance-chart'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAttendanceStats, useAttendanceChart, useMonitoringData } from '@/lib/api-hooks'
import { containerVariants, itemVariants, cardClass } from '@/lib/constants'


export default function DashboardPage() {
  const { stats } = useAttendanceStats()
  const { data: chartData, loading: chartLoading } = useAttendanceChart()
  const { data: monitoringData } = useMonitoringData({ class_group: 'all', status: 'all' })

  const chartFormatted = chartData && chartData.length > 0
  ? chartData.map((item: any) => ({
      date: new Date(item.date).toLocaleDateString('id-ID', {
        weekday: 'short', // Sen, Sel, Rab
      }),
      attendance: item.total, // 🔥 mapping penting
    }))
  : Array.from({ length: 7 }, (_, i) => ({
      date: `Day ${i + 1}`,
      attendance: 0,
    }))

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="space-y-6 pb-8">

      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl bg-blue-600/10 border border-blue-500/20 p-6 lg:p-8"
      >
        {/* glow blobs */}
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-36 h-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium tracking-wide uppercase">
                Sistem Aktif
              </span> 
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mb-1">
              Halo, Admin! 👋
            </h1>
            <p className="text-slate-400 text-sm flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {today}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Cards ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4"
      >
        {[
          {
            icon: KeyRound, label: 'Total Sesi QR',
            value: stats?.totalTokens || 0, color: 'blue' as const, index: 0,
          },
          {
            icon: CheckCircle, label: 'Siswa Hadir',
            value: stats?.totalHadir ?? monitoringData?.summary?.hadir ?? 0, color: 'green' as const, index: 1,
          },
          {
            icon: Clock, label: 'Siswa Telat',
            value: stats?.totalTelat ?? monitoringData?.summary?.telat ?? 0, color: 'orange' as const, index: 2,
          },
          {
            icon: Zap, label: 'QR Sedang Aktif',
            value: stats?.activeTokens || 0, color: 'slate' as const, index: 3,
          },
          {
            icon: Users, label: 'Total Pemindaian',
            value: stats?.totalAttendance || 0, color: 'purple' as const, index: 4,
          },
        ].map((card) => (
          <motion.div key={card.label} variants={itemVariants}>
            <StatsCard {...card} />
          </motion.div>
        ))}
      </motion.div>

      {/* ── Charts ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6"
      >
        {[
          { title: 'Tren Kehadiran (7 Hari Terakhir)', type: 'line' as const },
          { title: 'Statistik Kehadiran Harian', type: 'bar' as const },
        ].map((chart) => (
          <motion.div key={chart.title} variants={itemVariants}>
            {chartLoading ? (
              <div className={`${cardClass} p-6 h-80 flex items-center justify-center`}>
                <LoadingSpinner message="Memuat data chart..." />
              </div>
            ) : (
              <div className={`${cardClass} overflow-hidden`}>
                <AttendanceChart
                  data={chartFormatted}
                  title={chart.title}
                  type={chart.type}
                />
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}