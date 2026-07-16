'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useMonthlyRecap,
  useTopAlfaStudents,
  useExportData,
  useAvailableClasses,
} from '@/lib/api-hooks'
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts'

export default function LaporanPage() {
  const { data: monthlyData, loading: monthlyLoading } = useMonthlyRecap()
  const { data: topAlfaData, loading: topAlfaLoading } = useTopAlfaStudents()
  const { exportToExcel, loading: exportLoading } = useExportData()
  const { classes } = useAvailableClasses()

  const [filterJurusan, setFilterJurusan] = useState('')
  const [filterKelas, setFilterKelas] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleExportDaily = async () => {
    await exportToExcel({ exportType: 'daily' })
  }

  const handleExportCustom = async () => {
    await exportToExcel({
      exportType: 'recap',
      classId: filterKelas,
      departmentId: filterJurusan,
      startDate: startDate,
    })
  }

  // Transform monthly data for Recharts
  const chartData = monthlyData.map(item => ({
    name: item.month,
    Hadir: item.Hadir || 0,
    TidakHadir: (item.Alfa || 0) + (item.Sakit || 0) + (item.Izin || 0),
  }))

  const topStudent = topAlfaData.length > 0 ? topAlfaData[0] : null

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
            Laporan & Rekapitulasi Kehadiran
          </h2>
          <p className="text-base text-muted-foreground mt-1 font-sans">
            Analisis komprehensif kehadiran siswa, tren bulanan, dan opsi ekspor data administratif.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
        {/* Monthly Recap Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="md:col-span-12 lg:col-span-8 bg-card rounded-xl shadow-sm border border-border p-6 flex flex-col relative overflow-hidden"
          style={{ borderTopWidth: 4, borderTopColor: '#a0f1be' }}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">Tren Kehadiran Bulanan</h2>
              <p className="text-sm text-muted-foreground font-sans">Persentase kehadiran vs ketidakhadiran (Tahun Ajaran Berjalan)</p>
            </div>
            <select className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary font-sans cursor-pointer">
              <option>2023/2024</option>
              <option>2022/2023</option>
            </select>
          </div>
          
          <div className="flex-1 w-full relative min-h-[350px]">
            {monthlyLoading ? (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">Memuat grafik...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontFamily: 'Inter', fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontFamily: 'Inter', fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', fontFamily: 'Inter' }}
                    itemStyle={{ fontFamily: 'Courier Prime' }}
                  />
                  <Legend wrapperStyle={{ fontFamily: 'Inter', fontSize: '12px', paddingTop: '20px' }} />
                  <Bar dataKey="Hadir" name="Hadir (%)" fill="#a0f1be" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="TidakHadir" name="Tidak Hadir (%)" fill="var(--status-alpa-text)" radius={[4, 4, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Export Suite & Filter */}
        <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Export Suite */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-card rounded-xl shadow-sm border border-border p-6 flex flex-col relative"
            style={{ borderTopWidth: 4, borderTopColor: 'var(--primary)' }}
          >
            <h2 className="font-serif text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">download</span>
              Export Data
            </h2>
            <Button
              variant="outline"
              onClick={handleExportDaily}
              disabled={exportLoading}
              className="w-full justify-center gap-2 font-sans font-semibold tracking-[0.05em] uppercase text-xs h-11"
            >
              <span className="material-symbols-outlined text-[16px]">table_chart</span>
              Ekspor Tabel Harian (CSV)
            </Button>
          </motion.div>

          {/* Export Filter Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-card rounded-xl shadow-sm border border-border p-6 flex flex-col relative flex-1"
          >
            <h2 className="font-serif text-xl font-bold text-foreground mb-1">Filter Khusus</h2>
            <p className="text-sm text-muted-foreground mb-5 font-sans">Atur parameter untuk Excel Rekap</p>
            
            <form className="flex flex-col gap-4 flex-1 font-sans">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground mb-1.5">Jurusan</label>
                <select
                  value={filterJurusan}
                  onChange={(e) => setFilterJurusan(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer transition-shadow"
                >
                  <option value="">Semua Jurusan</option>
                  <option value="TKJ">Teknik Komputer Jaringan</option>
                  <option value="AK">Akuntansi</option>
                  <option value="RPL">Rekayasa Perangkat Lunak</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground mb-1.5">Kelas</label>
                <select
                  value={filterKelas}
                  onChange={(e) => setFilterKelas(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer transition-shadow"
                >
                  <option value="">Semua Kelas</option>
                  {(classes ?? []).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground mb-1.5">Mulai</label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground mb-1.5">Sampai</label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              
              <Button
                type="button"
                onClick={handleExportCustom}
                disabled={exportLoading}
                className="mt-auto w-full bg-[#006039] hover:bg-[#005230] text-white font-semibold tracking-[0.05em] uppercase text-xs h-11 gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">table_view</span>
                Unduh Excel Rekap
              </Button>
            </form>
          </motion.div>
        </div>

        {/* Top 10 Siswa Alpa */}
        <div className="md:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="lg:col-span-2 bg-card rounded-xl shadow-sm border border-border p-6 relative overflow-hidden"
            style={{ borderTopWidth: 4, borderTopColor: 'var(--status-alpa-text)' }}
          >
            <h2 className="font-serif text-xl font-bold text-foreground mb-1">Top 10 Siswa Alpa Terbanyak</h2>
            <p className="text-sm text-muted-foreground mb-6 font-sans">Akumulasi ketidakhadiran tanpa keterangan semester ini.</p>
            
            <div className="w-full h-[350px]">
              {topAlfaLoading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">Memuat data...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topAlfaData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                    <XAxis type="number" tick={{ fontFamily: 'Inter', fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontFamily: 'Inter', fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', fontFamily: 'Inter' }}
                      itemStyle={{ fontFamily: 'Courier Prime' }}
                      cursor={{ fill: 'var(--muted)' }}
                    />
                    <Bar dataKey="alfaCount" name="Hari Alpa" fill="var(--status-alpa-text)" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="lg:col-span-1 bg-card rounded-xl shadow-sm border border-border p-6 flex flex-col"
          >
            {topStudent ? (
              <>
                <div className="flex items-center gap-4 mb-5 pb-5 border-b border-border">
                  <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center font-bold text-lg font-sans border border-border">
                    {topStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-foreground">{topStudent.name}</h3>
                    <p className="font-mono text-xs text-muted-foreground mt-0.5">NISN: {topStudent.nisn} • {topStudent.class_group}</p>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[var(--status-alpa)]/20 p-4 rounded-xl border border-[var(--status-alpa-text)]/20">
                      <span className="block text-xs font-semibold uppercase tracking-[0.05em] text-[var(--status-alpa-text)] mb-1 font-sans">Total Alpa</span>
                      <div className="font-sans text-3xl font-bold text-[var(--status-alpa-text)]">
                        {topStudent.alfaCount} <span className="text-sm font-normal">hari</span>
                      </div>
                    </div>
                    <div className="bg-[var(--status-telat)]/20 p-4 rounded-xl border border-[var(--status-telat-text)]/20">
                      <span className="block text-xs font-semibold uppercase tracking-[0.05em] text-[var(--status-telat-text)] mb-1 font-sans">Total Telat</span>
                      <div className="font-sans text-3xl font-bold text-[var(--status-telat-text)]">
                        5 <span className="text-sm font-normal">hari</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto pt-5 border-t border-border">
                  <Button variant="outline" className="w-full font-semibold uppercase tracking-[0.05em] text-xs h-10">
                    Lihat Profil
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center">
                <span className="material-symbols-outlined text-[32px] mb-3 opacity-20">warning</span>
                <p>Belum ada data siswa</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
