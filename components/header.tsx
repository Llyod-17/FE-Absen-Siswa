'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { MobileSidebarDrawer } from '@/components/mobile-sidebar-drawer'
import { useSidebar } from '@/context/sidebar-context'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/api/auth'
import { useAdminNotifications } from '@/lib/api-hooks'
import type { AdminNotification } from '@/lib/types'

/* ── Helper: relative time ── */
function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'Baru saja'
  if (diffMin < 60) return `${diffMin} menit lalu`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} jam lalu`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay} hari lalu`
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

/* ── Icon per type ── */
function notifIcon(tipe: AdminNotification['tipe']): string {
  switch (tipe) {
    case 'wa_error':   return 'sms_failed'
    case 'wa_status':  return 'phonelink_erase'
    case 'daily_recap':return 'summarize'
    default:           return 'notifications'
  }
}
function notifColor(tipe: AdminNotification['tipe']): string {
  switch (tipe) {
    case 'wa_error':   return 'var(--destructive)'
    case 'wa_status':  return '#f59e0b'
    case 'daily_recap':return '#22c55e'
    default:           return 'var(--muted-foreground)'
  }
}

/* ── Confirmation dialog type ── */
type ConfirmType = 'delete-all' | 'delete-selected' | null

export function Header() {
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [notifOpen, setNotifOpen]     = useState(false)
  const [selectMode, setSelectMode]   = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [confirmType, setConfirmType] = useState<ConfirmType>(null)
  const [isDeleting, setIsDeleting]   = useState(false)

  const notifRef = useRef<HTMLDivElement>(null)
  const { collapsed } = useSidebar()
  const router = useRouter()

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteSelected,
    deleteAll,
  } = useAdminNotifications(60_000)

  const handleLogout = async () => {
    await authAPI.logout()
    router.push('/')
    router.refresh()
  }

  /* close dropdown when clicking outside */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [notifOpen])

  /* reset select mode when dropdown closes */
  useEffect(() => {
    if (!notifOpen) {
      setSelectMode(false)
      setSelectedIds(new Set())
    }
  }, [notifOpen])

  /* ── Select helpers ── */
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const toggleSelectAll = () => {
    setSelectedIds(
      selectedIds.size === notifications.length
        ? new Set()
        : new Set(notifications.map((n) => n.id))
    )
  }

  /* ── Confirm dialog handler ── */
  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      if (confirmType === 'delete-all') {
        await deleteAll()
        setSelectMode(false)
        setSelectedIds(new Set())
      } else if (confirmType === 'delete-selected') {
        await deleteSelected(Array.from(selectedIds))
        setSelectedIds(new Set())
        setSelectMode(false)
      }
    } finally {
      setIsDeleting(false)
      setConfirmType(null)
    }
  }

  const confirmTitle = confirmType === 'delete-all'
    ? 'Hapus semua notifikasi?'
    : `Hapus ${selectedIds.size} notifikasi?`

  const confirmDesc = confirmType === 'delete-all'
    ? `Semua ${notifications.length} notifikasi akan dihapus secara permanen dan tidak dapat dikembalikan.`
    : `${selectedIds.size} notifikasi yang dipilih akan dihapus secara permanen.`

  return (
    <>
      <MobileSidebarDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* ── Confirmation Dialog ── */}
      <Dialog open={confirmType !== null} onOpenChange={(open) => { if (!open && !isDeleting) setConfirmType(null) }}>
        <DialogContent className="sm:max-w-[380px] bg-card border border-border text-foreground">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-destructive text-[20px]">delete_forever</span>
              </div>
              <DialogTitle className="text-base font-semibold font-sans">{confirmTitle}</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground font-sans pl-[52px]">
              {confirmDesc}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-2 justify-end pt-2">
            <Button
              variant="ghost"
              onClick={() => setConfirmType(null)}
              disabled={isDeleting}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Batal
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/80 cursor-pointer min-w-[90px]"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Menghapus...
                </span>
              ) : 'Ya, Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={`
          fixed top-0 right-0 h-16 z-30
          bg-background/90 backdrop-blur-md
          border-b border-border
          px-5 lg:px-6
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
            className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg h-9 w-9"
          >
            <span className="material-symbols-outlined text-[18px]">menu</span>
          </Button>
          <h1 className="hidden md:block font-serif text-lg font-bold text-primary">
            SMK PLUS PNB
          </h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">

          {/* ── Notification Bell ── */}
          <div ref={notifRef} className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotifOpen((p) => !p)}
              className="relative text-muted-foreground hover:text-foreground hover:bg-accent rounded-full h-10 w-10"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {/* ── Dropdown ── */}
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 top-[calc(100%+8px)] w-[380px] max-h-[480px] bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 flex flex-col"
                >
                  {/* ── Header row ── */}
                  <div className="px-4 py-2.5 border-b border-border flex items-center justify-between bg-background/60 backdrop-blur-sm gap-2 shrink-0">
                    <h3 className="font-semibold text-sm text-foreground font-sans shrink-0">
                      Notifikasi
                      {unreadCount > 0 && (
                        <span className="ml-1.5 text-[10px] font-bold bg-primary/15 text-primary rounded-full px-1.5 py-0.5">
                          {unreadCount} baru
                        </span>
                      )}
                    </h3>

                    <div className="flex items-center gap-1 ml-auto">
                      {/* Mark all read */}
                      {unreadCount > 0 && !selectMode && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] text-primary hover:underline font-medium cursor-pointer px-1.5 py-0.5"
                        >
                          Tandai semua
                        </button>
                      )}

                      {/* Select mode toggle */}
                      {notifications.length > 0 && (
                        <button
                          onClick={() => {
                            setSelectMode((p) => !p)
                            setSelectedIds(new Set())
                          }}
                          className={`text-[11px] font-medium cursor-pointer px-2 py-1 rounded-md transition-colors ${
                            selectMode
                              ? 'bg-accent text-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                          }`}
                        >
                          {selectMode ? 'Batal' : 'Pilih'}
                        </button>
                      )}

                      {/* Delete all — opens dialog */}
                      {notifications.length > 0 && !selectMode && (
                        <button
                          onClick={() => setConfirmType('delete-all')}
                          title="Hapus semua notifikasi"
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ── Select mode action bar ── */}
                  <AnimatePresence>
                    {selectMode && notifications.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden shrink-0"
                      >
                        <div className="px-4 py-2 border-b border-border bg-accent/30 flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={selectedIds.size === notifications.length && notifications.length > 0}
                              onChange={toggleSelectAll}
                              className="w-3.5 h-3.5 accent-primary cursor-pointer"
                            />
                            <span className="text-xs text-muted-foreground font-sans">
                              {selectedIds.size > 0 ? `${selectedIds.size} dipilih` : 'Pilih semua'}
                            </span>
                          </label>

                          <button
                            onClick={() => {
                              if (selectedIds.size > 0) setConfirmType('delete-selected')
                            }}
                            disabled={selectedIds.size === 0}
                            className="flex items-center gap-1.5 text-xs text-destructive font-medium px-2.5 py-1.5 rounded-md hover:bg-destructive/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                            Hapus ({selectedIds.size})
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Notification list ── */}
                  <div className="flex-1 overflow-y-auto overscroll-contain">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                        <span className="material-symbols-outlined text-[38px] opacity-30">notifications_off</span>
                        <span className="text-sm font-sans">Tidak ada notifikasi</span>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            if (selectMode) {
                              toggleSelect(notif.id)
                            } else if (!notif.is_read) {
                              markAsRead(notif.id)
                            }
                          }}
                          className={`
                            relative flex gap-3 items-start px-4 py-3
                            border-b border-border/50 last:border-b-0
                            transition-colors duration-150 cursor-pointer
                            hover:bg-accent/40
                            ${!notif.is_read && !selectMode ? 'bg-accent/25' : ''}
                          `}
                        >
                          {/* Checkbox in select mode */}
                          {selectMode && (
                            <div className="flex items-center pt-1 shrink-0">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(notif.id)}
                                onChange={() => toggleSelect(notif.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-3.5 h-3.5 accent-primary cursor-pointer"
                              />
                            </div>
                          )}

                          {/* Icon */}
                          {!selectMode && (
                            <div
                              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5"
                              style={{ backgroundColor: `color-mix(in srgb, ${notifColor(notif.tipe)} 15%, transparent)` }}
                            >
                              <span
                                className="material-symbols-outlined text-[17px]"
                                style={{ color: notifColor(notif.tipe) }}
                              >
                                {notifIcon(notif.tipe)}
                              </span>
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground truncate font-sans">
                                {notif.judul}
                              </span>
                              {!notif.is_read && !selectMode && (
                                <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 font-sans">
                              {notif.pesan}
                            </p>
                            <span className="text-[11px] text-muted-foreground/60 mt-1 block font-sans">
                              {timeAgo(notif.created_at)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-px h-6 bg-border mx-2" />

          {/* ── User Dropdown ── */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 px-2 py-1.5 h-10 rounded-full text-foreground hover:bg-accent transition-all duration-200 cursor-pointer"
              >
                <div className="text-right hidden sm:block">
                  <div className="font-label-caps text-label-caps text-foreground uppercase">Admin Utama</div>
                  <div className="text-[12px] text-muted-foreground">Administrator</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-accent border border-border flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity">
                  <span className="material-symbols-outlined text-muted-foreground text-[20px]">account_circle</span>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="bg-card border border-border rounded-lg text-foreground w-48 p-1 shadow-lg"
            >
              <DropdownMenuItem
                onClick={() => router.push('/admin/pengaturan')}
                className="rounded-lg hover:bg-accent cursor-pointer text-sm"
              >
                Pengaturan Token
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-lg hover:bg-destructive/10 text-destructive focus:text-destructive cursor-pointer text-sm font-medium"
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