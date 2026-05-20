'use client'

import { motion } from 'framer-motion'
import { Token } from '@/lib/types'
import { useAuthImage } from '@/lib/use-auth-image'
import { Button } from '@/components/ui/button'
import { Trash2, Clock, QrCode } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { QrPreviewDialog } from '@/components/qr-preview-dialog'

/* ── Shared helpers ── */

function CategoryBadge({ category }: { category: string }) {
  const isHadir = category !== 'telat'
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
        isHadir
          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      }`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${isHadir ? 'bg-emerald-400' : 'bg-amber-400'}`} />
      {isHadir ? 'HADIR' : 'TELAT'}
    </span>
  )
}

function formatDate(date: Date) {
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

/* ── Row component ── */

interface TokenRowProps {
  token: Token
  idx: number
  onDelete: (id: string) => void
}

function TokenRow({ token, idx, onDelete }: TokenRowProps) {
  const qrUrl = useAuthImage(token.id)

  const createdDate = token.createdAt ? new Date(token.createdAt) : null
  const validUntilDate = token.validUntil ? new Date(token.validUntil) : null

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="hover:bg-slate-800/40 transition-colors"
    >
      {/* Created at */}
      <td className="px-3 py-3 sm:px-6 sm:py-4">
        {createdDate ? (
          <div className="flex flex-col">
            <span className="text-white font-medium text-xs sm:text-sm">{formatDate(createdDate)}</span>
            <span className="text-slate-400 text-[10px] sm:text-xs">{formatTime(createdDate)}</span>
          </div>
        ) : (
          <span className="text-slate-400">-</span>
        )}
      </td>

      {/* Category */}
      <td className="px-3 py-3 sm:px-6 sm:py-4">
        <CategoryBadge category={token.category} />
      </td>

      {/* Status */}
      <td className="px-3 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-col gap-0.5">
          {token.is_active ? (
            <span className="text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Aktif</span>
          ) : (
            <span className="text-red-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Kedaluwarsa</span>
          )}
          {validUntilDate && (
            <span className="text-slate-500 text-[9px] sm:text-[10px]">
              s/d {formatTime(validUntilDate)}
            </span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-3 py-3 sm:px-6 sm:py-4 text-right">
        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          <QrPreviewDialog
            qrUrl={qrUrl}
            tokenCode={token.token_code}
            category={token.category}
            isActive={token.is_active}
            validUntil={validUntilDate}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-slate-800 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 px-2 sm:px-3 text-xs"
              >
                <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2 text-blue-400 shrink-0" />
                <span className="hidden sm:inline">Lihat Selengkapnya</span>
                <span className="sm:hidden">Detail</span>
              </Button>
            }
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(String(token.id))}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 h-8 w-8 rounded-lg shrink-0"
            title="Hapus token"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </motion.tr>
  )
}

/* ── Table component ── */

interface TokenHistoryTableProps {
  tokens: Token[]
  loading: boolean
  onDelete: (id: string) => void
}

export function TokenHistoryTable({ tokens, loading, onDelete }: TokenHistoryTableProps) {
  if (loading) {
    return (
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
        <LoadingSpinner message="Memuat riwayat QR..." />
      </div>
    )
  }

  if (!tokens || tokens.length === 0) {
    return (
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <Clock className="h-6 w-6 text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">Tidak ada QR aktif</h3>
        <p className="text-slate-400 text-sm">Belum ada QR absensi yang dibuat atau semua QR sudah kedaluwarsa.</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
      <div className="p-5 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/30">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-400" />
          Riwayat QR Code
        </h3>
        <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 font-medium">
          Total: {tokens.length} QR
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase tracking-wider bg-slate-800/80 border-b border-slate-700/50">
            <tr>
              <th className="px-3 py-3 sm:px-6 sm:py-4 font-semibold">Dibuat Pada</th>
              <th className="px-3 py-3 sm:px-6 sm:py-4 font-semibold">Kategori</th>
              <th className="px-3 py-3 sm:px-6 sm:py-4 font-semibold">Status</th>
              <th className="px-3 py-3 sm:px-6 sm:py-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {tokens.map((token, idx) => (
              <TokenRow key={token.id || idx} token={token} idx={idx} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
