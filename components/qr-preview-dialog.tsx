'use client'

import { Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface QrPreviewDialogProps {
  trigger: React.ReactNode
  qrUrl: string | null
  tokenCode: string
  category: string
  isActive: boolean
  validUntil?: Date | null
}

/**
 * Shared full-screen QR preview dialog.
 * - Active tokens display the QR image at a large size for scanning.
 * - Expired tokens display an expiry notice with the exact timestamp.
 */
export function QrPreviewDialog({
  trigger,
  qrUrl,
  tokenCode,
  category,
  isActive,
  validUntil,
}: QrPreviewDialogProps) {
  const isHadir = category !== 'telat'
  const categoryLabel = isHadir ? 'HADIR' : 'TELAT'
  const categoryColor = isHadir ? 'text-emerald-400' : 'text-amber-400'

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-center">Detail QR Absensi</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-800/50 rounded-xl border border-slate-700 mt-4">
          {!isActive ? (
            <div className="text-center p-6 bg-red-500/10 border border-red-500/20 rounded-xl w-full">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-red-400 font-medium mb-2 text-sm">
                Maaf, QR ini sudah kadaluarsa pada
              </p>
              <p className="text-white font-bold text-base">
                {validUntil
                  ? `${validUntil.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })} pukul ${validUntil.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
                  : '-'}
              </p>
            </div>
          ) : qrUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={qrUrl}
              alt={`QR ${tokenCode}`}
              className="w-80 h-80 sm:w-96 sm:h-96 bg-white p-4 rounded-3xl shadow-2xl"
            />
          ) : (
            <div className="w-80 h-80 sm:w-96 sm:h-96 bg-slate-700 animate-pulse rounded-3xl flex items-center justify-center text-slate-400">
              Memuat QR...
            </div>
          )}

          <div className="mt-8 text-center space-y-2">
            <p className="text-xs text-slate-400 uppercase tracking-widest">Kode Manual</p>
            <p className="text-4xl font-mono font-black tracking-[0.2em]">{tokenCode}</p>
            <p className="text-sm mt-2">
              <span className="text-slate-400">Kategori: </span>
              <span className={`${categoryColor} font-semibold uppercase`}>{categoryLabel}</span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
