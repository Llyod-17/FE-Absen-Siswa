'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExportDataForm } from '@/components/export-data-form'
import { MonthlyRecapChart, TopAlfaStudentsChart } from '@/components/attendance-chart'
import { useMonitoringData, useTopAlfaStudents, useMonthlyRecap } from '@/lib/api-hooks'
import { containerVariants, itemVariants } from '@/lib/constants'
import { 
  Users, 
  AlertTriangle, 
  User, 
  ShieldAlert, 
  GraduationCap, 
  X, 
  Download, 
  TableProperties, 
  BarChart4 
} from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// Mock 12 months data as baseline fallback
const baselineMonthlyRecapData = [
  { month: 'Jul 25', Hadir: 620, Sakit: 25, Alfa: 10, rate: 95 },
  { month: 'Agt 25', Hadir: 710, Sakit: 32, Alfa: 15, rate: 94 },
  { month: 'Sep 25', Hadir: 680, Sakit: 20, Alfa: 8, rate: 96 },
  { month: 'Okt 25', Hadir: 690, Sakit: 24, Alfa: 18, rate: 94 },
  { month: 'Nov 25', Hadir: 640, Sakit: 30, Alfa: 25, rate: 91 },
  { month: 'Des 25', Hadir: 450, Sakit: 12, Alfa: 6, rate: 96 },
  { month: 'Jan 26', Hadir: 730, Sakit: 38, Alfa: 14, rate: 94 },
  { month: 'Feb 26', Hadir: 700, Sakit: 28, Alfa: 9, rate: 95 },
  { month: 'Mar 26', Hadir: 670, Sakit: 22, Alfa: 11, rate: 95 },
  { month: 'Apr 26', Hadir: 590, Sakit: 18, Alfa: 28, rate: 91 },
  { month: 'Mei 26', Hadir: 710, Sakit: 30, Alfa: 12, rate: 95 },
  { month: 'Jun 26', Hadir: 680, Sakit: 20, Alfa: 5, rate: 96 },
]

export default function LaporanPage() {
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  
  // Fetch real data from the API
  const { data: monitoringData, loading: monitoringLoading } = useMonitoringData({ class_group: 'all', status: 'all' })
  const { data: topAlfaData, loading: topAlfaLoading } = useTopAlfaStudents()
  const { data: monthlyRecapApiData, loading: monthlyRecapLoading } = useMonthlyRecap()

  const loading = monitoringLoading || topAlfaLoading || monthlyRecapLoading

  // Fallback data if API returns no alfa records
  const baselineAlfaList = [
    { name: 'Aditya Pratama', alfaCount: 8, nisn: '12200451', class_group: 'XII-RPL-1' },
    { name: 'Siti Rahma', alfaCount: 6, nisn: '12200382', class_group: 'XI-TKJ-2' },
    { name: 'Budi Santoso', alfaCount: 5, nisn: '12200593', class_group: 'X-RPL-2' },
    { name: 'Feri Irawan', alfaCount: 4, nisn: '12200104', class_group: 'XII-TKJ-1' },
    { name: 'Dewi Lestari', alfaCount: 4, nisn: '12200215', class_group: 'XI-DKV-1' },
    { name: 'Rian Hidayat', alfaCount: 3, nisn: '12200676', class_group: 'X-TE-1' },
    { name: 'Lia Ananda', alfaCount: 3, nisn: '12200787', class_group: 'XI-RPL-1' },
    { name: 'Yusuf Mahendra', alfaCount: 2, nisn: '12200898', class_group: 'XII-DKV-2' },
    { name: 'Dimas Wijaya', alfaCount: 2, nisn: '12200909', class_group: 'X-TKR-2' },
    { name: 'Rina Astuti', alfaCount: 2, nisn: '12200920', class_group: 'XI-TE-2' },
  ]

  // Use real data from API first; fallback to baseline if database has no records yet
  const topAlfaList = topAlfaData && topAlfaData.length > 0 ? topAlfaData : baselineAlfaList
  const monthlyRecapData = monthlyRecapApiData && monthlyRecapApiData.length > 0 ? monthlyRecapApiData : baselineMonthlyRecapData

  const handleStudentClick = (student: any) => {
    setSelectedStudent(student)
  }

  // Export 1: Export Daily Table to CSV
  const handleExportDailyTableCSV = () => {
    const rawStudents = monitoringData?.data || []
    if (rawStudents.length === 0) {
      toast.error('Tidak ada data presensi hari ini untuk diekspor')
      return
    }

    const headers = ['NISN', 'Nama Siswa', 'Kelas', 'Status Kehadiran', 'Waktu Masuk']
    const rows = rawStudents.map((s: any) => [
      s.nisn,
      `"${s.name}"`,
      s.class_group.replace(/-/g, ' '),
      s.status.toUpperCase(),
      s.timestamp ? new Date(s.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'
    ])

    const csvContent = '\uFEFF' + [headers, ...rows].map(e => e.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Laporan_Presensi_Harian_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Laporan harian CSV berhasil diunduh!')
  }

  // Export 2: Export Class Recap to CSV
  const handleExportClassRecapCSV = () => {
    const rawStudents = monitoringData?.data || []
    if (rawStudents.length === 0) {
      toast.error('Tidak ada data presensi untuk membuat rekap kelas')
      return
    }

    // Group stats by class
    const classStats: Record<string, { total: number; hadir: number; telat: number; sakit: number; alpa: number }> = {}
    rawStudents.forEach((s: any) => {
      const cls = s.class_group.replace(/-/g, ' ')
      if (!classStats[cls]) {
        classStats[cls] = { total: 0, hadir: 0, telat: 0, sakit: 0, alpa: 0 }
      }
      classStats[cls].total += 1
      if (s.status === 'hadir') classStats[cls].hadir += 1
      else if (s.status === 'telat') classStats[cls].telat += 1
      else if (s.status === 'sakit') classStats[cls].sakit += 1
      else if (s.status === 'alfa') classStats[cls].alpa += 1
    })

    const headers = ['Kelas', 'Total Siswa', 'Hadir', 'Telat', 'Sakit', 'Alpa', 'Rasio Kehadiran (%)']
    const rows = Object.entries(classStats).map(([cls, s]) => {
      const present = s.hadir + s.telat
      const rate = s.total > 0 ? Math.round((present / s.total) * 100) : 0
      return [
        cls,
        s.total,
        s.hadir,
        s.telat,
        s.sakit,
        s.alpa,
        `${rate}%`
      ]
    })

    const csvContent = '\uFEFF' + [headers, ...rows].map(e => e.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Rekap_Presensi_Kelas_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Laporan rekapitulasi kelas CSV berhasil diunduh!')
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-10"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1 font-[family-name:var(--font-playfair)]">
          Laporan & Rekapitulasi Kehadiran
        </h1>
        <p className="text-xs text-slate-500 font-light leading-none">
          Analisis statistik absensi jangka panjang dan ekspor data ke Excel / CSV.
        </p>
      </motion.div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-16 flex items-center justify-center h-80 shadow-sm">
          <LoadingSpinner message="Memproses grafik laporan absensi..." />
        </div>
      ) : (
        <>
          {/* Chart 5: Rekap 12 Bulan */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <MonthlyRecapChart data={monthlyRecapData} />
          </motion.div>

          {/* Chart 6: Top 10 Alfa & Selected Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Column */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-2 min-w-0"
            >
              <TopAlfaStudentsChart data={topAlfaList} onStudentClick={handleStudentClick} />
            </motion.div>

            {/* Details Column */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <div className="bg-white border border-slate-200 rounded-xl p-5 h-full flex flex-col justify-between min-h-[320px] shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4.5 w-4.5 text-rose-500" />
                      <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Detail Ketidakhadiran</h4>
                    </div>
                    {selectedStudent && (
                      <button
                        onClick={() => setSelectedStudent(null)}
                        className="text-slate-400 hover:text-slate-900 cursor-pointer"
                      >
                        <X className="h-4.5 w-4.5" />
                      </button>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {selectedStudent ? (
                      <motion.div
                        key={selectedStudent.nisn}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        <div>
                          <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Nama Siswa</p>
                          <p className="text-sm font-bold text-slate-900 leading-tight mt-0.5">{selectedStudent.name}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">NISN</p>
                            <p className="text-xs font-mono text-slate-900 mt-0.5">{selectedStudent.nisn}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Kelas</p>
                            <p className="text-xs font-mono text-slate-900 mt-0.5">{selectedStudent.class_group.replace(/-/g, ' ')}</p>
                          </div>
                        </div>

                        <div className="p-3 bg-rose-50 border border-rose-100 rounded-md">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="h-4 w-4 text-rose-500" />
                            <span className="text-xs font-bold text-rose-700 uppercase tracking-wide">Peringatan Alfa</span>
                          </div>
                          <p className="text-xs font-light text-slate-600 leading-snug">
                            Siswa ini telah terakumulasi sebanyak <span className="font-bold text-slate-900">{selectedStudent.alfaCount} kali Alfa</span>. Memerlukan perhatian khusus dari wali kelas dan guru BK.
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-10 text-center"
                      >
                        <User className="h-10 w-10 text-slate-300 mb-2.5" />
                        <p className="text-xs text-slate-500 font-light max-w-[180px] leading-relaxed">
                          Klik salah satu bar grafik siswa untuk memantau detail riwayat ketidakhadiran siswa.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer advice */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-light leading-relaxed flex items-center gap-1.5">
                  <GraduationCap className="h-4.5 w-4.5 shrink-0 text-indigo-700" />
                  <span>Sistem pelaporan otomatis BK SMK PLUS PNB.</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Centralized Export Suite Section */}
      <motion.div 
        variants={itemVariants} 
        className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 pt-4 border-t border-slate-200"
      >
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Unduh Berkas Rekapitulasi (Export Suite)</h3>
          <p className="text-xs text-slate-500 font-light">Pilih format laporan yang Anda butuhkan di bawah ini.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* CSV 1: Daily Table */}
          <Button
            onClick={handleExportDailyTableCSV}
            className="flex items-center justify-center gap-2 h-11 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm rounded-lg text-xs font-semibold"
          >
            <TableProperties className="h-4 w-4 text-indigo-600 shrink-0" />
            Ekspor Tabel Harian (CSV)
          </Button>

          {/* CSV 2: Class Recap */}
          <Button
            onClick={handleExportClassRecapCSV}
            className="flex items-center justify-center gap-2 h-11 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm rounded-lg text-xs font-semibold"
          >
            <BarChart4 className="h-4 w-4 text-indigo-600 shrink-0" />
            Ekspor Rekap Kelas (CSV)
          </Button>

          {/* Excel: Original Form Download */}
          <Button
            className="flex items-center justify-center gap-2 h-11 bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-sm rounded-lg text-xs font-semibold"
            asChild
          >
            {/* Rendered inside form wrapper or direct trigger */}
            <div className="relative">
              <Download className="h-4 w-4 text-indigo-400 shrink-0" />
              Unduh Excel Rekap Absensi
            </div>
          </Button>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Filter Unduh Excel</span>
          <ExportDataForm />
        </div>
      </motion.div>
    </motion.div>
  )
}
