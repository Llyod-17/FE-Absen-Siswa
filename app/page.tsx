"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  Hash,
  AlertCircle,
  ScanLine,
  LogOut,
  User as UserIcon,
  BookOpen,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLoginPage } from "./hooks/useLoginPage";
import { LoginFormBody } from "../components/LoginFormBody";
import { cardVariants } from "../lib/shared";
import { QRScannerModal } from "@/components/QRScannerModal";
import { logsAPI } from "@/lib/api-client";

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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat Pagi";
  if (h < 15) return "Selamat Siang";
  if (h < 18) return "Selamat Sore";
  return "Selamat Malam";
}

function relativeTime(dateStr: string) {
  const now = new Date();
  const then = new Date(dateStr);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
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
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-dashed border-[#e6dfd8] last:border-0">
      <span className="flex items-center gap-1.5 text-xs text-[#8e8b82] shrink-0">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <span
        className={`text-xs text-right ${mono ? "font-mono tracking-wider" : "font-medium"} ${valueClassName ?? "text-[#3d3d3a]"
          }`}
      >
        {value}
      </span>
    </div>
  );
}

/* ── status badge color map ── */
const statusStyle: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  hadir: { bg: "bg-[#008751]/10", text: "text-[#008751]", dot: "bg-[#008751]", label: "HADIR" },
  telat: { bg: "bg-[#b89750]/10", text: "text-[#b89750]", dot: "bg-[#b89750]", label: "TELAT" },
  sakit: { bg: "bg-[#ea580c]/10", text: "text-[#ea580c]", dot: "bg-[#ea580c]", label: "SAKIT" },
  alfa: { bg: "bg-[#c63535]/10", text: "text-[#c63535]", dot: "bg-[#c63535]", label: "ALFA" },
  belum_absen: { bg: "bg-[#5a626a]/10", text: "text-[#5a626a]", dot: "bg-[#5a626a]", label: "BELUM" },
};

/* ══════════════════════════════════════════
   STUDENT DASHBOARD — shown after login
═══════════════════════════════════════════ */
interface LogEntry {
  id: number;
  user: { id: number; full_name: string };
  status: string;
  captured_ip: string;
  clock_in_time: string;
}

function StudentDashboard() {
  const { user, logout } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const { onQRSubmit, tokenExpiredError, attendanceStatus, successTime, currentScreen, scanError } = useLoginPage();

  const fetchLogs = useCallback(async () => {
    try {
      setLogsLoading(true);
      const result = await logsAPI.getHistory();

      if ("data" in result && result.data) {
        const payload = result.data as unknown;
        const normalizedLogs = Array.isArray(payload)
          ? payload
          : Array.isArray((payload as { logs?: unknown }).logs)
            ? (payload as { logs: LogEntry[] }).logs
            : Array.isArray((payload as { data?: unknown }).data)
              ? (payload as { data: LogEntry[] }).data
              : [];

        setLogs(normalizedLogs as LogEntry[]);
      } else {
        setLogs([]);
      }
    } catch {
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Compute stats from logs
  const totalHadir = logs.filter((l) => l.status === "hadir").length;
  const totalTelat = logs.filter((l) => l.status === "telat").length;
  const totalAlfa = logs.filter((l) => l.status === "alfa" || l.status === "sakit").length;

  // Today's status
  const today = new Date().toISOString().split("T")[0];
  const todayLog = logs.find((l) => l.clock_in_time?.startsWith(today));
  const todayStatus = todayLog ? todayLog.status : "belum_absen";
  const st = statusStyle[todayStatus] || statusStyle.belum_absen;

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <>
      <div className="min-h-screen bg-[#faf9f5] pb-28">
        {/* ── Top bar ── */}
        <div className="sticky top-0 z-30 bg-[#f4f5f6]/80 backdrop-blur-md border-b border-[#e2e8f0]">
          <div className="max-w-lg mx-auto px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/logo-sekolah.webp"
                alt="Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="text-sm font-semibold text-[#111111] tracking-tight">Absensi Digital</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-[#8e8b82] hover:text-[#c63535] transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Keluar
            </button>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-5 pt-6 space-y-5">
          {/* ── Greeting ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm text-[#8e8b82] font-medium">{getGreeting()}</p>
            <h1 className="text-2xl font-bold text-[#111111] tracking-tight mt-0.5 font-[family-name:var(--font-playfair)]">
              {user?.fullname || "Siswa"}
            </h1>
          </motion.div>

          {/* ── Identity card ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="bg-white rounded-xl border border-[#e2e8f0] p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#c63535]/10 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-[#c63535]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111111] truncate">{user?.fullname}</p>
                <p className="text-xs text-[#8e8b82]">NISN: {user?.nisn}</p>
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${st.bg}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${st.dot} animate-pulse`} />
                <span className={`text-[10px] font-bold tracking-wider ${st.text}`}>{st.label}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#5a626a]">
              <BookOpen className="h-3.5 w-3.5 text-[#8e8b82]" />
              <span className="font-medium">{user?.class_group || "—"}</span>
              <span className="text-[#e2e8f0]">·</span>
              <span>{formatDate(new Date())}</span>
            </div>
          </motion.div>

          {/* ── Stats row ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-3 gap-3"
          >
            {[
              { label: "Hadir", value: totalHadir, color: "#008751" },
              { label: "Telat", value: totalTelat, color: "#b89750" },
              { label: "Alfa/Sakit", value: totalAlfa, color: "#c63535" },
            ].map((s, i) => (
              <div
                key={s.label}
                className="bg-white rounded-xl border border-[#e2e8f0] p-3.5 text-center"
              >
                <p className="text-2xl font-black tracking-tight" style={{ color: s.color }}>
                  {s.value}
                </p>
                <p className="text-[10px] font-semibold text-[#8e8b82] uppercase tracking-wider mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>

          {/* ── Recent attendance history ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#006039]" />
                <span className="text-sm font-semibold text-[#111111]">Riwayat Absensi</span>
              </div>
              <span className="text-[10px] text-[#8e8b82] font-medium uppercase tracking-wider">
                {logs.length} data
              </span>
            </div>

            {logsLoading ? (
              <div className="px-4 py-8 text-center">
                <div className="w-5 h-5 border-2 border-[#e6dfd8] border-t-[#cc785c] rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-[#8e8b82]">Memuat riwayat...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Calendar className="h-8 w-8 text-[#cbd5e1] mx-auto mb-2" />
                <p className="text-sm text-[#8e8b82]">Belum ada riwayat absensi</p>
              </div>
            ) : (
              <div className="divide-y divide-[#e9ecef]">
                {logs.slice(0, 10).map((log, i) => {
                  const ls = statusStyle[log.status] || statusStyle.belum_absen;
                  const clockDate = new Date(log.clock_in_time);
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="px-4 py-3 flex items-center gap-3 hover:bg-[#f4f5f6] transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg ${ls.bg} flex items-center justify-center shrink-0`}>
                        <div className={`w-2 h-2 rounded-full ${ls.dot}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#111111]">
                          {clockDate.toLocaleDateString("id-ID", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-[#8e8b82]">
                          {clockDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold tracking-wider ${ls.text}`}>
                        {ls.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* ── Footer credits ── */}
          <div className="text-center pt-2 pb-4">
            <p className="text-[10px] text-[#b89750] font-semibold tracking-wider uppercase">
              SMK PLUS PNB · Powered by DEVACTO IT RPL
            </p>
          </div>
        </div>

        {/* ── Floating QR Scan Button ── */}
        <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
          <div className="max-w-lg mx-auto px-5 pb-6 flex justify-center">
            <motion.button
              onClick={() => setShowScanner(true)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.3 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="
                pointer-events-auto
                w-16 h-16 rounded-full
                bg-[#c63535] hover:bg-[#a32a2a]
                shadow-lg shadow-[#c63535]/30
                border-2 border-[#b89750]
                flex items-center justify-center
                transition-colors duration-200
                cursor-pointer
                relative
              "
              aria-label="Scan QR Absensi"
            >
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-full bg-[#006039]/20 animate-ping" />
              <ScanLine className="h-7 w-7 text-white relative z-10" />
            </motion.button>
          </div>
        </div>
      </div>

      <QRScannerModal
        open={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={(token) => {
          setShowScanner(false);
          onQRSubmit(token);
        }}
        expiredError={tokenExpiredError}
      />
    </>
  );
}


/* ══════════════════════════════════════════
   MAIN COMPONENT — Login + routing
═══════════════════════════════════════════ */
export default function LoginPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

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

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f5f6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#e2e8f0] border-t-[#c63535] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#8e8b82]">Memuat...</p>
        </div>
      </div>
    );
  }

  // Authenticated student → show dashboard
  if (isAuthenticated && user?.role === "siswa") {
    return <StudentDashboard />;
  }

  return (
    <>
      {/* ── Background ── */}
      <div className="fixed inset-0 bg-[#f4f5f6] overflow-hidden -z-10">
        {/* Soft warm gradient blobs */}
        <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#c63535]/[0.05] blur-[100px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[450px] h-[450px] rounded-full bg-[#b89750]/[0.05] blur-[100px]" />
        {/* Subtle dot grid texture */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(circle, #cbd5e1 0.5px, transparent 0.5px)`,
            backgroundSize: "24px 24px",
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
            <div className="flex items-center gap-2 bg-white/80 border border-[#e2e8f0] rounded-full px-4 py-1.5 text-[#5a626a] text-xs font-semibold backdrop-blur-sm shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-[#c63535]" />
              Sistem Absensi Digital
            </div>
          </motion.div>

          <AnimatePresence mode="wait">

            {/* ── LOGIN / ERROR card ── */}
            {(currentScreen === "login" || currentScreen === "error") && (
              <motion.div
                key="login-card"
                variants={cardVariants} initial="hidden" animate="visible" exit="exit"
                className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="px-6 pt-8 pb-6 text-center border-b border-[#e2e8f0]">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4, ease: "backOut" }}
                    className="w-20 h-20 rounded-2xl bg-[#f4f5f6] border border-[#e2e8f0] flex items-center justify-center mx-auto mb-4 relative overflow-hidden"
                  >
                    <img
                      src="/logo-sekolah.webp"
                      alt="Logo SMK PLUS PNB"
                      className="h-20 w-20 object-contain relative z-10"
                    />
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-xl font-bold text-[#111111] tracking-tight font-[family-name:var(--font-playfair)]"
                  >
                    Selamat Datang
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-[#8e8b82] mt-1"
                  >
                    Masuk untuk melanjutkan
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
                className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="px-6 pt-8 pb-5 text-center border-b border-[#e2e8f0]">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                    className="w-16 h-16 rounded-2xl bg-[#008751]/10 border-2 border-[#008751]/30 flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle2 className="h-8 w-8 text-[#008751]" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-2xl font-black text-[#111111] tracking-tight font-[family-name:var(--font-playfair)]">Tercatat!</h2>
                    <p className="text-sm text-[#008751] font-medium mt-1">Absensi berhasil dicatat</p>
                  </motion.div>
                </div>

                {/* Receipt body */}
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="px-6 py-4"
                >
                  <div className="flex items-center justify-center gap-1.5 mb-3">
                    <Hash className="h-3 w-3 text-[#cbd5e1]" />
                    <span className="text-xs text-[#8e8b82] font-mono tracking-widest">
                      {successTime.receiptId}
                    </span>
                  </div>

                  <div className="bg-[#f4f5f6] rounded-xl px-4 py-1 border border-[#e2e8f0]">
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
                    <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 border ${attendanceStatus === 'telat'
                      ? 'bg-[#b89750]/10 border-[#b89750]/30'
                      : 'bg-[#008751]/10 border-[#008751]/30'
                      }`}>
                      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${attendanceStatus === 'telat' ? 'bg-[#b89750]' : 'bg-[#008751]'
                        }`} />
                      <span className={`text-xs font-semibold tracking-widest ${attendanceStatus === 'telat' ? 'text-[#b89750]' : 'text-[#008751]'
                        }`}>
                        {attendanceStatus === 'telat' ? 'TELAT' : 'HADIR'}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Progress bar */}
                <div className="px-6 pb-6 pt-1">
                  <p className="text-xs text-[#8e8b82] text-center mb-2">Mengalihkan ke beranda...</p>
                  <div className="w-full h-1 bg-[#e9ecef] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#008751]"
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
                className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="px-6 pt-8 pb-5 text-center border-b border-[#e2e8f0]">
                  <motion.div
                    initial={{ scale: 0, rotate: 20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                    className="w-16 h-16 rounded-2xl bg-[#c63535]/10 border-2 border-[#c63535]/30 flex items-center justify-center mx-auto mb-4"
                  >
                    <XCircle className="h-8 w-8 text-[#c63535]" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-2xl font-black text-[#111111] tracking-tight font-[family-name:var(--font-playfair)]">Gagal</h2>
                    <p className="text-sm text-[#c63535] font-medium mt-1">Absensi tidak berhasil dicatat</p>
                  </motion.div>
                </div>

                {/* Receipt body */}
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="px-6 py-4"
                >
                  <div className="flex items-center justify-center gap-1.5 mb-3">
                    <Hash className="h-3 w-3 text-[#cbd5e1]" />
                    <span className="text-xs text-[#8e8b82] font-mono tracking-widest">
                      {successTime.receiptId}
                    </span>
                  </div>

                  <div className="bg-[#f4f5f6] rounded-xl px-4 py-1 border border-[#e2e8f0]">
                    <ReceiptRow icon={Clock} label="Waktu" value={formatTime(successTime.date)} mono />
                    <ReceiptRow icon={Calendar} label="Tanggal" value={formatDate(successTime.date)} />
                    <ReceiptRow
                      icon={AlertCircle}
                      label="Alasan"
                      value={scanError ?? "QR tidak valid atau sudah kadaluarsa"}
                      valueClassName="text-[#c63535]"
                    />
                  </div>

                  {/* Status badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 flex items-center justify-center"
                  >
                    <div className="flex items-center gap-2 bg-[#c63535]/10 border border-[#c63535]/30 rounded-full px-4 py-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#c63535] animate-pulse" />
                      <span className="text-xs text-[#c63535] font-semibold tracking-widest">TIDAK HADIR</span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Progress bar */}
                <div className="px-6 pb-6 pt-1">
                  <p className="text-xs text-[#8e8b82] text-center mb-2">Mengembalikan ke halaman login...</p>
                  <div className="w-full h-1 bg-[#e9ecef] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#c63535]"
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
            <p className="text-xs font-semibold text-[#8e8b82] tracking-wide uppercase">
              Absensi Siswa SMK PLUS PNB
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[9px] font-medium tracking-widest uppercase text-[#8e8b82]">
              <span>Powered by</span>
              <span className="h-1 w-1 rounded-full bg-[#cbd5e1]" />
              <span className="text-[#006039] font-bold tracking-wide">DEVACTO IT RPL</span>
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