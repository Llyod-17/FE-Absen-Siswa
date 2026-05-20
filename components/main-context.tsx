'use client'

import { cn } from '@/lib/utils'
import { useSidebar } from '@/context/sidebar-context'

export function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <main
      className={cn(
        "pt-24 px-4 pb-8 lg:px-8 lg:pb-10 min-h-screen transition-[margin-left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        collapsed ? "lg:ml-20" : "lg:ml-64"
      )}
    >
      {children}
    </main>
  )
}