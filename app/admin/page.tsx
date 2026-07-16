'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAttendanceStats, useMonitoringData } from '@/lib/api-hooks'

/* ── helpers ── */
function formatDate() {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

type StatusVariant = 'hadir' | 'telat' | 'sakit' | 'alpa' | 'belum'

function statusVariant(status: string): StatusVariant {
  const s = status?.toLowerCase() ?? ''
  if (s === 'hadir') return 'hadir'
  if (s === 'telat' || s === 'terlambat') return 'telat'
  if (s === 'sakit' || s === 'izin') return 'sakit'
  if (s === 'alpa' || s === 'alfa') return 'alpa'
  return 'belum'
}

function statusLabel(status: string) {
  const v = statusVariant(status)
  if (v === 'hadir') return 'Hadir'
  if (v === 'telat') return 'Telat'
  if (v === 'sakit') return 'Sakit'
  if (v === 'alpa') return 'Alpa'
  return 'Belum Absen'
}

/* ── Stat Card ── */
const statCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const },
  }),
}

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  accentColor: string
  index: number
  extra?: React.ReactNode
  pulse?: boolean
}

function StatCard({ label, value, icon, accentColor, index, extra, pulse }: StatCardProps) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={statCardVariants}
      className="bg-card rounded-xl p-5 border border-border shadow-sm relative overflow-hidden flex flex-col justify-between"
      style={{ borderTopWidth: 4, borderTopColor: accentColor }}
    >
      {pulse && (
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-[var(--status-alpa)] rounded-full animate-ping opacity-75" />
      )}
      <div className="flex justify-between items-start relative z-10">
        <div className="text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground font-sans">
          {label}
        </div>
        <div style={{ color: accentColor }}>{icon}</div>
      </div>
      <div className="mt-4 flex items-end justify-between relative z-10">
        <div className="text-4xl font-bold font-sans text-foreground">{value}</div>
        {extra}
      </div>
    </motion.div>
  )
}

/* ── Page ── */
export default function DashboardPage() {
  const { stats, loading: statsLoading } = useAttendanceStats()
  const [filters] = useState<{ class_group?: string; status?: string }>({})
  const { data: monitoringRaw, loading: monitoringLoading, updateStatus } = useMonitoringData(filters)
  const [search, setSearch] = useState('')
  const [angkatanFilter, setAngkatanFilter] = useState('Semua Angkatan')
  const [classFilter, setClassFilter] = useState('')

  const totalHadir = (stats?.totalHadir ?? 0) + (stats?.totalTelat ?? 0)
  const totalSakit = stats?.totalSakit ?? 0
  const totalAlpa = stats?.totalAlfa ?? 0
  const totalStudents = stats?.todayAttendance ?? 0

  const monitoringData = monitoringRaw?.data ?? []

  const filteredData = monitoringData.filter((s: { name?: string; nisn?: string; class_group?: string }) => {
    const name = (s.name ?? '').toLowerCase()
    const nisn = (s.nisn ?? '').toLowerCase()
    const kelas = s.class_group ?? ''

    let matchAngkatan = true
    if (angkatanFilter === 'Kelas X') matchAngkatan = kelas.startsWith('X-')
    if (angkatanFilter === 'Kelas XI') matchAngkatan = kelas.startsWith('XI-')
    if (angkatanFilter === 'Kelas XII') matchAngkatan = kelas.startsWith('XII-')

    const matchSearch = !search || name.includes(search.toLowerCase()) || nisn.includes(search.toLowerCase())
    const matchClass = !classFilter || kelas === classFilter
    return matchSearch && matchClass && matchAngkatan
  })

  const handleStatusChange = async (userId: number, status: string) => {
    await updateStatus(userId, status)
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Welcome */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary tracking-tight leading-tight">
            Selamat Datang, Admin
          </h2>
          <p className="text-base text-muted-foreground mt-1 font-sans">
            Ringkasan presensi harian siswa hari ini.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border border-border shadow-sm">
          <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
          <span className="text-sm font-semibold text-foreground font-sans">{formatDate()}</span>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Siswa"
          value={monitoringLoading ? '...' : (monitoringRaw?.summary?.total ?? 0).toLocaleString('id-ID')}
          icon={<span className="material-symbols-outlined text-[22px]">school</span>}
          accentColor="var(--border)"
          index={0}
        />
        <StatCard
          label="Total Absen Hari Ini"
          value={statsLoading ? '...' : totalStudents.toLocaleString('id-ID')}
          icon={<span className="material-symbols-outlined text-[22px]">groups</span>}
          accentColor="var(--border)"
          index={1}
        />
        <StatCard
          label="Hadir & Telat"
          value={statsLoading ? '...' : totalHadir.toLocaleString('id-ID')}
          icon={<span className="material-symbols-outlined text-[22px]">how_to_reg</span>}
          accentColor="var(--status-hadir-text)"
          index={2}
          extra={
            !statsLoading ? (
              <div className="flex flex-col text-right">
                <span className="text-[12px] font-semibold" style={{ color: 'var(--status-hadir-text)' }}>
                  +{stats?.totalHadir ?? 0} Tepat
                </span>
                <span className="text-[12px] font-semibold" style={{ color: 'var(--status-telat-text)' }}>
                  +{stats?.totalTelat ?? 0} Telat
                </span>
              </div>
            ) : undefined
          }
        />
        <StatCard
          label="Alpa"
          value={statsLoading ? '...' : totalAlpa.toLocaleString('id-ID')}
          icon={<span className="material-symbols-outlined text-[22px]">person_off</span>}
          accentColor="var(--primary)"
          index={3}
          pulse={totalAlpa > 0}
          extra={
            totalAlpa > 0 ? (
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-[var(--status-alpa)] px-2 py-1 rounded font-sans">
                Perlu Perhatian
              </span>
            ) : undefined
          }
        />
      </section>

      {/* Attendance Table */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
      >
        {/* Table Header & Filters */}
        <div className="p-4 border-b border-border bg-background flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold font-sans text-foreground">
            Presensi Harian Siswa (Hari Ini)
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[18px]">search</span>
              <Input
                placeholder="Cari NISN atau Nama..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={angkatanFilter}
              onChange={(e) => { setAngkatanFilter(e.target.value); setClassFilter('') }}
              className="w-full sm:w-36 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary cursor-pointer font-sans"
            >
              <option>Semua Angkatan</option>
              <option>Kelas X</option>
              <option>Kelas XI</option>
              <option>Kelas XII</option>
            </select>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full sm:w-32 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary cursor-pointer font-sans"
            >
              <option value="">Semua Kelas</option>
              {Array.from(new Set(monitoringData.map((s) => s.class_group))).filter(Boolean).filter(k => {
                const kStr = k as string;
                if (angkatanFilter === 'Kelas X') return kStr.startsWith('X-')
                if (angkatanFilter === 'Kelas XI') return kStr.startsWith('XI-')
                if (angkatanFilter === 'Kelas XII') return kStr.startsWith('XII-')
                return true
              }).map((k) => (
                <option key={k as string} value={k as string}>{k as string}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-accent text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground border-b border-border font-sans">
                <th className="p-4 w-12 text-center">
                  <input type="checkbox" className="rounded border-border text-primary focus:ring-primary cursor-pointer" />
                </th>
                <th className="p-4">NISN</th>
                <th className="p-4">Nama Siswa</th>
                <th className="p-4">Kelas</th>
                <th className="p-4">Waktu</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="text-sm font-sans">
              {monitoringLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.slice(0, 10).map((student) => {
                  const id = student.id
                  const name = student.name ?? '-'
                  const nisn = student.nisn ?? '-'
                  const kelas = student.class_group ?? '-'
                  const waktu = student.timestamp ? new Date(student.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'
                  const status = student.status ?? 'belum_absen'
                  const variant = statusVariant(status)

                  return (
                    <tr
                      key={id}
                      className={`border-b border-border transition-colors ${
                        variant === 'telat'
                          ? 'bg-[var(--status-telat)]/20 hover:bg-[var(--status-telat)]/40'
                          : variant === 'alpa'
                          ? 'bg-[var(--status-alpa)]/20 hover:bg-[var(--status-alpa)]/40'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input type="checkbox" className="rounded border-border text-primary focus:ring-primary cursor-pointer" />
                      </td>
                      <td className="p-4 font-mono text-sm text-muted-foreground">{nisn}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent text-foreground flex items-center justify-center font-bold text-xs uppercase font-sans">
                            {getInitials(name)}
                          </div>
                          <span className="font-semibold text-foreground">{name}</span>
                        </div>
                      </td>
                      <td className="p-4">{kelas}</td>
                      <td className="p-4 text-muted-foreground font-mono">{waktu}</td>
                      <td className="p-4">
                        <Badge variant={variant}>{statusLabel(status)}</Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {(['hadir', 'sakit', 'alfa'] as const).map((s) => {
                            const hoverBg = s === 'hadir' ? 'hover:bg-[var(--status-hadir)]' : s === 'sakit' ? 'hover:bg-[var(--status-sakit)]' : 'hover:bg-[var(--status-alpa)]'
                            const hoverText = s === 'hadir' ? 'hover:text-[var(--status-hadir-text)]' : s === 'sakit' ? 'hover:text-[var(--status-sakit-text)]' : 'hover:text-primary'
                            return (
                              <button
                                key={s}
                                onClick={() => handleStatusChange(id, s)}
                                title={`Set ${s.charAt(0).toUpperCase() + s.slice(1)}`}
                                className={`w-8 h-8 rounded-lg bg-accent text-muted-foreground text-xs font-bold transition-colors flex items-center justify-center ${hoverBg} ${hoverText}`}
                              >
                                {s[0].toUpperCase()}
                              </button>
                            )
                          })}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border bg-background flex justify-between items-center text-sm text-muted-foreground font-sans">
          <span>
            Menampilkan 1-{Math.min(10, filteredData.length)} dari {filteredData.length} siswa
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Sebelumnya
            </Button>
            <Button size="sm">
              Selanjutnya
            </Button>
          </div>
        </div>
      </motion.section>
    </div>
  )
}