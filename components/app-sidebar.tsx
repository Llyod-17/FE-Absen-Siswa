'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Key,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Download,
  ShieldCheck,
  Activity,
} from 'lucide-react'
import { useSidebar } from '@/context/sidebar-context'
import { authAPI } from '@/api/auth'

const navItems = [
  { label: 'Ringkasan', href: '/admin', icon: LayoutDashboard },
  { label: 'Data Kehadiran', href: '/admin/monitoring', icon: Activity },
  { label: 'QR Absensi', href: '/admin/token', icon: Key },
  { label: 'Unduh Laporan', href: '/admin/export', icon: Download },
]

export function AppSidebar() {
  const { collapsed, setCollapsed } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await authAPI.logout()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <motion.div
        animate={{ width: collapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="
          fixed left-0 top-0 h-screen z-40
          hidden lg:flex flex-col
          bg-slate-900/90 backdrop-blur-xl
          border-r border-slate-700/50
          shadow-2xl shadow-black/40
          overflow-hidden
        "
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-700/50 shrink-0">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2.5 overflow-hidden"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-white font-bold text-sm tracking-wide whitespace-nowrap">
                  Absen Admin
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center mx-auto">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
            </div>
          )}

          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(true)}
              className="text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg h-8 w-8 shrink-0"
            >
              <ChevronLeft size={16} />
            </Button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-hidden">
          {!collapsed && (
            <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold px-3 mb-3">
              Navigasi
            </p>
          )}

          {navItems.map((item, i) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.1 }}
              >
                <Link href={item.href}>
                  <div
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer',
                      collapsed && 'justify-center px-0',
                      isActive
                        ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    )}
                  >
                    <Icon
                      size={18}
                      className={cn(
                        'shrink-0 transition-transform group-hover:scale-110',
                        isActive && 'text-blue-400'
                      )}
                    />

                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm font-medium whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {isActive && !collapsed && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"
                      />
                    )}
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-700/50 shrink-0">
          <div
            onClick={handleLogout} // ✅ ACTIVE LOGOUT
            title={collapsed ? 'Logout' : undefined}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/70',
              'hover:text-red-400 hover:bg-red-950/40 transition-all duration-200 cursor-pointer',
              collapsed && 'justify-center px-0'
            )}
          >
            <LogOut size={18} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-medium whitespace-nowrap overflow-hidden"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {collapsed && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={() => setCollapsed(false)}
            style={{ left: 68 }}
            className="
              fixed top-[72px] z-50
              hidden lg:flex
              w-6 h-6 rounded-full
              bg-slate-800 border border-slate-600
              items-center justify-center
              text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-700
              transition-colors shadow-lg shadow-black/30
            "
          >
            <ChevronRight size={12} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}