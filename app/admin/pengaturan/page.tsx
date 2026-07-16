'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useTokens, useGenerateToken } from '@/lib/api-hooks'
import { QRCodeSVG } from 'qrcode.react'

export default function PengaturanPage() {
  const { tokens, loading: tokensLoading, refetch: refetchTokens } = useTokens()
  const { generate, loading: generateLoading, generatedToken, reset } = useGenerateToken()

  const [customDuration, setCustomDuration] = useState('')
  const [selectedDuration, setSelectedDuration] = useState(30)
  const [qrModalOpen, setQrModalOpen] = useState(false)


  const handleGenerate = async () => {
    const duration = customDuration ? parseInt(customDuration) : selectedDuration
    if (isNaN(duration) || duration <= 0) return

    await generate({
      duration,
      category: 'hadir',
    })

    refetchTokens()
  }

  const activeToken = generatedToken || tokens.find(t => t.is_active)

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full relative">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
            Pengaturan Sistem
          </h2>
          <p className="text-base text-muted-foreground mt-1 font-sans">
            Konfigurasi token absensi dan jam operasional
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">


          {/* Generate QR Token */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="bg-card rounded-xl border border-border shadow-sm p-6 relative overflow-hidden"
            style={{ borderTopWidth: 4, borderTopColor: '#a0f1be' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--status-hadir-text)] text-[24px]">qr_code</span>
                <h3 className="font-serif text-xl font-bold text-foreground">Generate QR Token</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center font-sans">
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground mb-1">Pilih durasi untuk token absensi kelas baru.</p>
                <div className="flex flex-wrap gap-2">
                  {[15, 30, 60].map((dur) => (
                    <Button
                      key={dur}
                      variant={selectedDuration === dur && !customDuration ? 'default' : 'outline'}
                      className={`rounded-full font-semibold text-xs uppercase tracking-[0.05em] ${selectedDuration === dur && !customDuration ? 'bg-primary/10 text-primary border-primary hover:bg-primary/20' : ''
                        }`}
                      onClick={() => { setSelectedDuration(dur); setCustomDuration(''); }}
                    >
                      {dur} Menit
                    </Button>
                  ))}
                </div>

                <div className="flex flex-col gap-2 mt-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">Atau Durasi Kustom (Menit)</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="45"
                      className="font-mono"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                    />
                    <Button
                      onClick={handleGenerate}
                      disabled={generateLoading}
                      className="bg-primary text-primary-foreground font-semibold px-6"
                    >
                      {generateLoading ? 'Generating...' : 'Generate'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-xl p-6 border border-border flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden">
                <span className="material-symbols-outlined text-muted opacity-30 text-[64px]">qr_code</span>
                <p className="text-sm text-muted-foreground text-center mt-3 font-medium">
                  {generateLoading ? 'Memproses...' : 'Menunggu generate token...'}
                </p>
              </div>
            </div>
          </motion.section>

          {/* Token QR Aktif */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="bg-card rounded-xl border border-border shadow-sm overflow-hidden font-sans"
          >
            <div className="p-4 border-b border-border bg-accent flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--status-hadir-text)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--status-hadir-text)]"></span>
                </span>
                <h3 className="font-serif text-lg font-bold text-foreground">Status Perangkat</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                    <th className="py-3 px-4 border-b border-border">ID Token</th>
                    <th className="py-3 px-4 border-b border-border">Dibuat</th>
                    <th className="py-3 px-4 border-b border-border">Berakhir</th>
                    <th className="py-3 px-4 border-b border-border">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-border">
                  {tokensLoading ? (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Memuat token...</td></tr>
                  ) : tokens.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Tidak ada riwayat token.</td></tr>
                  ) : (
                    tokens.slice(0, 5).map((token) => {
                      const createdAtStr = token.createdAt || token.created_at;
                      const validUntilStr = token.validUntil || token.valid_until || token.expired_at;
                      const created = createdAtStr ? new Date(createdAtStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
                      const validUntil = validUntilStr ? new Date(validUntilStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';

                      return (
                        <tr key={token.id} className={`transition-colors ${token.is_active ? 'bg-[var(--status-hadir)]/5' : 'opacity-60'}`}>
                          <td className="py-3 px-4 font-mono font-semibold text-foreground">{token.token_code}</td>
                          <td className="py-3 px-4 text-muted-foreground">{created} WIB</td>
                          <td className="py-3 px-4 text-muted-foreground">{validUntil} WIB</td>
                          <td className="py-3 px-4">
                            <Badge variant={token.is_active ? 'hadir' : 'belum'} className={token.is_active ? 'bg-[var(--status-hadir)]/20 flex items-center gap-1.5' : 'flex items-center gap-1.5'}>
                              <span className={`w-1.5 h-1.5 rounded-full ${token.is_active ? 'bg-[var(--status-hadir-text)]' : 'bg-muted-foreground'}`} />
                              {token.is_active ? 'Aktif' : 'Kedaluwarsa'}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.section>
        </div>

        {/* Right Column: Simulator */}
        <div className="lg:col-span-4">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="bg-card rounded-xl border border-border shadow-sm p-6 sticky top-24 h-fit"
          >
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                {activeToken && (
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--status-hadir-text)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--status-hadir-text)]"></span>
                  </span>
                )}
                <h3 className="font-serif text-xl font-bold text-foreground">
                  {activeToken ? 'QR Token Presensi Aktif' : 'Tidak Ada Token Aktif'}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground font-sans">
                {activeToken ? 'Token berlaku untuk sesi absensi saat ini' : 'Generate token baru untuk memulai sesi absensi'}
              </p>
            </div>

            {activeToken ? (
              <div className="bg-white rounded-xl p-8 mb-6 flex flex-col items-center justify-center border-2 border-dashed border-border shadow-inner relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--status-hadir-text)]"></div>
                <div className="bg-white p-2 border-2 border-[var(--status-hadir-text)] rounded-lg shadow-sm">
                  <QRCodeSVG value={activeToken.token_code} size={200} level="H" />
                </div>
                <div className="mt-5 px-4 py-1.5 bg-[var(--status-hadir-bg)] text-[var(--status-hadir-text)] rounded-full text-xs font-semibold uppercase tracking-[0.05em] border border-secondary-container font-sans">
                  FASE: {activeToken.category.toUpperCase()}
                </div>
                <button
                  onClick={() => setQrModalOpen(true)}
                  className="absolute top-2 right-2 p-2 hover:bg-muted rounded-full text-primary transition-colors"
                  title="Perbesar QR"
                >
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                </button>
              </div>
            ) : (
              <div className="bg-background rounded-xl p-8 mb-6 flex flex-col items-center justify-center border-2 border-dashed border-border shadow-inner min-h-[280px]">
                <span className="material-symbols-outlined text-muted opacity-30 text-[64px] mb-4">qr_code</span>
                <p className="text-sm text-muted-foreground font-sans text-center">Silakan generate token baru di panel sebelah kiri.</p>
              </div>
            )}

            {activeToken && (
              <div className="flex flex-col gap-4 font-sans">
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg border border-border">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">ID Token</span>
                    <span className="font-mono font-bold text-foreground">{activeToken.token_code}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Berakhir</span>
                    <span className="font-mono font-bold text-primary">
                      {activeToken.validUntil || activeToken.valid_until || activeToken.expired_at
                        ? new Date((activeToken.validUntil || activeToken.valid_until || activeToken.expired_at)!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                        : '-'} WIB
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.section>
        </div>
      </div>

      {/* Fullscreen QR Modal */}
      <AnimatePresence>
        {qrModalOpen && activeToken && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card rounded-2xl p-8 max-w-sm w-full relative shadow-xl flex flex-col items-center border border-border"
            >
              <button
                onClick={() => setQrModalOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>

              <div className="text-center mb-6 mt-2">
                <h3 className="font-serif text-2xl font-bold text-foreground">QR Token Presensi</h3>
                <p className="font-mono text-sm text-muted-foreground mt-2">
                  {activeToken.token_code} • Berakhir {activeToken.validUntil || activeToken.valid_until || activeToken.expired_at
                    ? new Date((activeToken.validUntil || activeToken.valid_until || activeToken.expired_at) as string | number).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                    : '-'} WIB
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border-4 border-primary shadow-inner mb-6">
                <QRCodeSVG value={activeToken.token_code} size={240} level="H" />
              </div>

              <div className="px-6 py-2 bg-[var(--status-hadir-bg)] text-[var(--status-hadir-text)] rounded-full text-xs font-semibold uppercase tracking-[0.05em] border border-secondary-container font-sans">
                FASE: {activeToken.category.toUpperCase()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
