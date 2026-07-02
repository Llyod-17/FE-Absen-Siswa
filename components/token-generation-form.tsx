'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useGenerateToken, useTokens } from '@/lib/api-hooks'
import { useAuthImage } from '@/lib/use-auth-image'
import { QrPreviewDialog } from '@/components/qr-preview-dialog'
import {
  Zap, Copy, Check, Clock, Tag,
  CheckCircle, AlertTriangle, X, Maximize2,
} from 'lucide-react'

interface TokenGenerationFormProps {
  onTokenGenerated?: (token: string) => void
}

type TokenCategory = 'hadir' | 'telat'

interface GeneratedState {
  code: string
  id: number
  category: TokenCategory
}

const CATEGORY_STYLES = {
  hadir: {
    accent: 'bg-[#008751]',
    text: 'text-[#008751]',
    badge: 'bg-[#008751]/10 text-[#008751] border-[#008751]/20',
  },
  telat: {
    accent: 'bg-[#b89750]',
    text: 'text-[#b89750]',
    badge: 'bg-[#b89750]/10 text-[#b89750] border-[#b89750]/20',
  },
} as const

export function TokenGenerationForm({ onTokenGenerated }: TokenGenerationFormProps) {
  const [generated, setGenerated] = useState<GeneratedState | null>(null)
  const [copied, setCopied] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const form = useForm({ defaultValues: { duration: '20', category: 'hadir' } })

  const { generate, generateHadir, generateTelat, loading: generating } = useGenerateToken()
  const { tokens: activeTokens, loading: loadingActiveTokens } = useTokens()

  const qrBlobUrl = useAuthImage(generated?.id ?? null)
  const isDisabled = generating || loadingActiveTokens

  useEffect(() => {
    if (activeTokens.length > 0 && !generated && !dismissed) {
      const latest = activeTokens[0]
      setGenerated({ code: latest.token_code, id: latest.id, category: latest.category })
    }
  }, [activeTokens, generated, dismissed])

  async function onSubmit(values: { duration: string; category: string }) {
    const result = await generate({
      duration: parseInt(values.duration),
      category: values.category as TokenCategory,
    })
    if (result) {
      const state: GeneratedState = { code: result.token_code, id: result.id, category: values.category as TokenCategory }
      setGenerated(state)
      setDismissed(false)
      onTokenGenerated?.(result.token_code)
    }
  }

  async function handleQuickGenerate(type: TokenCategory) {
    const result = type === 'hadir' ? await generateHadir() : await generateTelat()
    if (result) {
      const state: GeneratedState = { code: result.token_code, id: result.id, category: type }
      setGenerated(state)
      setDismissed(false)
      onTokenGenerated?.(result.token_code)
    }
  }

  function handleCopy() {
    if (!generated) return
    navigator.clipboard.writeText(generated.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function handleReset() {
    setGenerated(null)
    setDismissed(true)
    setCopied(false)
    form.reset()
  }

  const styles = generated ? CATEGORY_STYLES[generated.category] : null
  const categoryLabel = generated?.category === 'telat' ? 'TELAT' : 'HADIR'

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-lg w-full"
    >
      <AnimatePresence mode="wait">
        {/* FORM STATE */}
        {!generated && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-none"
          >
            <div className="h-[3px] w-full bg-[#c63535]" />

            <div className="p-6 space-y-5">
              {/* Quick Generate */}
              <div>
                <p className="text-[11px] font-semibold text-[#5a626a] uppercase tracking-[1.5px] mb-3">Buat Cepat</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleQuickGenerate('hadir')}
                    className="h-[40px] rounded-md font-semibold text-xs tracking-[0.5px] bg-[#008751] hover:bg-[#007043] text-white active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-none"
                  >
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    GENERATE HADIR
                  </Button>
                  <Button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleQuickGenerate('telat')}
                    className="h-[40px] rounded-md font-semibold text-xs tracking-[0.5px] bg-[#b89750] hover:bg-[#9f8141] text-white active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-none"
                  >
                    <AlertTriangle className="h-4 w-4 mr-1.5" />
                    GENERATE TELAT
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#e2e8f0]" />
                <span className="text-[10px] text-[#5a626a] uppercase tracking-[1.5px] font-bold">atau custom</span>
                <div className="flex-1 h-px bg-[#e2e8f0]" />
              </div>

              {/* Custom Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Duration */}
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-md p-4 hover:border-[#cbd5e1] focus-within:border-[#c63535] transition-all duration-200">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-5 h-5 rounded-md bg-[#c63535]/10 flex items-center justify-center">
                                <Clock className="h-3 w-3 text-[#c63535]" />
                              </div>
                              <span className="text-[10px] font-bold text-[#5a626a] tracking-[0.5px]">Durasi</span>
                            </div>
                            <FormControl>
                              <div className="flex items-baseline gap-1">
                                <Input
                                  type="number"
                                  disabled={isDisabled}
                                  className="border-0 bg-transparent text-[#111111] text-2xl font-bold h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-full rounded-none shadow-none"
                                  {...field}
                                />
                                <span className="text-xs text-[#5a626a] shrink-0 font-light">menit</span>
                              </div>
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Category */}
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-md p-4 hover:border-[#cbd5e1] focus-within:border-[#c63535] transition-all duration-200">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-5 h-5 rounded-md bg-[#b89750]/10 flex items-center justify-center">
                                <Tag className="h-3 w-3 text-[#b89750]" />
                              </div>
                              <span className="text-[10px] font-bold text-[#5a626a] tracking-[0.5px]">Kategori</span>
                            </div>
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange} disabled={isDisabled}>
                                <SelectTrigger className="border-0 bg-transparent text-[#111111] text-lg font-bold h-auto p-0 focus:ring-0 focus:ring-offset-0 w-full rounded-none shadow-none">
                                  <SelectValue placeholder="Pilih" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#ffffff] border-[#e2e8f0] rounded-md text-[#111111]">
                                  <SelectItem value="hadir">Hadir</SelectItem>
                                  <SelectItem value="telat">Telat</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isDisabled}
                    className="w-full h-[40px] rounded-md font-semibold text-xs tracking-[0.5px] bg-[#c63535] hover:bg-[#a32a2a] text-white active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-none"
                  >
                    {generating ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        <span>Membuat token QR...</span>
                      </div>
                    ) : (
                      'BUAT QR CODE BARU'
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </motion.div>
        )}

        {/* GENERATED ACTIVE STATE */}
        {generated && styles && (
          <motion.div
            key="generated"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden p-6 space-y-5 text-center shadow-none relative"
          >
            {/* Header Badge */}
            <div className="flex justify-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-[1.5px] uppercase ${styles.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${styles.accent}`} />
                QR {categoryLabel} AKTIF
              </span>
            </div>

            {/* QR Preview Wrapper */}
            <div className="flex flex-col items-center justify-center p-4 bg-[#f4f5f6] border border-[#e2e8f0] rounded-xl">
              {generating ? (
                <div className="h-48 w-48 flex items-center justify-center">
                  <LoadingSpinner message="Menghasilkan kode QR..." />
                </div>
              ) : qrBlobUrl ? (
                <div className="relative group">
                  <img
                    src={qrBlobUrl}
                    alt="Active QR code"
                    className="w-48 h-48 object-contain transition-all duration-300 group-hover:brightness-95"
                  />
                  <QrPreviewDialog
                    qrUrl={qrBlobUrl}
                    tokenCode={generated.code}
                    category={generated.category}
                    isActive={true}
                    trigger={
                      <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md text-white font-medium text-xs gap-1.5 cursor-pointer">
                        <Maximize2 className="h-4 w-4" />
                        Perbesar QR
                      </button>
                    }
                  />
                </div>
              ) : (
                <div className="h-48 w-48 flex items-center justify-center text-[#5a626a] text-xs font-light">
                  QR Code tidak dapat ditampilkan
                </div>
              )}
            </div>

            {/* Token details */}
            <div className="space-y-1">
              <p className="text-[10px] text-[#5a626a] font-mono tracking-widest uppercase">Kode Absensi</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl font-mono font-bold tracking-wider text-[#111111]">{generated.code}</span>
                <Button
                  onClick={handleCopy}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#5a626a] hover:text-[#111111] hover:bg-[#e9ecef] rounded-md shrink-0 cursor-pointer border border-transparent"
                >
                  {copied ? <Check className="h-4 w-4 text-[#008751]" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Reset QR Button */}
            <div className="pt-2 border-t border-[#e2e8f0]">
              <Button
                onClick={handleReset}
                variant="ghost"
                className="w-full text-[#c63535] hover:bg-[#c63535]/10 h-[40px] text-xs font-semibold rounded-md border border-transparent cursor-pointer"
              >
                <X className="h-4 w-4 mr-1.5" />
                Matikan & Buat QR Baru
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}