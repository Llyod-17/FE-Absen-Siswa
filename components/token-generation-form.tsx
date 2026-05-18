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
import { Zap, Copy, Check, Clock, Tag, Sparkles, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react'

interface TokenGenerationFormProps {
  onTokenGenerated?: (token: string) => void
}

export function TokenGenerationForm({ onTokenGenerated }: TokenGenerationFormProps) {
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)
  const [generatedTokenId, setGeneratedTokenId] = useState<number | null>(null)
  const [generatedCategory, setGeneratedCategory] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [qrBlobUrl, setQrBlobUrl] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)

  const form = useForm({
    defaultValues: { duration: '20', category: 'hadir' },
  })

  const { generate, generateHadir, generateTelat, loading: generating } = useGenerateToken()
  const { tokens: activeTokens, loading: loadingActiveTokens } = useTokens()

  // Initialize from active token if one exists and we haven't generated one yet
  useEffect(() => {
    if (activeTokens.length > 0 && !generatedTokenId) {
      // Get the first active token (most recent)
      const latestActive = activeTokens[0]
      setGeneratedToken(latestActive.token_code)
      setGeneratedTokenId(latestActive.id)
      setGeneratedCategory(latestActive.category)
    }
  }, [activeTokens, generatedTokenId])

  // Fetch QR image with auth header whenever a new token is generated
  useEffect(() => {
    if (!generatedTokenId) {
      setQrBlobUrl(null)
      return
    }

    let cancelled = false
    setQrLoading(true)

    const fetchQR = async () => {
      try {
        const headers: Record<string, string> = {}
        const authToken = localStorage.getItem('authToken')
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`

        const res = await fetch(`/api/v1/token/${generatedTokenId}/image`, { headers })
        if (!res.ok) throw new Error('QR fetch failed')

        const blob = await res.blob()
        if (!cancelled) {
          const url = URL.createObjectURL(blob)
          setQrBlobUrl(url)
        }
      } catch {
        if (!cancelled) setQrBlobUrl(null)
      } finally {
        if (!cancelled) setQrLoading(false)
      }
    }

    fetchQR()
    return () => {
      cancelled = true
      // Revoke old blob URL to prevent memory leak
      setQrBlobUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null })
    }
  }, [generatedTokenId])

  async function onSubmit(values: { duration: string; category: string }) {
    setGeneratedToken(null)
    setGeneratedTokenId(null)
    const result = await generate({
      duration: parseInt(values.duration),
      category: values.category as 'hadir' | 'telat',
    })
    if (result) {
      setGeneratedToken(result.token_code)
      setGeneratedTokenId(result.id)
      setGeneratedCategory(values.category)
      onTokenGenerated?.(result.token_code)
    }
  }

  async function handleQuickGenerate(type: 'hadir' | 'telat') {
    setGeneratedToken(null)
    setGeneratedTokenId(null)
    const result = type === 'hadir' ? await generateHadir() : await generateTelat()
    if (result) {
      setGeneratedToken(result.token_code)
      setGeneratedTokenId(result.id)
      setGeneratedCategory(type)
      onTokenGenerated?.(result.token_code)
    }
  }

  function handleCopy() {
    if (!generatedToken) return
    navigator.clipboard.writeText(generatedToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function handleReset() {
    setGeneratedToken(null)
    setGeneratedTokenId(null)
    setGeneratedCategory(null)
    if (qrBlobUrl) URL.revokeObjectURL(qrBlobUrl)
    setQrBlobUrl(null)
    form.reset()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-lg"
    >
      {/* ── Page Header ── */}
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
        {!generatedToken && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl shadow-black/30 overflow-hidden"
          >
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-orange-600 via-orange-400 to-amber-400" />

            <div className="p-6 space-y-6">

              {/* ── Quick Generate Buttons ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-3">Buat Cepat</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    disabled={generating || loadingActiveTokens}
                    onClick={() => handleQuickGenerate('hadir')}
                    className="
                      h-12 rounded-xl font-semibold text-sm
                      bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]
                      transition-all duration-200 shadow-lg shadow-emerald-900/30
                      disabled:opacity-60 disabled:cursor-not-allowed
                    "
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Generate QR Hadir
                  </Button>
                  <Button
                    type="button"
                    disabled={generating || loadingActiveTokens}
                    onClick={() => handleQuickGenerate('telat')}
                    className="
                      h-12 rounded-xl font-semibold text-sm
                      bg-amber-600 hover:bg-amber-500 active:scale-[0.98]
                      transition-all duration-200 shadow-lg shadow-amber-900/30
                      disabled:opacity-60 disabled:cursor-not-allowed
                    "
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Generate QR Telat
                  </Button>
                </div>
              </motion.div>

              {/* ── Divider ── */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-700/50" />
                <span className="text-xs text-slate-600 uppercase tracking-widest">atau custom</span>
                <div className="flex-1 h-px bg-slate-700/50" />
              </div>

              {/* ── Custom Form ── */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                  {/* ── Two fields side by side ── */}
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
                            <div className="
                              bg-slate-800/60 border border-slate-700/60 rounded-xl p-4
                              hover:border-slate-600 focus-within:border-orange-500/60
                              transition-all duration-200 group
                            ">
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
                                    disabled={generating || loadingActiveTokens}
                                    className="
                                      border-0 bg-transparent text-white text-3xl font-bold h-auto p-0
                                      focus-visible:ring-0 focus-visible:ring-offset-0
                                      [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                                      w-full
                                    "
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
                            <div className="
                              bg-slate-800/60 border border-slate-700/60 rounded-xl p-4
                              hover:border-slate-600 focus-within:border-orange-500/60
                              transition-all duration-200 group
                            ">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                                  <Tag className="h-3 w-3 text-amber-400" />
                                </div>
                                <span className="text-xs font-medium text-slate-400">Kategori</span>
                              </div>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  disabled={generating || loadingActiveTokens}
                                >
                                  <SelectTrigger className="
                                    border-0 bg-transparent text-white text-lg font-bold h-auto p-0
                                    focus:ring-0 focus:ring-offset-0 w-full
                                    shadow-none
                                  ">
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
                  <motion.div
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  >
                    <Button
                      type="submit"
                      disabled={generating || loadingActiveTokens}
                      className="
                        w-full h-12 rounded-xl font-semibold text-sm
                        bg-orange-500 hover:bg-orange-400 active:scale-[0.98]
                        transition-all duration-200 shadow-lg shadow-orange-900/40
                        disabled:opacity-60 disabled:cursor-not-allowed
                      "
                    >
                      <AnimatePresence mode="wait">
                        {generating || loadingActiveTokens ? (
                          <motion.div key="loading"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                          >
                            <LoadingSpinner size="sm" />
                            <span>Generating...</span>
                          </motion.div>
                        ) : (
                          <motion.div key="idle"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                          >
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

        {/* ── TOKEN RESULT STATE ── */}
        {generatedToken && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl shadow-black/30 overflow-hidden"
          >
            {/* Top accent bar — green for hadir, amber for telat */}
            <div className={`h-1 w-full bg-gradient-to-r ${
              generatedCategory === 'telat'
                ? 'from-amber-600 via-amber-400 to-yellow-400'
                : 'from-emerald-600 via-emerald-400 to-teal-400'
            }`} />

            <div className="p-6 space-y-5">

              {/* Status badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    generatedCategory === 'telat' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                  <span className={`text-xs font-semibold uppercase tracking-widest ${
                    generatedCategory === 'telat' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    Kode Aktif
                  </span>
                  {/* Category badge */}
                  <span className={`ml-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                    generatedCategory === 'telat'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {generatedCategory === 'telat' ? 'TELAT' : 'HADIR'}
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  Buat Baru
                </button>
              </div>

              {/* QR Code Display — the hero element */}
              <div className="
                bg-slate-800/80 border border-slate-700/60 rounded-2xl
                px-6 py-6 text-center relative overflow-hidden
              ">
                {/* subtle glow */}
                <div className={`absolute inset-0 blur-xl pointer-events-none ${
                  generatedCategory === 'telat' ? 'bg-amber-500/5' : 'bg-emerald-500/5'
                }`} />

                <p className="text-xs text-slate-500 mb-4 uppercase tracking-widest relative z-10">QR Code Absensi</p>

                {/* QR Image from backend */}
                {qrLoading && (
                  <div className="relative z-10 flex items-center justify-center py-4">
                    <div className="w-[200px] h-[200px] bg-slate-700/50 rounded-2xl animate-pulse flex items-center justify-center">
                      <span className="text-xs text-slate-500">Memuat QR...</span>
                    </div>
                  </div>
                )}

                {qrBlobUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
                    className="relative z-10 flex flex-col items-center"
                  >
                    <div className="bg-white rounded-2xl p-3 shadow-lg shadow-black/20 inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrBlobUrl}
                        alt={`QR Code: ${generatedToken}`}
                        width={200}
                        height={200}
                        className="block rounded-lg"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Text code below QR */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 relative z-10"
                >
                  <p className="text-xs text-slate-600 mb-1">Kode Manual</p>
                  <p className="text-2xl font-black font-mono text-white tracking-[0.2em]">
                    {generatedToken}
                  </p>
                </motion.div>
              </div>

              {/* Copy Button */}
              <Button
                onClick={handleCopy}
                className={`
                  w-full h-12 rounded-xl font-semibold text-sm
                  transition-all duration-300 active:scale-[0.98]
                  ${copied
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/40'
                    : 'bg-slate-800 hover:bg-slate-700 border border-slate-600/60 text-slate-200'
                  }
                `}
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div key="copied"
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Kode Tersalin!
                    </motion.div>
                  ) : (
                    <motion.div key="copy"
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Salin Kode
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>

              {/* Footer info */}
              <p className="text-center text-xs text-slate-600">
                Bagikan kode ini kepada siswa · Kategori:{' '}
                <span className={`font-semibold ${
                  generatedCategory === 'telat' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {generatedCategory === 'telat' ? 'TELAT' : 'HADIR'}
                </span>
              </p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  )
}