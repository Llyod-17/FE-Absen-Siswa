'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Key,
  LogOut,
  Download,
  ShieldCheck,
  X,
  Activity,
} from 'lucide-react'
import { authAPI } from '@/api/auth'

const navItems = [
  { label: 'Ringkasan', href: '/admin', icon: LayoutDashboard },
  { label: 'Data Kehadiran', href: '/admin/monitoring', icon: Activity },
  { label: 'QR Absensi', href: '/admin/token', icon: Key },
  { label: 'Unduh Laporan', href: '/admin/export', icon: Download },
]

interface MobileSidebarDrawerProps {
  open: boolean
  onClose: () => void
}

export function MobileSidebarDrawer({ open, onClose }: MobileSidebarDrawerProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await authAPI.logout()
    router.push('/')
    router.refresh()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="
              fixed left-0 top-0 h-screen w-72 z-50 lg:hidden flex flex-col
              bg-slate-900/95 backdrop-blur-xl
              border-r border-slate-700/50
              shadow-2xl shadow-black/60
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-white font-bold text-sm tracking-wide">
                  Absen Admin
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-400 hover:text-white hover:bg-slate-800/60 h-8 w-8 rounded-lg"
              >
                <X size={16} />
              </Button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-5 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold px-3 mb-3">
                Navigasi
              </p>
              {navItems.map((item, i) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 + 0.1 }}
                  >
                    <Link href={item.href} onClick={onClose}>
                      <div
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer',
                          isActive
                            ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        )}
                      >
                        <Icon
                          size={18}
                          className={cn('shrink-0', isActive && 'text-blue-400')}
                        />
                        <span className="text-sm font-medium">{item.label}</span>
                        {isActive && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                        )}
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-slate-700/50">
              <div
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-950/40 transition-all duration-200 cursor-pointer"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Logout</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}