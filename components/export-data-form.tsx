'use client'

import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from '@/components/ui/command'
import { Check, ChevronsUpDown, Download, FileSpreadsheet, Building2, CalendarDays, AlertTriangle } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  useAvailableClasses,
  useAvailableDepartments,
  useExportData,
} from '@/lib/api-hooks'
import { useToastNotify } from '@/lib/use-toast-notify'
import * as XLSX from 'xlsx'

const cardClass = `
  bg-slate-900/70 backdrop-blur-xl
  border border-slate-700/50
  rounded-2xl shadow-xl shadow-black/30
`

const fieldVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.08 + 0.15, duration: 0.4, ease: 'easeOut' as any },
  }),
}

/* Shared label style */
const labelClass = 'text-sm font-medium text-slate-300 flex items-center gap-2 mb-1.5'

/* Shared input style */
const inputBaseClass = `
  w-full h-11
  bg-slate-800/60 border border-slate-700/60 text-slate-100
  rounded-xl px-3
  placeholder:text-slate-600
  focus:outline-none focus:ring-1 focus:ring-blue-500/60 focus:border-blue-500/60
  hover:border-slate-600 transition-all duration-200
  disabled:opacity-50
`

export function ExportDataForm() {
  const form = useForm({
    defaultValues: {
      classId: '',
      departmentId: '',
      attendanceDate: '',
    },
  })

  const { classes, loading: classesLoading } = useAvailableClasses()
  const { departments } = useAvailableDepartments()
  const { exportToExcel, loading: exportLoading } = useExportData()
  const toast = useToastNotify()

  const isLoading = classesLoading || exportLoading

  async function onSubmit(values: any) {
    if (!values.classId && !values.departmentId && !values.attendanceDate) {
      toast.warning('Filter Diperlukan', 'Pilih minimal satu filter sebelum export')
      return
    }

    const result = await exportToExcel(values)

    if (result.success) {
      toast.success('Export Berhasil', 'Data absensi berhasil diekspor dan diunduh.')
      form.reset()
    } else {
      toast.error('Export Gagal', 'Gagal mengekspor data.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
          <FileSpreadsheet className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Unduh Laporan Kehadiran</h1>
          <p className="text-sm text-slate-500">Ekspor data kehadiran siswa ke format Excel</p>
        </div>
      </div>

      {/* Form Card */}
      <div className={`${cardClass} p-6`}>

        {/* Card Header */}
        <div className="flex items-center gap-2.5 pb-5 mb-5 border-b border-slate-700/50">
          <div className="w-1.5 h-5 rounded-full bg-blue-500" />
          <span className="text-white font-semibold text-sm">Filter Data</span>
          <span className="ml-auto text-xs text-slate-600">Semua filter bersifat opsional</span>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* Class + Department row */}
            <div className="grid sm:grid-cols-2 gap-5">

              {/* Class - Searchable Combobox */}
              <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>
                        <div className="w-3.5 h-3.5 rounded-sm bg-blue-500/30 border border-blue-500/50 flex items-center justify-center">
                          <span className="text-[8px] text-blue-400 font-bold">K</span>
                        </div>
                        Kelas
                        <span className="ml-auto text-[10px] text-slate-600 font-normal">Opsional</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="
                              w-full h-11 justify-between rounded-xl
                              bg-slate-800/60 border-slate-700/60 text-slate-300
                              hover:bg-slate-800 hover:border-slate-600 hover:text-slate-200
                              focus:ring-1 focus:ring-blue-500/60 focus:border-blue-500/60
                              transition-all duration-200
                            "
                          >
                            <span className={!field.value ? 'text-slate-600' : ''}>
                              {field.value
                                ? classes.find(c => c.id === field.value)?.name
                                : 'Semua Kelas'}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-40" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-xl shadow-2xl shadow-black/40">
                          <Command className="bg-transparent">
                            <CommandInput
                              placeholder="Cari kelas..."
                              className="text-slate-300 placeholder:text-slate-600 border-b border-slate-700/60"
                            />
                            <CommandList>
                              <CommandEmpty className="text-slate-500 text-sm py-4 text-center">
                                Kelas tidak ditemukan
                              </CommandEmpty>
                              <CommandItem
                                value="all"
                                onSelect={() => field.onChange('')}
                                className="text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg mx-1 my-0.5 cursor-pointer"
                              >
                                <Check className={`mr-2 h-4 w-4 ${!field.value ? 'opacity-100 text-blue-400' : 'opacity-0'}`} />
                                Semua Kelas
                              </CommandItem>
                              {classes.map((cls) => (
                                <CommandItem
                                  key={cls.id}
                                  value={cls.name}
                                  onSelect={() => field.onChange(cls.id)}
                                  className="text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg mx-1 my-0.5 cursor-pointer"
                                >
                                  <Check className={`mr-2 h-4 w-4 ${field.value === cls.id ? 'opacity-100 text-blue-400' : 'opacity-0'}`} />
                                  {cls.name}
                                </CommandItem>
                              ))}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Department */}
              <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>
                        <Building2 className="h-3.5 w-3.5 text-slate-500" />
                        Jurusan
                        <span className="ml-auto text-[10px] text-slate-600 font-normal">Opsional</span>
                      </FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className={`${inputBaseClass} appearance-none cursor-pointer`}
                          style={{ colorScheme: 'dark' }}
                        >
                          <option value="" className="bg-slate-800 text-slate-300">Semua Jurusan</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id} className="bg-slate-800 text-slate-300">
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </motion.div>
            </div>

            {/* Date */}
            <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
              <FormField
                control={form.control}
                name="attendanceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>
                      <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                      Tanggal
                      <span className="ml-auto text-[10px] text-slate-600 font-normal">Opsional</span>
                    </FormLabel>
                    <FormControl>
                      <input
                        type="date"
                        {...field}
                        className={inputBaseClass}
                        style={{ colorScheme: 'dark' }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Hint */}
            <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400/70 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500">
                  Minimal satu filter harus dipilih. Data akan diunduh dalam format <span className="text-slate-400">.xlsx</span>
                </p>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
              <Button
                type="submit"
                disabled={isLoading}
                className="
                  w-full h-11 rounded-xl font-semibold
                  bg-blue-600 hover:bg-blue-500 active:scale-[0.98]
                  transition-all duration-200 shadow-lg shadow-blue-900/30
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span>Memproses...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Unduh Laporan (Excel)
                  </div>
                )}
              </Button>
            </motion.div>
          </form>
        </Form>
      </div>
    </motion.div>
  )
}