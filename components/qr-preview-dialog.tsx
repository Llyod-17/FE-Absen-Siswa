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
  const categoryColor = isHadir ? 'text-[#008751]' : 'text-[#b89750]'

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border border-[#e2e8f0] rounded-xl text-[#111111] shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-sm font-semibold text-[#111111] uppercase tracking-wider">Detail QR Absensi</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-6 bg-[#f4f5f6] rounded-md border border-[#e2e8f0] mt-2">
          {!isActive ? (
            <div className="text-center p-6 bg-[#c63535]/5 border border-[#c63535]/10 rounded-md w-full">
              <div className="w-12 h-12 bg-[#c63535]/10 rounded-md flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-[#c63535]" />
              </div>
              <p className="text-[#c63535] font-bold mb-2 text-xs">
                Maaf, QR ini sudah kadaluarsa pada
              </p>
              <p className="text-[#111111] font-semibold text-sm">
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
              className="w-72 h-72 bg-white p-3 rounded-md border border-[#e2e8f0]"
            />
          ) : (
            <div className="w-72 h-72 bg-white animate-pulse rounded-md border border-[#e2e8f0] flex items-center justify-center text-[#5a626a] text-xs font-light">
              Memuat QR...
            </div>
          )}

          <div className="mt-6 text-center space-y-1">
            <p className="text-[10px] text-[#5a626a] uppercase tracking-[1.5px] font-mono">Kode Manual</p>
            <p className="text-2xl font-mono font-bold tracking-[0.2em] text-[#111111]">{tokenCode}</p>
            <p className="text-xs mt-2 font-light">
              <span className="text-[#5a626a]">Kategori: </span>
              <span className={`${categoryColor} font-bold uppercase`}>{categoryLabel}</span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
