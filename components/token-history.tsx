'use client'

import { motion } from 'framer-motion'
import { Token } from '@/lib/types'
import { useAuthImage } from '@/lib/use-auth-image'
import { Button } from '@/components/ui/button'
import { Trash2, Clock, QrCode } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface TokenHistoryTableProps {
  tokens: Token[]
  loading: boolean
  onDelete: (id: string) => void
}

function TokenRow({ token, idx, onDelete }: { token: Token; idx: number; onDelete: (id: string) => void }) {
  const qrUrl = useAuthImage(token.id)

  const createdDate = token.createdAt ? new Date(token.createdAt) : null
  const validUntilDate = token.validUntil ? new Date(token.validUntil) : null

  return (
    <motion.tr
      key={token.id || idx}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="hover:bg-slate-800/40 transition-colors"
    >
      <td className="px-6 py-4">
        {createdDate ? (
          <div className="flex flex-col">
            <span className="text-white font-medium">{createdDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            <span className="text-slate-400 text-xs">{createdDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ) : (
          <span className="text-slate-400">-</span>
        )}
      </td>
      <td className="px-6 py-4">
        {token.category === 'telat' ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            TELAT
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            HADIR
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          {token.is_active ? (
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Aktif</span>
          ) : (
            <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Kedaluwarsa</span>
          )}
          {validUntilDate && (
            <span className="text-slate-500 text-[10px]">
              s/d {validUntilDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-slate-800 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <QrCode className="w-4 h-4 mr-2 text-blue-400" />
                Show QR
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle className="text-center">QR Code Absensi</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center p-8 bg-slate-800/50 rounded-xl border border-slate-700 mt-4">
                {qrUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={qrUrl} alt={`QR ${token.token_code}`} className="w-64 h-64 bg-white p-3 rounded-2xl shadow-xl" />
                ) : (
                  <div className="w-64 h-64 bg-slate-700 animate-pulse rounded-2xl flex items-center justify-center text-slate-400">
                    Memuat QR...
                  </div>
                )}
                
                <div className="mt-8 text-center space-y-2">
                  <p className="text-xs text-slate-400 uppercase tracking-widest">Kode Manual</p>
                  <p className="text-4xl font-mono font-black tracking-[0.2em]">{token.token_code}</p>
                  <p className="text-sm mt-2">
                    <span className="text-slate-400">Kategori: </span>
                    <span className={token.category === 'telat' ? 'text-amber-400 font-semibold uppercase' : 'text-emerald-400 font-semibold uppercase'}>
                      {token.category}
                    </span>
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(String(token.id))}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 h-8 w-8 rounded-lg"
            title="Hapus token"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </motion.tr>
  )
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
        <h3 className="text-lg font-semibold text-white mb-1">Tidak ada token aktif</h3>
        <p className="text-slate-400 text-sm">Belum ada token absensi yang dibuat atau semua token sudah kedaluwarsa.</p>
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
              <th className="px-6 py-4 font-semibold">Dibuat Pada</th>
              <th className="px-6 py-4 font-semibold">Kategori</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Aksi</th>
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
