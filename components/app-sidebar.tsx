'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/context/sidebar-context'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
  { label: 'Absensi Harian', href: '/admin/monitoring', icon: 'event_available' },
  { label: 'Data Siswa', href: '/admin/data-master', icon: 'group' },
  { label: 'Laporan', href: '/admin/laporan', icon: 'analytics' },
  { label: 'Pengaturan', href: '/admin/pengaturan', icon: 'settings' },
]

export function AppSidebar() {
  const { collapsed, setCollapsed } = useSidebar()
  const pathname = usePathname()

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="
          fixed left-0 top-0 h-screen z-40
          hidden lg:flex flex-col
          bg-card
          border-r border-border
          shadow-md
          overflow-hidden
        "
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-border shrink-0">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 overflow-hidden px-1"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined shrink-0 text-primary-foreground text-[28px]">shield</span>
                </div>
                <div className="min-w-0">
                  <h1 className="font-serif text-lg font-bold text-primary truncate leading-tight">
                    SMK PLUS PNB
                  </h1>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground truncate">
                    Administrative Panel
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {collapsed && (
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined shrink-0 text-primary-foreground text-[28px]">shield</span>
            </div>
          )}

          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(true)}
              className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg h-8 w-8 shrink-0"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </Button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item, i) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)

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
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group cursor-pointer',
                      collapsed && 'justify-center px-0',
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <span
                      className={cn(
                        'material-symbols-outlined shrink-0 transition-transform group-hover:scale-105',
                        isActive
                          ? 'text-primary-foreground'
                          : 'text-muted-foreground group-hover:text-foreground'
                      )}
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {item.icon}
                    </span>

                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            'text-sm whitespace-nowrap overflow-hidden',
                            isActive ? 'font-semibold' : 'font-normal'
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

        {/* Bottom */}
        <div className="p-4 border-t border-border shrink-0">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-[10px] text-muted-foreground text-center space-y-1 font-sans"
              >
                <p>&copy; 2026 SMK Plus Pelita Nusantara.</p>
                <p>All rights reserved.</p>
                <p>Developed by KicawOrgspark</p>
                <p>Powered by DEVACTO IT RPL</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Expand button when collapsed */}
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
              bg-card border border-border
              items-center justify-center
              text-muted-foreground hover:text-foreground hover:bg-accent
              shadow-sm transition-colors cursor-pointer
            "
          >
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}