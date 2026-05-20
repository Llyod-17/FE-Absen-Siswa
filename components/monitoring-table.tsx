'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { StudentAttendance } from '@/lib/types'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Edit2, Loader2, Check } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface MonitoringTableProps {
  students: StudentAttendance[]
  loading: boolean
  onUpdateStatus: (nisn: string, newStatus: string) => Promise<boolean>
}

export function MonitoringTable({ students, loading, onUpdateStatus }: MonitoringTableProps) {
  const [editingNisn, setEditingNisn] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  const handleStatusChange = async (nisn: string, newStatus: string) => {
    setUpdating(true)
    const success = await onUpdateStatus(nisn, newStatus)
    if (success) {
      setEditingNisn(null)
    }
    setUpdating(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
        <LoadingSpinner message="Memuat data siswa..." />
      </div>
    )
  }

  if (!students || students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
        <p className="text-slate-400">Tidak ada data siswa ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-700/50">
            <tr>
              <th className="px-3 py-3 sm:px-6 sm:py-4 font-medium">NISN</th>
              <th className="px-3 py-3 sm:px-6 sm:py-4 font-medium">Nama Siswa</th>
              <th className="px-3 py-3 sm:px-6 sm:py-4 font-medium">Kelas</th>
              <th className="px-3 py-3 sm:px-6 sm:py-4 font-medium">Waktu Absen</th>
              <th className="px-3 py-3 sm:px-6 sm:py-4 font-medium text-center">Status</th>
              <th className="px-3 py-3 sm:px-6 sm:py-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {students.map((student, idx) => {
              const isEditing = editingNisn === student.nisn
              const statColor = STATUS_COLORS[student.status] || STATUS_COLORS.belum_absen
              const statLabel = STATUS_LABELS[student.status] || 'UNKNOWN'

              return (
                <motion.tr
                  key={student.nisn}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-3 py-3 sm:px-6 sm:py-4 font-medium text-slate-300 text-xs sm:text-sm">{student.nisn}</td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4 text-white font-semibold text-xs sm:text-sm">{student.name}</td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4 text-slate-400 text-xs sm:text-sm">{student.class_group}</td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4 text-slate-400 text-xs sm:text-sm">
                    {student.timestamp ? new Date(student.timestamp).toLocaleTimeString('id-ID', {
                      hour: '2-digit', minute: '2-digit'
                    }) : '-'}
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4 text-center">
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                        <Select
                          disabled={updating}
                          defaultValue={student.status}
                          onValueChange={(val) => handleStatusChange(student.nisn, val)}
                        >
                          <SelectTrigger className="w-[100px] sm:w-[130px] h-8 text-[10px] sm:text-xs bg-slate-800 border-slate-600 focus:ring-blue-500">
                            <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="sakit">Sakit</SelectItem>
                            <SelectItem value="izin">Izin</SelectItem>
                            <SelectItem value="alfa">Alfa</SelectItem>
                            <SelectItem value="hadir">Hadir</SelectItem>
                            <SelectItem value="telat">Telat</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 hover:text-white shrink-0"
                          onClick={() => setEditingNisn(null)}
                          disabled={updating}
                        >
                          {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </Button>
                      </div>
                    ) : (
                      <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold tracking-widest uppercase border ${statColor}`}>
                        {statLabel}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4 text-right">
                    {!isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingNisn(student.nisn)}
                        className="h-8 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 px-2 sm:px-3"
                      >
                        <Edit2 className="h-3 w-3 sm:mr-1.5 shrink-0" />
                        <span className="hidden sm:inline">Ubah</span>
                      </Button>
                    )}
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
