'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Check, Edit2, X, AlertCircle } from 'lucide-react'
import { AVAILABLE_CLASSES, STATUS_LIST, STATUS_COLORS, STATUS_LABELS } from '@/lib/constants'
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

export interface StudentAttendance {
  id: number
  nisn: string
  name: string
  class_group: string
  status: 'hadir' | 'telat' | 'sakit' | 'alfa' | 'belum_absen'
  timestamp?: string
  remarks?: string
}

interface AdvancedAttendanceTableProps {
  students: StudentAttendance[]
  loading: boolean
  onUpdateStatus: (userId: number, newStatus: string) => Promise<boolean>
  onUpdateMultipleStatuses?: (userIds: number[], newStatus: string) => Promise<boolean>
  onUpdateDetails?: (userId: number, timestamp: string | undefined, remarks: string | undefined) => void
}

export function AdvancedAttendanceTable({
  students,
  loading,
  onUpdateStatus,
  onUpdateMultipleStatuses,
  onUpdateDetails
}: AdvancedAttendanceTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Selection state for batch operations
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // Inline editing state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTime, setEditTime] = useState('')
  const [editRemarks, setEditRemarks] = useState('')

  const getGender = (nisn: string, name: string) => {
    const lastDigit = parseInt(nisn.slice(-1)) || 0
    const isFemale = /siti|rahma|dewi|ani|putri|lia|rina|ayu|indah|fitri|sari/i.test(name) || (lastDigit % 2 === 0)
    return isFemale ? 'P' : 'L'
  }

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery)

    const matchClass =
      classFilter === 'all' ||
      s.class_group.replace(/-/g, ' ').toLowerCase() === classFilter.replace(/-/g, ' ').toLowerCase()

    const matchStatus =
      statusFilter === 'all' ||
      s.status.toUpperCase() === statusFilter.toUpperCase()

    return matchSearch && matchClass && matchStatus
  })

  // Select / Deselect handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredStudents.map((s) => s.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((rowId) => rowId !== id))
    }
  }

  const handleBatchUpdate = async (status: string) => {
    if (selectedIds.length === 0) {
      toast.error('Pilih setidaknya satu siswa untuk operasi massal')
      return
    }

    toast.loading(`Memperbarui ${selectedIds.length} status siswa...`)
    
    let success = false
    if (onUpdateMultipleStatuses) {
      success = await onUpdateMultipleStatuses(selectedIds, status)
    } else {
      // Fallback: update sequentially
      const results = await Promise.all(selectedIds.map((id) => onUpdateStatus(id, status)))
      success = results.some(Boolean)
    }

    toast.dismiss()
    if (success) {
      toast.success('Status massal berhasil diperbarui!')
      setSelectedIds([])
    } else {
      toast.error('Gagal memperbarui status secara massal')
    }
  }

  // Start inline editing
  const startEdit = (student: StudentAttendance) => {
    setEditingId(student.id)
    if (student.timestamp) {
      const date = new Date(student.timestamp)
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      setEditTime(`${hours}:${minutes}`)
    } else {
      setEditTime('')
    }
    setEditRemarks(student.remarks || '')
  }

  // Save inline editing details
  const saveDetails = (student: StudentAttendance) => {
    let newTimestamp = student.timestamp
    if (editTime) {
      const [h, m] = editTime.split(':')
      const baseDate = student.timestamp ? new Date(student.timestamp) : new Date()
      baseDate.setHours(parseInt(h) || 0)
      baseDate.setMinutes(parseInt(m) || 0)
      newTimestamp = baseDate.toISOString()
    } else {
      newTimestamp = undefined
    }

    if (onUpdateDetails) {
      onUpdateDetails(student.id, newTimestamp, editRemarks || undefined)
    }

    setEditingId(null)
    toast.success('Detail presensi disimpan!')
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari NISN atau nama siswa..."
            className="pl-10 h-10 border-slate-200 focus:border-indigo-500 w-full"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Class Filter */}
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-full sm:w-[160px] h-10 border-slate-200">
              <SelectValue placeholder="Pilih Kelas" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">Semua Kelas</SelectItem>
              {AVAILABLE_CLASSES.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px] h-10 border-slate-200">
              <SelectValue placeholder="Pilih Status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {STATUS_LIST.map((stat) => (
                <SelectItem key={stat} value={stat === 'Semua Status' ? 'all' : stat.toLowerCase()}>
                  {stat === 'Semua Status' ? 'Semua Status' : STATUS_LABELS[stat.toLowerCase() as StudentAttendance['status']] || stat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Batch Actions Toolbar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-indigo-50 border border-indigo-150 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 text-indigo-900 text-xs font-medium">
              <AlertCircle className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>Terpilih <span className="font-bold">{selectedIds.length}</span> siswa</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                onClick={() => handleBatchUpdate('hadir')} 
                size="sm" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3"
              >
                Set Hadir
              </Button>
              <Button 
                onClick={() => handleBatchUpdate('telat')} 
                size="sm" 
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs px-3"
              >
                Set Telat
              </Button>
              <Button 
                onClick={() => handleBatchUpdate('sakit')} 
                size="sm" 
                className="bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs px-3"
              >
                Set Sakit
              </Button>
              <Button 
                onClick={() => handleBatchUpdate('alfa')} 
                size="sm" 
                className="bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs px-3"
              >
                Set Alpa
              </Button>
              <Button 
                onClick={() => handleBatchUpdate('belum_absen')} 
                size="sm" 
                className="bg-slate-600 hover:bg-slate-700 text-white font-medium text-xs px-3"
              >
                Reset Belum Absen
              </Button>
              <Button 
                onClick={() => setSelectedIds([])} 
                variant="ghost" 
                size="sm" 
                className="text-slate-500 hover:bg-slate-200 text-xs px-3"
              >
                Batal
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filteredStudents.length > 0 && selectedIds.length === filteredStudents.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">NISN</th>
                <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Siswa</th>
                <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Kelas</th>
                <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gender</th>
                <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Waktu Presensi</th>
                <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Catatan</th>
                <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500 font-light text-sm">
                    Memuat data statistik dan absensi siswa...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500 font-light text-sm">
                    Tidak ada siswa yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const isSelected = selectedIds.includes(student.id)
                  const gender = getGender(student.nisn, student.name)
                  const isFemale = gender === 'P'
                  const isEditing = editingId === student.id

                  return (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                      className={`hover:bg-slate-50/50 transition-colors ${isSelected ? 'bg-indigo-50/30' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="px-5 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(student.id, e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* NISN */}
                      <td className="px-5 py-3.5 text-xs font-mono text-slate-500">{student.nisn}</td>

                      {/* Name & Avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                              ${isFemale
                                ? 'bg-pink-100 text-pink-700 border border-pink-200'
                                : 'bg-slate-100 text-indigo-700 border border-slate-200'
                              }
                            `}
                          >
                            {student.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-slate-900">{student.name}</span>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="px-5 py-3.5 text-xs font-mono text-slate-600 font-medium">
                        {student.class_group.replace(/-/g, ' ')}
                      </td>

                      {/* Gender Badge */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                          isFemale ? 'bg-pink-50 text-pink-700' : 'bg-slate-50 text-slate-700'
                        }`}>
                          {gender}
                        </span>
                      </td>

                      {/* Check-in Time */}
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <Input
                            type="time"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="h-8 w-24 text-xs font-mono px-2"
                          />
                        ) : (
                          <span className="text-xs font-mono text-slate-600 font-light">
                            {student.timestamp
                              ? new Date(student.timestamp).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })
                              : '-'}
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${
                          STATUS_COLORS[student.status] || STATUS_COLORS.belum_absen
                        }`}>
                          {STATUS_LABELS[student.status] || 'BELUM ABSEN'}
                        </span>
                      </td>

                      {/* Remarks */}
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <Input
                            value={editRemarks}
                            onChange={(e) => setEditRemarks(e.target.value)}
                            placeholder="Catatan..."
                            className="h-8 min-w-[120px] text-xs px-2"
                          />
                        ) : (
                          <span className="text-xs text-slate-500 font-light italic">
                            {student.remarks || '-'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isEditing ? (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 rounded-md"
                                onClick={() => saveDetails(student)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-rose-600 hover:bg-rose-50 rounded-md"
                                onClick={() => setEditingId(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              {/* Quick H T B S A Actions */}
                              <div className="hidden xl:flex items-center gap-1 border-r border-slate-100 pr-2 mr-1">
                                <button
                                  onClick={() => onUpdateStatus(student.id, 'hadir')}
                                  title="Set Hadir"
                                  className="w-6 h-6 rounded bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-700 text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  H
                                </button>
                                <button
                                  onClick={() => onUpdateStatus(student.id, 'telat')}
                                  title="Set Telat"
                                  className="w-6 h-6 rounded bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-700 text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  T
                                </button>
                                <button
                                  onClick={() => onUpdateStatus(student.id, 'belum_absen')}
                                  title="Reset Belum Absen"
                                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-500 hover:text-white text-slate-700 text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  B
                                </button>
                                <button
                                  onClick={() => onUpdateStatus(student.id, 'sakit')}
                                  title="Set Sakit"
                                  className="w-6 h-6 rounded bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-700 text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  S
                                </button>
                                <button
                                  onClick={() => onUpdateStatus(student.id, 'alfa')}
                                  title="Set Alpa"
                                  className="w-6 h-6 rounded bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-700 text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  A
                                </button>
                              </div>

                              {/* Edit details */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-md shrink-0 cursor-pointer"
                                onClick={() => startEdit(student)}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
