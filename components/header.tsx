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
          bg-[#f4f5f6]/90 backdrop-blur-md
          border-b border-[#e2e8f0]
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
            className="lg:hidden text-[#5a626a] hover:text-[#111111] hover:bg-[#e9ecef] rounded-md h-9 w-9 border border-transparent"
          >
            <Menu size={18} />
          </Button>

          <div className="hidden sm:flex items-center gap-2">
            <div className="w-1.5 h-4 rounded-full bg-[#c63535]" />
            <span className="text-[#111111] text-sm font-semibold tracking-tight">Panel Pengendali</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 lg:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-[#5a626a] hover:text-[#111111] hover:bg-[#e9ecef] rounded-md h-9 w-9 border border-transparent"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#c63535] rounded-full" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-[#5a626a] hover:text-[#111111] hover:bg-[#e9ecef] rounded-md h-9 w-9 border border-transparent"
          >
            <Settings size={18} />
          </Button>

          <div className="w-px h-6 bg-[#e2e8f0] mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="
                  flex items-center gap-2 px-2 py-1.5 h-9 rounded-md border border-transparent
                  text-[#5a626a] hover:text-[#111111] hover:bg-[#e9ecef]
                  transition-all duration-200 cursor-pointer
                "
              >
                <div className="w-7 h-7 rounded-full bg-[#c63535] flex items-center justify-center">
                  <User size={14} className="text-white" />
                </div>
                <span className="hidden sm:block text-sm font-semibold tracking-tight">Administrator</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="
                bg-white
                border border-[#e2e8f0]
                rounded-md
                text-[#111111] w-44 p-1
              "
            >
              <DropdownMenuItem 
                onClick={() => router.push('/admin/token')}
                className="rounded-md hover:bg-[#e9ecef] hover:text-[#111111] cursor-pointer text-sm font-light"
              >
                Pengaturan Token
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-[#e2e8f0]" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-md hover:bg-[#c63535]/10 text-[#c63535] focus:text-[#c63535] cursor-pointer text-sm font-medium"
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