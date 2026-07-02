"use client"

import { useEffect, useRef, useId } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, ScanLine } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogTitle
} from "@/components/ui/dialog"

interface Props {
    open: boolean
    onClose: () => void
    onScanSuccess: (token: string) => void
    expiredError?: string | null
}

export function QRScannerModal({
    open,
    onClose,
    onScanSuccess,
    expiredError
}: Props) {

    const scannerRef = useRef<Html5Qrcode | null>(null)
    const startedRef = useRef(false)
    // useId biar id-nya unik & stabil, aman kalau komponen di-render lebih dari sekali
    const uid = useId()
    const readerId = `qr-reader-${uid.replace(/:/g, "")}`

    useEffect(() => {

        if (!open || startedRef.current) return

        const timer = setTimeout(() => {

            const el = document.getElementById(readerId)
            if (!el) {
                console.error("reader element not found")
                return
            }

            const scanner = new Html5Qrcode(readerId)

            scannerRef.current = scanner
            startedRef.current = true

            scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },

                async (decodedText) => {
                    try {
                        await scanner.stop()
                        await scanner.clear()
                    } catch { }

                    startedRef.current = false
                    onScanSuccess(decodedText)
                },

                () => { }
            )

        }, 300)

        return () => {
            clearTimeout(timer)

            if (scannerRef.current && startedRef.current) {
                scannerRef.current
                    .stop()
                    .then(() => scannerRef.current?.clear())
                    .catch(() => { })
            }

            startedRef.current = false
        }

    }, [open, onScanSuccess, readerId])


    const handleClose = async () => {

        if (scannerRef.current && startedRef.current) {
            try {
                await scannerRef.current.stop()
                await scannerRef.current.clear()
            } catch { }
        }

        startedRef.current = false
        onClose()
    }


    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-[#f4f5f6] text-[#111111] border-[#e2e8f0] shadow-xl">

                <DialogTitle className="text-lg font-bold text-[#111111] flex items-center gap-2">
                    <ScanLine className="h-5 w-5 text-[#c63535]" />
                    Scan QR Absensi
                </DialogTitle>

                {/* ── Expired Token Alert ── */}
                <AnimatePresence>
                    {expiredError && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="flex items-start gap-2.5 rounded-md p-3 border bg-[#b89750]/10 border-[#b89750]/20">
                                <AlertCircle className="h-4 w-4 text-[#b89750] shrink-0 mt-0.5" />
                                <p className="text-sm text-[#7c6330] font-medium">{expiredError}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div
                    id={readerId}
                    className="rounded-md overflow-hidden min-h-[300px] border border-[#e2e8f0]"
                />

                <p className="text-sm text-[#8e8b82]">
                    Arahkan kamera ke QR guru
                </p>

            </DialogContent>
        </Dialog>
    )
}