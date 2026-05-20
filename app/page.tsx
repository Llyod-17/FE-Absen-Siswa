"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Fingerprint, CheckCircle2, XCircle, Clock, Calendar, MapPin, Hash, AlertCircle } from "lucide-react";
import { useLoginPage } from "./hooks/useLoginPage";
import { LoginFormBody } from "../components/LoginFormBody";
import { cardVariants } from "../lib/shared";
import { QRScannerModal } from "@/components/QRScannerModal";

/* ── format helpers ── */
function formatTime(date: Date) {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ── receipt row ── */
function ReceiptRow({
  icon: Icon,
  label,
  value,
  mono = false,
  valueClassName,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-dashed border-slate-700/50 last:border-0">
      <span className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <span
        className={`text-xs text-right ${mono ? "font-mono tracking-wider" : "font-medium"} ${
          valueClassName ?? "text-slate-200"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function LoginPage() {
  const {
    currentScreen,
    showTokenModal,
    showPassword,
    appError,
    scanError,
    isLoggingIn,
    tokenExpiredError,
    attendanceStatus,
    loginForm,
    onLoginSubmit,
    onQRSubmit,
    handleRetry,
    handleCloseTokenModal,
    setShowPassword,
    successTime,
  } = useLoginPage();

  return (
    <>
      {/* Background */}
      <div className="fixed inset-0 bg-[#0a0f1e] overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm">

          {/* Top badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="flex items-center gap-2 bg-blue-950/60 border border-blue-800/40 rounded-full px-4 py-1.5 text-blue-300 text-xs font-medium backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              Sistem Absensi Digital
            </div>
          </motion.div>

          <AnimatePresence mode="wait">

            {/* ── LOGIN / ERROR card ── */}
            {(currentScreen === "login" || currentScreen === "error") && (
              <motion.div
                key="login-card"
                variants={cardVariants} initial="hidden" animate="visible" exit="exit"
                className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
              >
                <div className="px-6 pt-8 pb-6 text-center border-b border-slate-800/60">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4, ease: "backOut" }}
                    className="w-20 h-20 rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-xl shadow-black/20 flex items-center justify-center mx-auto mb-4 relative overflow-hidden backdrop-blur-sm"
                  >
                    {/* Efek kilau cahaya lembut di dalam bingkai */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-indigo-500/5 pointer-events-none" />
                    
                    <img
                      src="/logo-sekolah.png"
                      alt="Logo SMK PLUS PNB"
                      className="h-20 w-20 object-contain relative z-10"
                    />
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-xl font-bold text-white tracking-tight"
                  >
                    Selamat Datang
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-slate-500 mt-1"
                  >
                    Masuk untuk mmelanjutkan
                  </motion.p>
                </div>

                <div className="p-6">
                  <LoginFormBody
                    showError={currentScreen === "error"}
                    appError={appError}
                    isLoggingIn={isLoggingIn}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword((prev) => !prev)}
                    onRetry={handleRetry}
                    loginForm={loginForm}
                    onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  />
                </div>
              </motion.div>
            )}

            {/* ── SUCCESS card — receipt style ── */}
            {currentScreen === "success" && successTime && (
              <motion.div
                key="success-card"
                variants={cardVariants} initial="hidden" animate="visible" exit="exit"
                className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
              >
                {/* Header */}
                <div className="px-6 pt-8 pb-5 text-center border-b border-slate-800/60">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                    className="w-16 h-16 rounded-2xl bg-emerald-950/60 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-900/30"
                  >
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-2xl font-black text-white tracking-tight">TRABSEN! 🎉</h2>
                    <p className="text-sm text-emerald-400/80 font-medium mt-1">Absensi berhasil dicatat</p>
                  </motion.div>
                </div>

                {/* Receipt body */}
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="px-6 py-4"
                >
                  {/* Receipt ID */}
                  <div className="flex items-center justify-center gap-1.5 mb-3">
                    <Hash className="h-3 w-3 text-slate-600" />
                    <span className="text-xs text-slate-600 font-mono tracking-widest">
                      {successTime.receiptId}
                    </span>
                  </div>

                  {/* Detail rows */}
                  <div className="bg-slate-800/40 rounded-xl px-4 py-1 border border-slate-700/40">
                    <ReceiptRow icon={Clock} label="Waktu" value={formatTime(successTime.date)} mono />
                    <ReceiptRow icon={Calendar} label="Tanggal" value={formatDate(successTime.date)} />
                    <ReceiptRow icon={MapPin} label="Lokasi" value="Area Sekolah ✓" />
                  </div>

                  {/* Status badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 flex items-center justify-center"
                  >
                    <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 border ${
                      attendanceStatus === 'telat'
                        ? 'bg-amber-950/60 border-amber-700/40'
                        : 'bg-emerald-950/60 border-emerald-700/40'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                        attendanceStatus === 'telat' ? 'bg-amber-400' : 'bg-emerald-400'
                      }`} />
                      <span className={`text-xs font-semibold tracking-widest ${
                        attendanceStatus === 'telat' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {attendanceStatus === 'telat' ? 'TELAT' : 'HADIR'}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Progress bar */}
                <div className="px-6 pb-6 pt-1">
                  <p className="text-xs text-slate-600 text-center mb-2">Mengalihkan ke beranda...</p>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "linear" }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── SCAN ERROR card — receipt style ── */}
            {currentScreen === "scan_error" && successTime && (
              <motion.div
                key="scan-error-card"
                variants={cardVariants} initial="hidden" animate="visible" exit="exit"
                className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
              >
                {/* Header */}
                <div className="px-6 pt-8 pb-5 text-center border-b border-slate-800/60">
                  <motion.div
                    initial={{ scale: 0, rotate: 20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                    className="w-16 h-16 rounded-2xl bg-red-950/60 border-2 border-red-500/40 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-900/30"
                  >
                    <XCircle className="h-8 w-8 text-red-400" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-2xl font-black text-white tracking-tight">Gagal! 😔</h2>
                    <p className="text-sm text-red-400/80 font-medium mt-1">Absensi tidak berhasil dicatat</p>
                  </motion.div>
                </div>

                {/* Receipt body */}
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="px-6 py-4"
                >
                  {/* Receipt ID */}
                  <div className="flex items-center justify-center gap-1.5 mb-3">
                    <Hash className="h-3 w-3 text-slate-600" />
                    <span className="text-xs text-slate-600 font-mono tracking-widest">
                      {successTime.receiptId}
                    </span>
                  </div>

                  {/* Detail rows */}
                  <div className="bg-slate-800/40 rounded-xl px-4 py-1 border border-slate-700/40">
                    <ReceiptRow icon={Clock} label="Waktu" value={formatTime(successTime.date)} mono />
                    <ReceiptRow icon={Calendar} label="Tanggal" value={formatDate(successTime.date)} />
                    <ReceiptRow
                      icon={AlertCircle}
                      label="Alasan"
                      value={scanError ?? "QR tidak valid atau sudah kadaluarsa"}
                      valueClassName="text-red-400"
                    />
                  </div>

                  {/* Status badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 flex items-center justify-center"
                  >
                    <div className="flex items-center gap-2 bg-red-950/60 border border-red-700/40 rounded-full px-4 py-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      <span className="text-xs text-red-400 font-semibold tracking-widest">TIDAK HADIR</span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Progress bar */}
                <div className="px-6 pb-6 pt-1">
                  <p className="text-xs text-slate-600 text-center mb-2">Mengembalikan ke halaman login...</p>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-red-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "linear" }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Bottom note */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-center mt-6 space-y-1.5"
          >
            <p className="text-xs font-semibold text-slate-400 tracking-wide">
              Absensi Siswa SMK PLUS PNB
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[9px] font-medium tracking-widest uppercase text-slate-600">
              <span>Powered by</span>
              <span className="h-1 w-1 rounded-full bg-slate-700" />
              <span className="text-blue-500/80 font-bold tracking-wide">DEVACTO IT RPL</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        open={showTokenModal}
        onClose={handleCloseTokenModal}
        onScanSuccess={onQRSubmit}
        expiredError={tokenExpiredError}
      />
    </>
  );
}