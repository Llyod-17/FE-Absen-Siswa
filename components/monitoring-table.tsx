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
import { Edit2, Loader2, Check, X } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface MonitoringTableProps {
  students: StudentAttendance[]
  loading: boolean
  onUpdateStatus: (id: number, newStatus: string) => Promise<boolean>
}

export function MonitoringTable({ students, loading, onUpdateStatus }: MonitoringTableProps) {
  const [editingNisn, setEditingNisn] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdating(true)
    const success = await onUpdateStatus(id, newStatus)
    if (success) {
      setEditingNisn(null)
    }
    setUpdating(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-[#e2e8f0] shadow-none">
        <LoadingSpinner message="Memuat data kehadiran..." />
      </div>
    )
  }

  // Filter out any student with "izin" just to be safe, but they should be mapped anyway
  const activeStudents = students.filter(s => (s.status as string) !== 'izin')

  if (!activeStudents || activeStudents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-[#e2e8f0] shadow-none">
        <p className="text-[#5a626a] font-light text-sm">Tidak ada data siswa ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-none">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#f4f5f6] border-b border-[#e2e8f0]">
            <tr>
              <th className="px-5 py-4.5 text-[11px] font-semibold text-[#5a626a] uppercase tracking-[1.5px] font-mono">NISN</th>
              <th className="px-5 py-4.5 text-[11px] font-semibold text-[#5a626a] uppercase tracking-[1.5px]">Nama Siswa</th>
              <th className="px-5 py-4.5 text-[11px] font-semibold text-[#5a626a] uppercase tracking-[1.5px] font-mono">Kelas</th>
              <th className="px-5 py-4.5 text-[11px] font-semibold text-[#5a626a] uppercase tracking-[1.5px]">Waktu Absen</th>
              <th className="px-5 py-4.5 text-[11px] font-semibold text-[#5a626a] uppercase tracking-[1.5px] text-center">Status</th>
              <th className="px-5 py-4.5 text-[11px] font-semibold text-[#5a626a] uppercase tracking-[1.5px] text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0]">
            {activeStudents.map((student, idx) => {
              const isEditing = editingNisn === student.nisn
              const statColor = STATUS_COLORS[student.status] || STATUS_COLORS.belum_absen
              const statLabel = STATUS_LABELS[student.status] || 'UNKNOWN'

              return (
                <motion.tr
                  key={student.nisn}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                  className="hover:bg-[#e9ecef]/30 transition-colors"
                >
                  <td className="px-5 py-4 text-sm font-mono text-[#5a626a]">{student.nisn}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-[#111111]">{student.name}</td>
                  <td className="px-5 py-4 text-sm font-mono text-[#5a626a]">{student.class_group}</td>
                  <td className="px-5 py-4 text-xs font-light text-[#5a626a]">
                    {student.timestamp ? new Date(student.timestamp).toLocaleTimeString('id-ID', {
                      hour: '2-digit', minute: '2-digit', second: '2-digit'
                    }) : '-'}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-2">
                        <Select
                          disabled={updating}
                          defaultValue={(student.status as string) === 'izin' ? 'sakit' : student.status}
                          onValueChange={(val) => handleStatusChange(student.id, val)}
                        >
                          <SelectTrigger className="w-[120px] h-[36px] text-xs font-medium bg-[#ffffff] border-[#e2e8f0] rounded-md text-[#111111] focus:ring-1 focus:ring-[#c63535] focus:border-[#c63535]">
                            <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#ffffff] border-[#e2e8f0] rounded-md text-[#111111]">
                            <SelectItem value="hadir">Hadir</SelectItem>
                            <SelectItem value="telat">Telat</SelectItem>
                            <SelectItem value="sakit">Sakit</SelectItem>
                            <SelectItem value="alfa">Alfa</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-[36px] w-[36px] text-[#c63535] hover:bg-[#c63535]/10 rounded-md shrink-0 border border-transparent"
                          onClick={() => setEditingNisn(null)}
                          disabled={updating}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold tracking-[1.5px] uppercase ${statColor}`}>
                        {statLabel}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {!isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingNisn(student.nisn)}
                        className="h-9 text-xs font-semibold text-[#c63535] hover:text-[#a32a2a] hover:bg-[#c63535]/10 px-3 rounded-md border border-transparent cursor-pointer"
                      >
                        <Edit2 className="h-3 w-3 mr-1.5 shrink-0" />
                        Ubah
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
