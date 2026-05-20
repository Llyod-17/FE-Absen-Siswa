'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMonitoringData, useAvailableClasses } from '@/lib/api-hooks'
import { containerVariants, itemVariants } from '@/lib/constants'
import { MonitoringTable } from '@/components/monitoring-table'
import { StatsCard } from '@/components/stats-card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Users, CheckCircle, Clock, AlertTriangle, Activity, XCircle } from 'lucide-react'

export default function MonitoringPage() {
  const [classFilter, setClassFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Fetch daftar kelas secara dinamis dari API (fallback ke data default jika endpoint belum ada)
  const { classes } = useAvailableClasses()

  const { data, loading, updateStatus } = useMonitoringData({
    class_group: classFilter,
    status: statusFilter,
  })

  const handleUpdateStatus = async (nisn: string, newStatus: string) => {
    try {
      const success = await updateStatus(nisn, newStatus)
      if (success) {
        toast.success('Status berhasil diperbarui!')
        return true
      }
      toast.error('Gagal memperbarui status')
      return false
    } catch (err) {
      toast.error('Gagal memperbarui status')
      return false
    }
  }

  const summary = data?.summary
  const students = data?.data || []

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Data Kehadiran Harian
        </h1>
        <p className="text-slate-600">
          Pantau status kehadiran siswa hari ini dan ubah status jika diperlukan.
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4"
      >
        <StatsCard icon={Users} label="Total Siswa" value={summary?.total || 0} color="blue" index={0} />
        <StatsCard icon={CheckCircle} label="Hadir" value={summary?.hadir || 0} color="green" index={1} />
        <StatsCard icon={Clock} label="Telat" value={summary?.telat || 0} color="orange" index={2} />
        <StatsCard icon={AlertTriangle} label="Alfa" value={summary?.alfa || 0} color="red" index={3} />
        <StatsCard icon={Activity} label="Sakit/Izin" value={(summary?.sakit || 0) + (summary?.izin || 0)} color="purple" index={4} />
        <StatsCard icon={XCircle} label="Belum Absen" value={summary?.belum_absen || 0} color="slate" index={5} />
      </motion.div>

      {/* Filters & Table */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
          <div className="w-full sm:w-64">
            <label className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1.5 block">Filter Kelas</label>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Semua Kelas" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">Semua Kelas</SelectItem>
                {/* Daftar kelas dinamis dari API */}
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-64">
            <label className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1.5 block">Filter Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="hadir">Hadir</SelectItem>
                <SelectItem value="telat">Telat</SelectItem>
                <SelectItem value="alfa">Alfa</SelectItem>
                <SelectItem value="sakit">Sakit</SelectItem>
                <SelectItem value="izin">Izin</SelectItem>
                <SelectItem value="belum_absen">Belum Absen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <MonitoringTable
          students={students}
          loading={loading}
          onUpdateStatus={handleUpdateStatus}
        />
      </motion.div>
    </motion.div>
  )
}
