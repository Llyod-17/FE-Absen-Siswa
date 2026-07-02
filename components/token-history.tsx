'use client'

import { motion } from 'framer-motion'
import { Token } from '@/lib/types'
import { useAuthImage } from '@/lib/use-auth-image'
import { Button } from '@/components/ui/button'
import { Trash2, Clock, QrCode } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { QrPreviewDialog } from '@/components/qr-preview-dialog'

function CategoryBadge({ category }: { category: string }) {
  const isHadir = category !== 'telat'
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-bold tracking-[1.5px] uppercase border ${
        isHadir
          ? 'bg-[#008751]/10 text-[#008751] border-[#008751]/20'
          : 'bg-[#b89750]/10 text-[#b89750] border-[#b89750]/20'
      }`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${isHadir ? 'bg-[#008751]' : 'bg-[#b89750]'}`} />
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
      transition={{ delay: idx * 0.03 }}
      className="hover:bg-[#e9ecef]/30 transition-colors"
    >
      {/* Created at */}
      <td className="px-5 py-4">
        {createdDate ? (
          <div className="flex flex-col">
            <span className="text-[#111111] font-semibold text-sm">{formatDate(createdDate)}</span>
            <span className="text-[#5a626a] text-xs font-light tracking-[0.5px] mt-0.5">{formatTime(createdDate)}</span>
          </div>
        ) : (
          <span className="text-[#5a626a]">-</span>
        )}
      </td>

      {/* Category */}
      <td className="px-5 py-4">
        <CategoryBadge category={token.category} />
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <div className="flex flex-col gap-0.5">
          {token.is_active ? (
            <span className="text-[#008751] text-[11px] font-bold uppercase tracking-[1.5px]">Aktif</span>
          ) : (
            <span className="text-[#c63535] text-[11px] font-bold uppercase tracking-[1.5px]">Kedaluwarsa</span>
          )}
          {validUntilDate && (
            <span className="text-[#5a626a] text-xs font-light">
              s/d {formatTime(validUntilDate)}
            </span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
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
                className="h-[36px] bg-[#ffffff] border-[#e2e8f0] text-[#111111] hover:bg-[#e9ecef] hover:border-[#cbd5e1] px-3 text-xs font-semibold rounded-md shadow-none cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 mr-1.5 text-[#c63535] shrink-0" />
                <span className="hidden sm:inline">DETAIL</span>
                <span className="sm:hidden">QR</span>
              </Button>
            }
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(String(token.id))}
            className="text-[#c63535] hover:text-[#c63535] hover:bg-[#c63535]/10 h-[36px] w-[36px] rounded-md shrink-0 border border-transparent cursor-pointer"
            title="Matikan token"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </motion.tr>
  )
}

interface TokenHistoryTableProps {
  tokens: Token[]
  loading: boolean
  onDelete: (id: string) => void
}

export function TokenHistoryTable({ tokens, loading, onDelete }: TokenHistoryTableProps) {
  if (loading) {
    return (
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-8 flex flex-col items-center justify-center min-h-[260px] shadow-none">
        <LoadingSpinner message="Memuat riwayat QR..." />
      </div>
    )
  }

  if (!tokens || tokens.length === 0) {
    return (
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-8 flex flex-col items-center justify-center min-h-[260px] text-center shadow-none">
        <div className="w-10 h-10 rounded-md bg-[#f4f5f6] flex items-center justify-center mb-4">
          <Clock className="h-5 w-5 text-[#5a626a]" />
        </div>
        <h3 className="text-sm font-semibold text-[#111111] mb-1">Tidak ada QR aktif</h3>
        <p className="text-[#5a626a] text-xs font-light max-w-[240px] leading-relaxed">Belum ada QR absensi yang dibuat atau semua QR sudah kedaluwarsa.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-none">
      <div className="p-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f4f5f6]">
        <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#c63535]" />
          Riwayat QR Code
        </h3>
        <span className="text-[10px] text-[#5a626a] bg-white px-2.5 py-1 rounded-md border border-[#e2e8f0] font-bold tracking-[0.5px]">
          Total: {tokens.length} QR
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#f4f5f6] border-b border-[#e2e8f0]">
            <tr>
              <th className="px-5 py-4 text-[11px] font-semibold text-[#5a626a] uppercase tracking-[1.5px]">Dibuat Pada</th>
              <th className="px-5 py-4 text-[11px] font-semibold text-[#5a626a] uppercase tracking-[1.5px]">Kategori</th>
              <th className="px-5 py-4 text-[11px] font-semibold text-[#5a626a] uppercase tracking-[1.5px]">Status</th>
              <th className="px-5 py-4 text-[11px] font-semibold text-[#5a626a] uppercase tracking-[1.5px] text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0]">
            {tokens.map((token, idx) => (
              <TokenRow key={token.id || idx} token={token} idx={idx} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
