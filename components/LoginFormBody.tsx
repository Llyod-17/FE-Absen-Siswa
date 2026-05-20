"use client";

import { UseFormReturn } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowRight,
  User,
  Lock,
  AlertCircle,
  Loader2,
  WifiOff,
  Clock,
  ShieldX,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  AppError,
  ErrorType,
  LoginFormData,
  fieldVariants,
  errorBannerVariants,
} from "../lib/shared";

/* ── error icon map ── */
const errorIconMap: Record<ErrorType, React.ElementType> = {
  credentials: AlertCircle,
  network: WifiOff,
  role: ShieldX,
  timeout: Clock,
  unknown: AlertTriangle,
};

interface LoginFormBodyProps {
  showError?: boolean;
  appError: AppError | null;
  isLoggingIn: boolean;
  showPassword: boolean;
  onTogglePassword: () => void;
  onRetry: () => void;
  loginForm: UseFormReturn<LoginFormData>;
  onSubmit: (e: React.BaseSyntheticEvent) => void;
}

export function LoginFormBody({
  showError,
  appError,
  isLoggingIn,
  showPassword,
  onTogglePassword,
  onRetry,
  loginForm,
  onSubmit,
}: LoginFormBodyProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">

      {/* Error banner */}
      <AnimatePresence>
        {showError && appError && (
          <motion.div variants={errorBannerVariants} initial="hidden" animate="visible" exit="exit">
            <div className="flex items-start gap-3 bg-red-950/60 border border-red-800/50 rounded-xl p-3.5">
              {(() => {
                const Icon = errorIconMap[appError.type];
                return <Icon className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />;
              })()}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-300">{appError.message}</p>
                {(appError.type === "network" || appError.type === "timeout") && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="mt-2 flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" /> Coba lagi
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NISN */}
      <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
        <Label htmlFor="nisn" className="text-sm font-medium text-slate-300 mb-1.5 block">
          Nomor Induk Siswa / Nomor Induk Guru
        </Label>
        <div className="relative group">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-blue-400 z-10" />
          <Input
            id="nisn"
            type="text"
            inputMode="numeric"
            placeholder="Masukkan Nomor Induk"
            disabled={isLoggingIn}
            className="
              pl-10 bg-slate-800/60 border-slate-700/60 text-slate-100
              placeholder:text-slate-600 rounded-xl h-11
              focus-visible:ring-1 focus-visible:ring-blue-500/60 focus-visible:border-blue-500/60
              transition-all duration-200 hover:border-slate-600
              disabled:opacity-50
            "
            {...loginForm.register("nisn", {
              onChange: (e) => { e.target.value = e.target.value.replace(/\D/g, ""); },
            })}
          />
        </div>
        <AnimatePresence>
          {loginForm.formState.errors.nisn && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-xs text-red-400 mt-1.5 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" /> {loginForm.formState.errors.nisn.message}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Password + eye toggle */}
      <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
        <Label htmlFor="password" className="text-sm font-medium text-slate-300 mb-1.5 block">
          Password
        </Label>
        <div className="relative group">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-blue-400 z-10" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Masukkan Password"
            disabled={isLoggingIn}
            className="
              pl-10 pr-11 bg-slate-800/60 border-slate-700/60 text-slate-100
              placeholder:text-slate-600 rounded-xl h-11
              focus-visible:ring-1 focus-visible:ring-blue-500/60 focus-visible:border-blue-500/60
              transition-all duration-200 hover:border-slate-600
              disabled:opacity-50
            "
            {...loginForm.register("password")}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={onTogglePassword}
            disabled={isLoggingIn}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            className="
              absolute right-3.5 top-1/2 -translate-y-1/2 z-10
              text-slate-500 hover:text-slate-300
              transition-colors duration-200
              disabled:opacity-40 disabled:cursor-not-allowed
              focus:outline-none
            "
          >
            <AnimatePresence mode="wait">
              {showPassword ? (
                <motion.span
                  key="eye-off"
                  initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.6, rotate: 12 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  <EyeOff className="h-4 w-4" />
                </motion.span>
              ) : (
                <motion.span
                  key="eye"
                  initial={{ opacity: 0, scale: 0.6, rotate: 12 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.6, rotate: -12 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  <Eye className="h-4 w-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
        <AnimatePresence>
          {loginForm.formState.errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-xs text-red-400 mt-1.5 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" /> {loginForm.formState.errors.password.message}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Ingat Saya */}
      <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible"
        className="flex items-center gap-2.5"
      >
        <Checkbox
          id="ingatSaya"
          checked={loginForm.watch("ingatSaya")}
          disabled={isLoggingIn}
          onCheckedChange={(c) => loginForm.setValue("ingatSaya", c as boolean)}
          className="border-slate-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
        />
        <label
          htmlFor="ingatSaya"
          className="text-sm text-slate-400 cursor-pointer select-none hover:text-slate-300 transition-colors"
        >
          Ingat Saya
          <AnimatePresence>
            {loginForm.watch("ingatSaya") && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.2 }}
                className="ml-1.5 text-[10px] text-blue-400/70"
              >
                · NISN tersimpan
              </motion.span>
            )}
          </AnimatePresence>
        </label>
      </motion.div>

      {/* Submit */}
      <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
        <Button
          type="submit"
          disabled={isLoggingIn}
          className="
            w-full h-11 rounded-xl font-semibold tracking-wide
            bg-blue-600 hover:bg-blue-500 active:scale-[0.98]
            transition-all duration-200 shadow-lg shadow-blue-900/40
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {isLoggingIn ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</>
          ) : (
            <><ArrowRight className="mr-2 h-4 w-4" /> Masuk</>
          )}
        </Button>
      </motion.div>
    </form>
  );
}