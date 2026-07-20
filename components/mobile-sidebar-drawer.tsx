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
  Users,
} from 'lucide-react'
import { authAPI } from '@/api/auth'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Absensi Harian', href: '/admin/monitoring', icon: Activity },
  { label: 'Data Siswa', href: '/admin/students', icon: Users },
  { label: 'Laporan', href: '/admin/export', icon: Download },
  { label: 'Pengaturan', href: '/admin/token', icon: Key },
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
            className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="
              fixed left-0 top-0 h-screen w-72 z-50 lg:hidden flex flex-col
              bg-[#0f0f11]
              border-r border-[rgba(255,255,255,0.08)]
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-[rgba(255,255,255,0.08)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-[#c63535] flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-white" />
                </div>
                <span className="text-[#f4f5f6] font-bold text-sm tracking-wide">
                  Absen Admin
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-[rgba(244,245,246,0.7)] hover:text-[#f4f5f6] hover:bg-[rgba(255,255,255,0.05)] h-8 w-8 rounded-md border border-transparent cursor-pointer"
              >
                <X size={16} />
              </Button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
              <p className="text-[10px] uppercase tracking-[1.5px] text-[rgba(244,245,246,0.4)] font-bold px-3 mb-3">
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
                          'flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 cursor-pointer border border-transparent',
                          isActive
                            ? 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.10)] text-[#f4f5f6]'
                            : 'text-[rgba(244,245,246,0.7)] hover:text-[#f4f5f6] hover:bg-[rgba(255,255,255,0.03)]'
                        )}
                      >
                        <Icon
                          size={18}
                          className={cn('shrink-0', isActive ? 'text-[#b89750]' : 'text-[rgba(244,245,246,0.5)]')}
                        />
                        <span className={cn('text-sm', isActive ? 'font-medium text-[#f4f5f6]' : 'font-light')}>
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            {/* Bottom Section */}
            <div className="p-3 border-t border-[rgba(255,255,255,0.08)] shrink-0 flex flex-col gap-4">
              <div
                onClick={() => {
                  handleLogout()
                  onClose()
                }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-[#c63535]',
                  'hover:bg-[#c63535]/10 border border-transparent transition-all duration-200 cursor-pointer'
                )}
              >
                <LogOut size={18} className="shrink-0" />
                <span className="text-sm font-semibold">Logout</span>
              </div>

              <div className="text-[10px] text-[rgba(244,245,246,0.4)] text-center space-y-1 font-sans pb-2">
                <p>&copy; 2026 SMK Plus Pelita Nusantara.</p>
                <p>All rights reserved.</p>
                <p>Developed by KicawOrgspark</p>
                <p>Powered by DEVACTO IT RPL</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}