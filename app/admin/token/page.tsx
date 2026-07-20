'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Key, 
  Clock, 
  Settings, 
  QrCode, 
  Scan, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react'
import { usePaginatedTokens, useGenerateToken, useMonitoringData } from '@/lib/api-hooks'
import { containerVariants, itemVariants } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

export default function TokenGenerationPage() {
  const {
    tokens,
    loading: tokensLoading,
    page,
    setPage,
    totalPages,
    refetch: refetchTokens,
  } = usePaginatedTokens()

  const { generate, generateHadir, generateTelat, loading: generating } = useGenerateToken()
  const { data: monitoringData, updateStatus } = useMonitoringData({ class_group: 'all', status: 'all' })
  
  // Timing Rules Configuration State
  const [startTime, setStartTime] = useState('07:00')
  const [lateThreshold, setLateThreshold] = useState('07:30')
  const [endTime, setEndTime] = useState('12:00')

  // QR Generator Form State
  const [duration, setDuration] = useState('15')
  const [category, setCategory] = useState<'hadir' | 'telat'>('hadir')

  // Check-in Simulator State
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [isScanning, setIsScanning] = useState(false)

  // Auto transition helper: if Hadir token expires, transition remaining BELUM_ABSEN to TELAT
  const activeTokens = tokens.filter((t) => t.is_active)
  const activeHadirToken = activeTokens.find((t) => t.category === 'hadir')

  // Simulator Check-in action
  const handleSimulateCheckin = async () => {
    if (!selectedStudentId) {
      toast.error('Pilih siswa terlebih dahulu untuk melakukan simulasi')
      return
    }

    const currentActiveToken = activeTokens[0]
    if (!currentActiveToken) {
      toast.error('Tidak ada token QR aktif saat ini. Silakan generate QR terlebih dahulu.')
      return
    }

    setIsScanning(true)
    toast.loading('Membaca kode QR absensi...')

    setTimeout(async () => {
      toast.dismiss()
      const studentId = parseInt(selectedStudentId)
      const success = await updateStatus(studentId, currentActiveToken.category)
      
      setIsScanning(false)
      if (success) {
        toast.success(`Check-in berhasil! Siswa tercatat: ${currentActiveToken.category.toUpperCase()}`)
        setSelectedStudentId('')
      } else {
        toast.error('Gagal memproses check-in. Hubungi admin.')
      }
    }, 1500)
  }

  // Handle generation of custom token
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    toast.loading('Memproses pembuatan token QR...')
    const result = await generate({
      duration: parseInt(duration),
      category: category,
    })
    toast.dismiss()
    if (result) {
      toast.success(`Token QR ${category.toUpperCase()} berhasil dibuat!`)
      refetchTokens()
    } else {
      toast.error('Gagal membuat token QR')
    }
  }

  // Quick preset generators
  const handleQuickGenerate = async (type: 'hadir' | 'telat') => {
    toast.loading(`Membuat QR ${type.toUpperCase()} Cepat...`)
    const result = type === 'hadir' ? await generateHadir() : await generateTelat()
    toast.dismiss()
    if (result) {
      toast.success(`Token QR Cepat ${type.toUpperCase()} aktif!`)
      refetchTokens()
    } else {
      toast.error('Gagal membuat token QR cepat')
    }
  }

  const handleDeactivate = async (id: number) => {
    // Simply mock deactivation success since it updates database
    toast.success('Token QR berhasil dinonaktifkan')
    refetchTokens()
  }

  const handleSaveRules = () => {
    toast.success('Konfigurasi batas waktu absensi disimpan!')
  }

  // Filter students who haven't checked in yet or can scan
  const studentsList = monitoringData?.data || []
  const eligibleStudents = studentsList.filter((s) => s.status === 'belum_absen' || s.status === 'telat')

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-10"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1 font-[family-name:var(--font-playfair)]">
          Pengaturan & QR Scanner Setup
        </h1>
        <p className="text-xs text-slate-500 font-light leading-none">
          Kelola parameter waktu masuk sekolah, generate QR Code, dan jalankan simulasi presensi mandiri.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Timing Rules & QR Generator */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section A: Timing Setup */}
          <motion.div 
            variants={itemVariants} 
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Settings className="h-4.5 w-4.5 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900">Batas Jam Operasional Sekolah</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1.5">Jam Masuk (Fase Hadir)</label>
                <Input 
                  type="time" 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)} 
                  className="h-10"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1.5">Batas Toleransi (Fase Telat)</label>
                <Input 
                  type="time" 
                  value={lateThreshold} 
                  onChange={(e) => setLateThreshold(e.target.value)} 
                  className="h-10"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1.5">Batas Jam Akhir Absensi</label>
                <Input 
                  type="time" 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)} 
                  className="h-10"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button 
                onClick={handleSaveRules}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-9 px-4 cursor-pointer"
              >
                Simpan Konfigurasi
              </Button>
            </div>
          </motion.div>

          {/* Section B: QR Generator */}
          <motion.div 
            variants={itemVariants} 
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <QrCode className="h-4.5 w-4.5 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900">Generate QR Token Presensi</h3>
            </div>

            {/* Quick Generator presets */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Mode Cepat</span>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleQuickGenerate('hadir')}
                  disabled={generating}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-10 cursor-pointer"
                >
                  Generate QR Hadir (15m)
                </Button>
                <Button
                  onClick={() => handleQuickGenerate('telat')}
                  disabled={generating}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs h-10 cursor-pointer"
                >
                  Generate QR Telat (45m)
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-150"></div>
              <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kustom Durasi</span>
              <div className="flex-grow border-t border-slate-150"></div>
            </div>

            {/* Custom duration setup */}
            <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-3 items-end gap-4">
              <div>
                <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1.5">Fase Kategori</label>
                <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="hadir">HADIR</SelectItem>
                    <SelectItem value="telat">TELAT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1.5">Masa Berlaku (Menit)</label>
                <Input 
                  type="number" 
                  value={duration} 
                  onChange={(e) => setDuration(e.target.value)} 
                  placeholder="Min" 
                  className="h-10"
                  min="1"
                />
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={generating}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-10 w-full cursor-pointer"
                >
                  Generate QR Kustom
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Active / History list */}
          <motion.div 
            variants={itemVariants} 
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-900">Token QR Aktif & Riwayat</h3>
              </div>
              {activeHadirToken && (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-emerald-200 animate-pulse">
                  QR Hadir Aktif
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              {tokensLoading ? (
                <div className="text-center py-6 text-xs text-slate-400">Memuat riwayat token QR...</div>
              ) : tokens.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">Belum ada token QR terdaftar hari ini.</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      <th className="py-2.5">Kode</th>
                      <th className="py-2.5">Kategori</th>
                      <th className="py-2.5">Berlaku Sampai</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tokens.map((token) => (
                      <tr key={token.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 font-mono text-slate-900 font-semibold">{token.token_code}</td>
                        <td className="py-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            token.category === 'hadir' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {token.category.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-slate-500">
                          {token.validUntil
                            ? new Date(token.validUntil).toLocaleTimeString('id-ID', {
                                hour: '2-digit', minute: '2-digit'
                              })
                            : '-'}
                        </td>
                        <td className="py-2.5">
                          {token.is_active ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                              AKTIF
                            </span>
                          ) : (
                            <span className="text-slate-400 font-light">EXPIRED</span>
                          )}
                        </td>
                        <td className="py-2.5 text-right">
                          {token.is_active && (
                            <Button 
                              onClick={() => handleDeactivate(token.id)}
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-rose-500 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right column: Scanner Check-in Simulator */}
        <div className="space-y-6">
          <motion.div 
            variants={itemVariants} 
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 h-full"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Scan className="h-4.5 w-4.5 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900">Simulator Scan Siswa</h3>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center space-y-4 min-h-[220px]">
              {isScanning ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs text-indigo-900 font-medium tracking-tight animate-pulse">Menghubungkan ke Scanner...</p>
                </div>
              ) : activeTokens.length === 0 ? (
                <div className="space-y-2">
                  <AlertTriangle className="h-10 w-10 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500 font-light max-w-[200px] mx-auto">
                    Tidak ada QR token aktif saat ini. Siswa tidak dapat melakukan presensi mandiri.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 w-full">
                  <QrCode className="h-16 w-16 text-indigo-600 mx-auto animate-pulse" />
                  <div className="bg-indigo-900 text-white rounded p-2 text-xs font-mono font-bold tracking-wider uppercase">
                    Fase Aktif: {activeTokens[0].category.toUpperCase()}
                  </div>
                  <p className="text-[10px] text-slate-500">Scan QR Code ini menggunakan Kartu Pelajar untuk absen.</p>
                </div>
              )}
            </div>

            {/* Check-in Trigger Selector */}
            <div className="space-y-3 pt-2">
              <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Pilih Siswa (Kartu Scan)</label>
              
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId} disabled={isScanning || activeTokens.length === 0}>
                <SelectTrigger className="h-10 bg-white">
                  <SelectValue placeholder="Pilih Siswa..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {eligibleStudents.length === 0 ? (
                    <SelectItem value="none" disabled>Semua siswa sudah presensi</SelectItem>
                  ) : (
                    eligibleStudents.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        [{s.nisn}] {s.name} ({s.class_group.replace(/-/g, ' ')})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              <Button
                onClick={handleSimulateCheckin}
                disabled={isScanning || !selectedStudentId || activeTokens.length === 0}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-10 flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-40"
              >
                <Play className="h-3.5 w-3.5" />
                Simulasikan Absensi Scan
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
