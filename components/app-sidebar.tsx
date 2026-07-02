'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Download,
  ShieldCheck,
  Activity,
  Users,
  Key,
} from 'lucide-react'
import { useSidebar } from '@/context/sidebar-context'
import { authAPI } from '@/api/auth'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Absensi Harian', href: '/admin/monitoring', icon: Activity },
  { label: 'Data Siswa', href: '/admin/students', icon: Users },
  { label: 'Laporan', href: '/admin/export', icon: Download },
  { label: 'Pengaturan', href: '/admin/token', icon: Key },
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
          bg-sidebar
          border-r border-sidebar-border
          overflow-hidden
        "
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border shrink-0">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2.5 overflow-hidden"
              >
                <div className="w-8 h-8 rounded-md bg-sidebar-primary flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4 text-sidebar-primary-foreground" />
                </div>
                <span className="text-sidebar-foreground font-bold text-sm tracking-wide whitespace-nowrap">
                  Absen Admin
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {collapsed && (
            <div className="w-8 h-8 rounded-md bg-sidebar-primary flex items-center justify-center mx-auto">
              <ShieldCheck className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
          )}

          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(true)}
              className="text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md h-8 w-8 shrink-0 border border-transparent"
            >
              <ChevronLeft size={16} />
            </Button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          {!collapsed && (
            <p className="text-[10px] uppercase tracking-[1.5px] text-sidebar-foreground/45 font-bold px-3 mb-3">
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
                      'flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group cursor-pointer border border-transparent',
                      collapsed && 'justify-center px-0',
                      isActive
                        ? 'bg-sidebar-accent border border-sidebar-border text-sidebar-foreground font-semibold'
                        : 'text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                    )}
                  >
                    <Icon
                      size={18}
                      className={cn(
                        'shrink-0 transition-transform group-hover:scale-105',
                        isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80'
                      )}
                    />

                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            'text-sm whitespace-nowrap overflow-hidden',
                            isActive ? 'font-medium text-sidebar-foreground' : 'font-light'
                          )}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-sidebar-border shrink-0">
          <div
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-[#c63535]',
              'hover:bg-[#c63535]/10 border border-transparent transition-all duration-200 cursor-pointer',
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
                  className="text-sm font-semibold whitespace-nowrap overflow-hidden"
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
              w-6 h-6 rounded-md
              bg-[#0f0f11] border border-[rgba(255,255,255,0.08)]
              items-center justify-center
              text-[rgba(244,245,246,0.7)] hover:text-[#f4f5f6] hover:bg-[rgba(255,255,255,0.05)]
              transition-colors cursor-pointer
            "
          >
            <ChevronRight size={12} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}