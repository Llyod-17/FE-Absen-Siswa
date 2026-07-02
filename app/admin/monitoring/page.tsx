'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMonitoringData, useAvailableClasses } from '@/lib/api-hooks'
import { containerVariants, itemVariants } from '@/lib/constants'
import { MonitoringTable } from '@/components/monitoring-table'
import { StatsCard } from '@/components/stats-card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Users, CheckCircle, Clock, AlertTriangle, Activity, XCircle, RotateCcw } from 'lucide-react'

const MAJORS = [
  { id: 'RPL', name: 'RPL', fullName: 'Rekayasa Perangkat Lunak' },
  { id: 'TKJ', name: 'TKJ', fullName: 'Teknik Komputer & Jaringan' },
  { id: 'DKV', name: 'DKV', fullName: 'Desain Komunikasi Visual' },
  { id: 'PKM', name: 'PKM', fullName: 'Perbankan & Keuangan Mikro' },
  { id: 'TOI', name: 'TOI', fullName: 'Teknik Otomasi Industri' },
]

export default function MonitoringPage() {
  const [angkatanFilter, setAngkatanFilter] = useState<string>('all')
  const [jurusanFilter, setJurusanFilter] = useState<string>('all')
  const [kelasNumFilter, setKelasNumFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Fetch daftar kelas secara dinamis dari API
  const { classes } = useAvailableClasses()

  // Dynamic list parsing dari data backend dengan fallback standar
  const angkatanList = classes.length > 0 
    ? Array.from(new Set(classes.map(c => c.name.split('-')[0]))).filter(Boolean).sort()
    : ['X', 'XI', 'XII']

  const jurusanList = classes.length > 0
    ? Array.from(new Set(classes.map(c => c.name.split('-')[1]))).filter(Boolean).sort()
    : ['RPL', 'TKJ', 'DKV', 'PKM', 'TOI']

  const kelasList = classes.length > 0
    ? Array.from(new Set(classes.map(c => c.name.split('-')[2]))).filter(Boolean).sort()
    : ['1', '2', '3']

  const isSpecificClassSelected = angkatanFilter !== 'all' && jurusanFilter !== 'all' && kelasNumFilter !== 'all'
  const apiClassParam = isSpecificClassSelected ? `${angkatanFilter}-${jurusanFilter}-${kelasNumFilter}` : 'all'

  const { data, loading, updateStatus } = useMonitoringData({
    class_group: apiClassParam,
    status: 'all',
  })

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const success = await updateStatus(id, newStatus)
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

  const handleResetFilters = () => {
    setAngkatanFilter('all')
    setJurusanFilter('all')
    setKelasNumFilter('all')
    setStatusFilter('all')
    toast.success('Filter berhasil disetel ulang')
  }

  const rawStudents = data?.data || []

  // Filter out any student with "izin" status to follow the rule: "Fitur izin dihapus total dari seluruh UI dan logika"
  const activeStudents = rawStudents.filter(s => (s.status as string) !== 'izin')

  // 1. Filter data siswa berdasarkan kelas (Angkatan, Jurusan, Kelas) sebelum status filter
  const studentsFilteredByClass = activeStudents.filter((student) => {
    const parts = student.class_group ? student.class_group.split('-') : []
    const studentAngkatan = parts[0] || ''
    const studentJurusan = parts[1] || ''
    const studentKelas = parts[2] || ''

    const matchAngkatan = angkatanFilter === 'all' || studentAngkatan.toUpperCase() === angkatanFilter.toUpperCase()
    const matchJurusan = jurusanFilter === 'all' || studentJurusan.toUpperCase() === jurusanFilter.toUpperCase()
    const matchKelas = kelasNumFilter === 'all' || studentKelas === kelasNumFilter

    return matchAngkatan && matchJurusan && matchKelas
  })

  // 2. Hitung statistik dinamis berdasarkan filter kelas aktif untuk Summary Cards
  const dynamicSummary = {
    total: studentsFilteredByClass.length,
    hadir: studentsFilteredByClass.filter((s) => s.status === 'hadir').length,
    telat: studentsFilteredByClass.filter((s) => s.status === 'telat').length,
    alfa: studentsFilteredByClass.filter((s) => s.status === 'alfa').length,
    sakit: studentsFilteredByClass.filter((s) => s.status === 'sakit').length,
    belum_absen: studentsFilteredByClass.filter((s) => s.status === 'belum_absen').length,
  }

  // 3. Filter akhir untuk list tabel (termasuk status)
  const finalStudents = studentsFilteredByClass.filter((student) => {
    return statusFilter === 'all' || student.status === statusFilter
  })

  // 4. Hitung statistik kehadiran per jurusan secara dinamis dari raw data
  const majorStats = MAJORS.map((major) => {
    const majorStudents = activeStudents.filter((s) => {
      const parts = s.class_group ? s.class_group.split('-') : []
      return parts[1]?.toUpperCase() === major.id
    })

    const total = majorStudents.length
    const hadir = majorStudents.filter((s) => s.status === 'hadir').length
    const telat = majorStudents.filter((s) => s.status === 'telat').length
    const present = hadir + telat
    const rate = total > 0 ? Math.round((present / total) * 100) : 0

    return {
      ...major,
      total,
      present,
      rate,
    }
  })

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-10"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-[#111111] tracking-tight mb-1 font-[family-name:var(--font-playfair)]">
          Absensi Harian Siswa
        </h1>
        <p className="text-xs text-[#5a626a] font-light leading-none">
          Kelola dan pantau status kehadiran harian kelas di sekolah.
        </p>
      </motion.div>

      {/* Ringkasan Kehadiran per Jurusan */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-[11px] font-semibold text-[#5a626a] uppercase tracking-[1.5px]">
          Tingkat Kehadiran per Jurusan Hari Ini
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {majorStats.map((major) => (
            <div
              key={major.id}
              onClick={() => setJurusanFilter(jurusanFilter === major.id ? 'all' : major.id)}
              className={`
                border p-4.5 cursor-pointer transition-all duration-200 relative rounded-xl flex flex-col justify-between h-28 shadow-none
                ${jurusanFilter === major.id 
                  ? 'border-[#006039] bg-[#006039]/5' 
                  : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                }
              `}
            >
              {jurusanFilter === major.id && (
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#006039]" />
              )}
              <div className="min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[16px] font-bold text-[#111111]">{major.name}</span>
                  <span className="text-[20px] font-black text-[#006039]">{major.rate}%</span>
                </div>
                <p className="text-[10px] text-[#5a626a] font-light truncate mt-0.5">{major.fullName}</p>
              </div>
              
              <div className="w-full mt-2">
                <div className="flex items-center justify-between text-[10px] text-[#5a626a] mb-1">
                  <span>Kehadiran</span>
                  <span className="font-semibold text-[#111111]">{major.present}/{major.total} siswa</span>
                </div>
                <div className="w-full bg-[#f4f5f6] h-[3px] rounded-full overflow-hidden">
                  <div 
                    className="bg-[#006039] h-[3px] transition-all duration-500 rounded-full" 
                    style={{ width: `${major.rate}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        <StatsCard icon={Users} label="Total Siswa" value={dynamicSummary.total} color="blue" index={0} />
        <StatsCard icon={CheckCircle} label="Hadir" value={dynamicSummary.hadir + dynamicSummary.telat} color="green" index={1} />
        <StatsCard icon={Clock} label="Sakit" value={dynamicSummary.sakit} color="orange" index={2} />
        <StatsCard icon={AlertTriangle} label="Alfa" value={dynamicSummary.alfa} color="red" index={3} />
        <StatsCard icon={XCircle} label="Belum Absen" value={dynamicSummary.belum_absen} color="slate" index={4} />
      </motion.div>

      {/* Filters & Table */}
      <motion.div variants={itemVariants} className="space-y-4">
        {/* Cascade Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 bg-white p-4 rounded-xl border border-[#e2e8f0] items-end shadow-none">
          {/* 1. Filter Angkatan */}
          <div className="w-full">
            <label className="text-[11px] text-[#5a626a] uppercase tracking-[1.5px] font-semibold mb-1.5 block">Angkatan</label>
            <Select value={angkatanFilter} onValueChange={setAngkatanFilter}>
              <SelectTrigger className="bg-[#ffffff] border-[#e2e8f0] text-[#111111] rounded-md h-[40px] text-sm font-light focus:ring-1 focus:ring-[#006039] focus:border-[#006039] shadow-none">
                <SelectValue placeholder="Semua Tingkat" />
              </SelectTrigger>
              <SelectContent className="bg-[#ffffff] border-[#e2e8f0] rounded-md text-[#111111]">
                <SelectItem value="all">Semua Tingkat</SelectItem>
                {angkatanList.map((ang) => (
                  <SelectItem key={ang} value={ang}>Kelas {ang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Filter Jurusan */}
          <div className="w-full">
            <label className="text-[11px] text-[#5a626a] uppercase tracking-[1.5px] font-semibold mb-1.5 block">Jurusan</label>
            <Select value={jurusanFilter} onValueChange={setJurusanFilter}>
              <SelectTrigger className="bg-[#ffffff] border-[#e2e8f0] text-[#111111] rounded-md h-[40px] text-sm font-light focus:ring-1 focus:ring-[#006039] focus:border-[#006039] shadow-none">
                <SelectValue placeholder="Semua Jurusan" />
              </SelectTrigger>
              <SelectContent className="bg-[#ffffff] border-[#e2e8f0] rounded-md text-[#111111]">
                <SelectItem value="all">Semua Jurusan</SelectItem>
                {jurusanList.map((jur) => (
                  <SelectItem key={jur} value={jur}>{jur}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 3. Filter Kelas */}
          <div className="w-full">
            <label className="text-[11px] text-[#5a626a] uppercase tracking-[1.5px] font-semibold mb-1.5 block">Kelas</label>
            <Select value={kelasNumFilter} onValueChange={setKelasNumFilter}>
              <SelectTrigger className="bg-[#ffffff] border-[#e2e8f0] text-[#111111] rounded-md h-[40px] text-sm font-light focus:ring-1 focus:ring-[#006039] focus:border-[#006039] shadow-none">
                <SelectValue placeholder="Semua Kelas" />
              </SelectTrigger>
              <SelectContent className="bg-[#ffffff] border-[#e2e8f0] rounded-md text-[#111111]">
                <SelectItem value="all">Semua Kelas</SelectItem>
                {kelasList.map((k) => (
                  <SelectItem key={k} value={k}>Kelas {k}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* 4. Filter Status */}
          <div className="w-full">
            <label className="text-[11px] text-[#5a626a] uppercase tracking-[1.5px] font-semibold mb-1.5 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-[#ffffff] border-[#e2e8f0] text-[#111111] rounded-md h-[40px] text-sm font-light focus:ring-1 focus:ring-[#006039] focus:border-[#006039] shadow-none">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#ffffff] border-[#e2e8f0] rounded-md text-[#111111]">
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="hadir">Hadir</SelectItem>
                <SelectItem value="telat">Telat</SelectItem>
                <SelectItem value="sakit">Sakit</SelectItem>
                <SelectItem value="alfa">Alfa</SelectItem>
                <SelectItem value="belum_absen">Belum Absen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 5. Reset Filter Button */}
          <div className="w-full">
            <Button
              onClick={handleResetFilters}
              variant="outline"
              className="w-full h-[40px] rounded-md border-[#e2e8f0] hover:bg-[#f4f5f6] text-[#111111] font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-none"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Filter
            </Button>
          </div>
        </div>

        <MonitoringTable
          students={finalStudents}
          loading={loading}
          onUpdateStatus={handleUpdateStatus}
        />
      </motion.div>
    </motion.div>
  )
}
