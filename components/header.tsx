'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, User, Settings, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MobileSidebarDrawer } from '@/components/mobile-sidebar-drawer'
import { useSidebar } from '@/context/sidebar-context'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/api/auth'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { collapsed } = useSidebar()
  const router = useRouter()

  const handleLogout = async () => {
    await authAPI.logout()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <MobileSidebarDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={`
          fixed top-0 right-0 h-16 z-30
          bg-slate-900/80 backdrop-blur-xl
          border-b border-slate-700/50
          px-4 lg:px-6
          flex items-center justify-between
          transition-[left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          left-0
          ${collapsed ? 'lg:left-20' : 'lg:left-64'}
        `}
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg h-9 w-9"
          >
            <Menu size={18} />
          </Button>

          <div className="hidden sm:flex items-center gap-2">
            <div className="w-1.5 h-4 rounded-full bg-blue-500" />
            <span className="text-slate-300 text-sm font-medium">Absen Admin</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 lg:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg h-9 w-9"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full ring-1 ring-slate-900" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg h-9 w-9"
          >
            <Settings size={18} />
          </Button>

          <div className="w-px h-6 bg-slate-700/60 mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="
                  flex items-center gap-2 px-2 py-1.5 h-9 rounded-xl
                  text-slate-300 hover:text-white hover:bg-slate-800/60
                  transition-all duration-200
                "
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center">
                  <User size={14} className="text-blue-400" />
                </div>
                <span className="hidden sm:block text-sm font-medium">Admin</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="
                bg-slate-900/95 backdrop-blur-xl
                border border-slate-700/60
                rounded-xl shadow-2xl shadow-black/40
                text-slate-300 w-44 p-1
              "
            >
              <DropdownMenuItem className="rounded-lg hover:bg-slate-800/60 hover:text-white cursor-pointer text-sm">
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem className="rounded-lg hover:bg-slate-800/60 hover:text-white cursor-pointer text-sm">
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-700/50 my-1" />

              {/* ✅ ACTIVE LOGOUT */}
              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 cursor-pointer text-sm"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>
    </>
  )
}