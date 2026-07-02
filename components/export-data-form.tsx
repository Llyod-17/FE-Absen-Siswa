'use client'

import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
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
  useExportData,
} from '@/lib/api-hooks'
import { useToastNotify } from '@/lib/use-toast-notify'

const fieldVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.05 + 0.1, duration: 0.4, ease: 'easeOut' as any },
  }),
}

const labelClass = 'text-[11px] font-semibold text-[#5a626a] flex items-center gap-2 mb-1.5 uppercase tracking-[1.5px]'

const inputBaseClass = `
  w-full h-[40px]
  bg-[#ffffff] border border-[#e2e8f0] text-[#111111]
  rounded-md px-3.5
  placeholder:text-[#cbd5e1]
  focus:outline-none focus:ring-1 focus:ring-[#c63535] focus:border-[#c63535]
  hover:border-[#cbd5e1] transition-all duration-200
  disabled:opacity-50
  text-sm font-light
`

const JURUSAN_LIST = [
  { id: 'RPL', name: 'RPL - Rekayasa Perangkat Lunak' },
  { id: 'TKJ', name: 'TKJ - Teknik Komputer & Jaringan' },
  { id: 'DKV', name: 'DKV - Desain Komunikasi Visual' },
  { id: 'PKM', name: 'PKM - Perbankan & Keuangan Mikro' },
  { id: 'TOI', name: 'TOI - Teknik Otomasi Industri' },
]

export function ExportDataForm() {
  const form = useForm({
    defaultValues: {
      classId: '',
      departmentId: '',
      attendanceDate: '',
    },
  })

  const { classes, loading: classesLoading } = useAvailableClasses()
  const { exportToExcel, loading: exportLoading } = useExportData()
  const toast = useToastNotify()

  const isLoading = classesLoading || exportLoading

  async function onSubmit(values: any) {
    if (!values.classId && !values.departmentId && !values.attendanceDate) {
      toast.warning('Filter Diperlukan', 'Pilih minimal satu filter sebelum ekspor data.')
      return
    }

    const result = await exportToExcel(values)

    if (result.success) {
      toast.success('Ekspor Berhasil', 'Data absensi berhasil diekspor dan diunduh.')
      form.reset()
    } else {
      toast.error('Ekspor Gagal', 'Gagal mengekspor data absensi.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      {/* Form Card */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-6 shadow-none">
        {/* Card Header */}
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-[#e2e8f0]">
          <div className="w-1.5 h-4 rounded-full bg-[#c63535]" />
          <span className="text-[#111111] font-semibold text-sm">Form Laporan Kehadiran</span>
          <span className="ml-auto text-[10px] text-[#5a626a] tracking-[0.5px]">Filter bersifat opsional</span>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Class + Department row */}
            <div className="grid sm:grid-cols-2 gap-4">

              {/* Class - Searchable Combobox */}
              <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>
                        Kelas
                        <span className="ml-auto text-[10px] text-[#5a626a]/60 font-light normal-case tracking-[0.5px]">Opsional</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="
                              w-full h-[40px] justify-between rounded-md shadow-none
                              bg-[#ffffff] border-[#e2e8f0] text-[#111111]
                              hover:bg-[#e9ecef] hover:border-[#cbd5e1]
                              focus:ring-1 focus:ring-[#c63535] focus:border-[#c63535]
                              transition-all duration-200 font-light text-sm text-left
                            "
                          >
                            <span className={!field.value ? 'text-[#5a626a]/50' : 'font-normal'}>
                              {field.value
                                ? classes.find(c => c.id === field.value)?.name
                                : 'Semua Kelas'}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-40 shrink-0" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-64 bg-[#ffffff] border border-[#e2e8f0] rounded-md shadow-none">
                          <Command className="bg-transparent">
                            <CommandInput
                              placeholder="Cari kelas..."
                              className="text-[#111111] placeholder:text-[#5a626a]/40 border-b border-[#e2e8f0] h-10 text-xs focus:ring-0"
                            />
                            <CommandList>
                              <CommandEmpty className="text-[#5a626a] text-xs py-4 text-center font-light">
                                Kelas tidak ditemukan
                              </CommandEmpty>
                              <CommandItem
                                value="all"
                                onSelect={() => field.onChange('')}
                                className="text-[#111111] hover:bg-[#e9ecef] rounded-md mx-1 my-0.5 cursor-pointer font-light text-xs"
                              >
                                <Check className={`mr-2 h-3.5 w-3.5 ${!field.value ? 'opacity-100 text-[#c63535]' : 'opacity-0'}`} />
                                Semua Kelas
                              </CommandItem>
                              {classes.map((cls) => (
                                <CommandItem
                                  key={cls.id}
                                  value={cls.name}
                                  onSelect={() => field.onChange(cls.id)}
                                  className="text-[#111111] hover:bg-[#e9ecef] rounded-md mx-1 my-0.5 cursor-pointer font-light text-xs"
                                >
                                  <Check className={`mr-2 h-3.5 w-3.5 ${field.value === cls.id ? 'opacity-100 text-[#c63535]' : 'opacity-0'}`} />
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
                        <Building2 className="h-3.5 w-3.5 text-[#5a626a] shrink-0" />
                        Jurusan
                        <span className="ml-auto text-[10px] text-[#5a626a]/60 font-light normal-case tracking-[0.5px]">Opsional</span>
                      </FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className={`${inputBaseClass} appearance-none cursor-pointer`}
                        >
                          <option value="">Semua Jurusan</option>
                          {JURUSAN_LIST.map((dept) => (
                            <option key={dept.id} value={dept.id}>
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
                      <CalendarDays className="h-3.5 w-3.5 text-[#5a626a] shrink-0" />
                      Tanggal
                      <span className="ml-auto text-[10px] text-[#5a626a]/60 font-light normal-case tracking-[0.5px]">Opsional</span>
                    </FormLabel>
                    <FormControl>
                      <input
                        type="date"
                        {...field}
                        className={inputBaseClass}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Hint */}
            <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
              <div className="flex items-start gap-2.5 p-3 rounded-md bg-[#b89750]/10 border border-[#b89750]/20">
                <AlertTriangle className="h-3.5 w-3.5 text-[#b89750] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#5a626a] font-light leading-snug">
                  Minimal satu filter harus dipilih. Data absensi akan diunduh secara instan dalam format spreadsheet <span className="text-[#111111] font-semibold">.xlsx</span>
                </p>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible" className="pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="
                  w-full h-[40px] rounded-md font-semibold text-xs tracking-[0.5px]
                  bg-[#c63535] hover:bg-[#a32a2a] text-white
                  active:scale-[0.98] transition-all duration-200 cursor-pointer
                  disabled:bg-[#5a626a]/20 disabled:text-[#5a626a] disabled:cursor-not-allowed shadow-none
                "
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span>Memproses ekspor...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    UNDUH REKAPITULASI (EXCEL)
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