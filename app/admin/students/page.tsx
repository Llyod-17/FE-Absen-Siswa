'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  AlertCircle,
  PhoneCall,
  Hash,
  Award
} from 'lucide-react'
import { AVAILABLE_CLASSES } from '@/lib/constants'
import { usersAPI } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'
import { containerVariants, itemVariants } from '@/lib/constants'

interface Student {
  id: number
  nisn: string
  full_name: string
  username: string
  class_group: string
  parent_phone: string
  gender?: 'L' | 'P' // Local simulation
}

function getGender(nisn: string, fullName: string): 'L' | 'P' {
  const lastDigit = parseInt(nisn.slice(-1)) || 0
  const isFemale = /siti|rahma|dewi|ani|putri|lia|rina|ayu|indah|fitri/i.test(fullName) || (lastDigit % 2 === 0)
  return isFemale ? 'P' : 'L'
}

export default function StudentsMasterPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [classFilter, setClassFilter] = useState('all')

  // Form State
  const [isOpen, setIsOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  
  const [fullName, setFullName] = useState('')
  const [nisn, setNisn] = useState('')
  const [username, setUsername] = useState('')
  const [classGroup, setClassGroup] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [gender, setGender] = useState<'L' | 'P'>('L')

  // Fetch students on mount
  const fetchStudents = async () => {
    try {
      setLoading(true)
      const result = await usersAPI.getAll()
      if ('data' in result && result.data?.users) {
        setStudents(result.data.users as Student[])
      } else {
        toast.error('Gagal memuat data master siswa')
      }
    } catch {
      toast.error('Terjadi kesalahan koneksi database')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  // Open Form for Add
  const handleAddClick = () => {
    setEditingStudent(null)
    setFullName('')
    setNisn('')
    setUsername('')
    setClassGroup(AVAILABLE_CLASSES[0].replace(/ /g, '-')) // default selection format
    setParentPhone('')
    setGender('L')
    setIsOpen(true)
  }

  // Open Form for Edit
  const handleEditClick = (student: Student) => {
    setEditingStudent(student)
    setFullName(student.full_name)
    setNisn(student.nisn)
    setUsername(student.username)
    setClassGroup(student.class_group)
    setParentPhone(student.parent_phone)
    // Deterministic gender fallback
    const lastDigit = parseInt(student.nisn.slice(-1)) || 0
    const isFemale = /siti|rahma|dewi|ani|putri|lia|rina|ayu|indah|fitri/i.test(student.full_name) || (lastDigit % 2 === 0)
    setGender(student.gender || (isFemale ? 'P' : 'L'))
    setIsOpen(true)
  }

  // Handle Delete student
  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus siswa ini?')) return
    
    toast.loading('Menghapus data siswa...')
    const result = await usersAPI.delete(id)
    toast.dismiss()
    
    if (result && !('error' in result)) {
      toast.success('Data siswa berhasil dihapus')
      fetchStudents()
    } else {
      toast.error('Gagal menghapus siswa dari database')
    }
  }

  // Handle submit form (Create/Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // NISN validation (10 digits)
    if (!/^\d{10}$/.test(nisn)) {
      toast.error('NISN harus tepat berisi 10 digit angka')
      return
    }

    // NISN uniqueness check (excluding editing student)
    const nisnExists = students.some(
      (s) => s.nisn === nisn && (!editingStudent || s.id !== editingStudent.id)
    )
    if (nisnExists) {
      toast.error('NISN ini sudah terdaftar untuk siswa lain')
      return
    }

    if (!fullName || !username || !classGroup || !parentPhone) {
      toast.error('Semua kolom formulir wajib diisi')
      return
    }

    const payload = {
      nisn,
      full_name: fullName,
      username,
      class_group: classGroup,
      parent_phone: parentPhone,
    }

    toast.loading('Menyimpan data siswa...')
    let result
    if (editingStudent) {
      result = await usersAPI.update(editingStudent.id, payload)
    } else {
      result = await usersAPI.create(payload)
    }
    toast.dismiss()

    if (result && !('error' in result)) {
      toast.success(editingStudent ? 'Profil siswa diperbarui!' : 'Siswa baru berhasil ditambahkan!')
      setIsOpen(false)
      fetchStudents()
    } else {
      toast.error('Gagal memproses data siswa ke database')
    }
  }

  // Filter students based on UI searches
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery)

    const matchClass =
      classFilter === 'all' ||
      s.class_group.replace(/-/g, ' ').toLowerCase() === classFilter.replace(/-/g, ' ').toLowerCase()

    return matchSearch && matchClass
  })

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-10"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1 font-[family-name:var(--font-playfair)]">
            Data Master Siswa
          </h1>
          <p className="text-xs text-slate-500 font-light leading-none">
            Manajemen direktori siswa, pendaftaran NISN, dan sinkronisasi wali murid.
          </p>
        </div>
        <Button
          onClick={handleAddClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-10 px-4 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 mr-1.5 shrink-0" />
          Pendaftaran Siswa Baru
        </Button>
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        variants={itemVariants} 
        className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
      >
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan NISN atau nama siswa..."
            className="pl-10 h-10 border-slate-200 focus:border-indigo-500 w-full"
          />
        </div>

        <div className="w-full md:w-48">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="h-10 border-slate-200">
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
        </div>
      </motion.div>

      {/* Main Student Directory Table */}
      <motion.div variants={itemVariants}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
            <LoadingSpinner message="Mengunduh repositori data siswa..." />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
            <Users className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-slate-500 font-light text-sm">Tidak ada data siswa ditemukan.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">NISN</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Siswa</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gender</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Username</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Kelas</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Telepon Ortu</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student, idx) => {
                    const studentGender = getGender(student.nisn, student.full_name)
                    const isFemale = studentGender === 'P'
                    return (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-5 py-3.5 text-xs font-mono text-slate-500">{student.nisn}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                              ${isFemale
                                ? 'bg-pink-150 text-pink-700 border border-pink-200'
                                : 'bg-slate-150 text-indigo-700 border border-slate-200'
                              }
                            `}>
                              {student.full_name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-slate-900">{student.full_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                            isFemale ? 'bg-pink-50 text-pink-700' : 'bg-slate-50 text-slate-700'
                          }`}>
                            {studentGender}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs font-mono text-slate-600">{student.username}</td>
                        <td className="px-5 py-3.5 text-xs font-mono text-slate-600 font-medium">
                          {student.class_group.replace(/-/g, ' ')}
                        </td>
                        <td className="px-5 py-3.5 text-xs font-mono text-slate-500">{student.parent_phone}</td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              onClick={() => handleEditClick(student)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-indigo-600 hover:bg-indigo-50 rounded"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(student.id)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* Slide-over Dialog Form */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black"
            />
            
            {/* Form Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingStudent ? 'Edit Profil Siswa' : 'Pendaftaran Siswa Baru'}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Isi detail data siswa secara lengkap</p>
                </div>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:bg-slate-100 rounded-md"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nama Lengkap</label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Masukkan nama lengkap..."
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* NISN */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">NISN (10 Digit)</label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={nisn}
                      onChange={(e) => setNisn(e.target.value)}
                      placeholder="Contoh: 1220045199..."
                      maxLength={10}
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Username Akun</label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: budi.rpl1..."
                  />
                </div>

                {/* Class */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Kelas</label>
                  <Select value={classGroup} onValueChange={setClassGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kelas" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {AVAILABLE_CLASSES.map((cls) => (
                        <SelectItem key={cls} value={cls.replace(/ /g, '-')}>
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Gender</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGender('L')}
                      className={`
                        py-2 text-xs font-semibold rounded border transition-all cursor-pointer
                        ${gender === 'L' 
                          ? 'bg-indigo-600 text-white border-transparent' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }
                      `}
                    >
                      L (Laki-laki)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('P')}
                      className={`
                        py-2 text-xs font-semibold rounded border transition-all cursor-pointer
                        ${gender === 'P' 
                          ? 'bg-pink-600 text-white border-transparent' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }
                      `}
                    >
                      P (Perempuan)
                    </button>
                  </div>
                </div>

                {/* Parent Phone */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">No Telepon Wali Murid (WA)</label>
                  <div className="relative">
                    <PhoneCall className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="Contoh: 6281234567..."
                    />
                  </div>
                  <p className="text-[9px] text-slate-400">Pesan otomatis WhatsApp akan dikirim ke nomor ini.</p>
                </div>
              </form>

              {/* Footer */}
              <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  className="h-10 text-xs font-semibold border-slate-200 cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-10 px-4 cursor-pointer"
                >
                  <Check className="h-4 w-4 mr-1.5" />
                  Simpan Data Siswa
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
