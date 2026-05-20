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
  Zap, Copy, Check, Clock, Tag, Sparkles,
  CheckCircle, AlertTriangle, X, Maximize2,
} from 'lucide-react'

/* ── Types ── */

interface TokenGenerationFormProps {
  onTokenGenerated?: (token: string) => void
}

type TokenCategory = 'hadir' | 'telat'

interface GeneratedState {
  code: string
  id: number
  category: TokenCategory
}

/* ── Helpers ── */

const CATEGORY_STYLES = {
  hadir: {
    gradient: 'from-emerald-600 via-emerald-400 to-teal-400',
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    glow: 'bg-emerald-500/5',
  },
  telat: {
    gradient: 'from-amber-600 via-amber-400 to-yellow-400',
    dot: 'bg-amber-400',
    text: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    glow: 'bg-amber-500/5',
  },
} as const

/* ── Component ── */

export function TokenGenerationForm({ onTokenGenerated }: TokenGenerationFormProps) {
  const [generated, setGenerated] = useState<GeneratedState | null>(null)
  const [copied, setCopied] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const form = useForm({ defaultValues: { duration: '20', category: 'hadir' } })

  const { generate, generateHadir, generateTelat, loading: generating } = useGenerateToken()
  const { tokens: activeTokens, loading: loadingActiveTokens } = useTokens()

  // Reuse the shared hook for QR image fetching instead of duplicating fetch logic
  const qrBlobUrl = useAuthImage(generated?.id ?? null)

  const isDisabled = generating || loadingActiveTokens

  // Initialize from an existing active token on mount
  useEffect(() => {
    if (activeTokens.length > 0 && !generated && !dismissed) {
      const latest = activeTokens[0]
      setGenerated({ code: latest.token_code, id: latest.id, category: latest.category })
    }
  }, [activeTokens, generated, dismissed])

  /* ── Handlers ── */

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

  /* ── Derived values ── */
  const styles = generated ? CATEGORY_STYLES[generated.category] : null
  const categoryLabel = generated?.category === 'telat' ? 'TELAT' : 'HADIR'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-lg"
    >
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
          <Zap className="h-6 w-6 text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Buat QR Absensi</h1>
          <p className="text-sm text-slate-500">Hasilkan kode QR absensi untuk dipindai oleh siswa</p>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── FORM STATE ── */}
        {!generated && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl shadow-black/30 overflow-hidden"
          >
            <div className="h-1 w-full bg-gradient-to-r from-orange-600 via-orange-400 to-amber-400" />

            <div className="p-6 space-y-6">

              {/* Quick Generate */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-3">Buat Cepat</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleQuickGenerate('hadir')}
                    className="h-12 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-emerald-900/30 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Generate QR Hadir
                  </Button>
                  <Button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleQuickGenerate('telat')}
                    className="h-12 rounded-xl font-semibold text-sm bg-amber-600 hover:bg-amber-500 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-amber-900/30 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Generate QR Telat
                  </Button>
                </div>
              </motion.div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-700/50" />
                <span className="text-xs text-slate-600 uppercase tracking-widest">atau custom</span>
                <div className="flex-1 h-px bg-slate-700/50" />
              </div>

              {/* Custom Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">

                    {/* Duration */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 hover:border-slate-600 focus-within:border-orange-500/60 transition-all duration-200 group">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                                  <Clock className="h-3 w-3 text-orange-400" />
                                </div>
                                <span className="text-xs font-medium text-slate-400">Durasi Valid</span>
                              </div>
                              <FormControl>
                                <div className="flex items-baseline gap-1.5">
                                  <Input
                                    type="number"
                                    disabled={isDisabled}
                                    className="border-0 bg-transparent text-white text-3xl font-bold h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full"
                                    {...field}
                                  />
                                  <span className="text-sm text-slate-500 shrink-0">menit</span>
                                </div>
                              </FormControl>
                            </div>
                            <FormMessage className="text-xs text-red-400 mt-1" />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    {/* Category */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.17 }}
                    >
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 hover:border-slate-600 focus-within:border-orange-500/60 transition-all duration-200 group">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                                  <Tag className="h-3 w-3 text-amber-400" />
                                </div>
                                <span className="text-xs font-medium text-slate-400">Kategori</span>
                              </div>
                              <FormControl>
                                <Select value={field.value} onValueChange={field.onChange} disabled={isDisabled}>
                                  <SelectTrigger className="border-0 bg-transparent text-white text-lg font-bold h-auto p-0 focus:ring-0 focus:ring-offset-0 w-full shadow-none">
                                    <SelectValue placeholder="Pilih kategori" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                                    <SelectItem value="hadir">
                                      <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                        Hadir
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="telat">
                                      <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                                        Telat
                                      </span>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </div>
                            <FormMessage className="text-xs text-red-400 mt-1" />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  </div>

                  {/* Helper text */}
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
                    className="flex items-center justify-between text-xs text-slate-600"
                  >
                    <span>Kode aktif selama <span className="text-slate-400">{form.watch('duration')} menit</span></span>
                    <span>Kategori: <span className={`font-semibold ${form.watch('category') === 'hadir' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {form.watch('category') === 'hadir' ? 'HADIR' : 'TELAT'}
                    </span></span>
                  </motion.div>

                  {/* Submit */}
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Button
                      type="submit"
                      disabled={isDisabled}
                      className="w-full h-12 rounded-xl font-semibold text-sm bg-orange-500 hover:bg-orange-400 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-orange-900/40 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <AnimatePresence mode="wait">
                        {isDisabled ? (
                          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                            <LoadingSpinner size="sm" />
                            <span>Generating...</span>
                          </motion.div>
                        ) : (
                          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            <span>Buat QR Custom</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </div>
          </motion.div>
        )}

        {/* ── RESULT STATE ── */}
        {generated && styles && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl shadow-black/30 overflow-hidden"
          >
            <div className={`h-1 w-full bg-gradient-to-r ${styles.gradient}`} />

            <div className="p-6 space-y-5">

              {/* Status header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${styles.dot}`} />
                  <span className={`text-xs font-semibold uppercase tracking-widest ${styles.text}`}>
                    Kode Aktif
                  </span>
                  <span className={`ml-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${styles.badge}`}>
                    {categoryLabel}
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-800/50 hover:bg-slate-700/80 text-slate-400 hover:text-white transition-colors"
                  title="Tutup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* QR Code display */}
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl px-6 py-6 text-center relative overflow-hidden">
                <div className={`absolute inset-0 blur-xl pointer-events-none ${styles.glow}`} />

                <p className="text-xs text-slate-500 mb-4 uppercase tracking-widest relative z-10">QR Code Absensi</p>

                {/* Loading state */}
                {!qrBlobUrl && (
                  <div className="relative z-10 flex items-center justify-center py-4">
                    <div className="w-[200px] h-[200px] bg-slate-700/50 rounded-2xl animate-pulse flex items-center justify-center">
                      <span className="text-xs text-slate-500">Memuat QR...</span>
                    </div>
                  </div>
                )}

                {/* QR image with hover-to-enlarge */}
                {qrBlobUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
                    className="relative z-10 flex flex-col items-center"
                  >
                    <QrPreviewDialog
                      qrUrl={qrBlobUrl}
                      tokenCode={generated.code}
                      category={generated.category}
                      isActive={true}
                      trigger={
                        <button className="relative group rounded-2xl p-3 bg-white shadow-lg shadow-black/20 inline-block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={qrBlobUrl}
                            alt={`QR Code: ${generated.code}`}
                            width={200}
                            height={200}
                            className="block rounded-lg transition-all group-hover:blur-[2px]"
                          />
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-2xl cursor-pointer backdrop-blur-sm">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2">
                              <Maximize2 className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-white text-xs font-semibold uppercase tracking-wider">Perbesar</span>
                          </div>
                        </button>
                      }
                    />
                  </motion.div>
                )}

                {/* Manual code */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 relative z-10"
                >
                  <p className="text-xs text-slate-600 mb-1">Kode Manual</p>
                  <p className="text-2xl font-black font-mono text-white tracking-[0.2em]">
                    {generated.code}
                  </p>
                </motion.div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleCopy}
                  className={`h-12 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] ${
                    copied
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/40'
                      : 'bg-slate-800 hover:bg-slate-700 border border-slate-600/60 text-slate-200'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div key="copied" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Tersalin!
                      </motion.div>
                    ) : (
                      <motion.div key="copy" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex items-center gap-2">
                        <Copy className="h-4 w-4" />
                        Salin Kode
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>

                <Button
                  onClick={handleReset}
                  className="h-12 rounded-xl font-semibold text-sm bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white transition-all duration-300 active:scale-[0.98]"
                >
                  Tutup QR
                </Button>
              </div>

              {/* Footer info */}
              <p className="text-center text-xs text-slate-600">
                Bagikan kode ini kepada siswa · Kategori:{' '}
                <span className={`font-semibold ${styles.text}`}>{categoryLabel}</span>
              </p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  )
}