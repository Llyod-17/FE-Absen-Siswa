'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: number
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'slate'
  index?: number
}

const colorConfig = {
  blue: {
    accent: 'bg-[#c63535]',
    icon: 'text-[#c63535]',
    iconBg: 'bg-[#c63535]/10',
  },
  green: {
    accent: 'bg-[#008751]',
    icon: 'text-[#008751]',
    iconBg: 'bg-[#008751]/10',
  },
  purple: {
    accent: 'bg-[#b89750]',
    icon: 'text-[#b89750]',
    iconBg: 'bg-[#b89750]/10',
  },
  orange: {
    accent: 'bg-[#ea580c]',
    icon: 'text-[#ea580c]',
    iconBg: 'bg-[#ea580c]/10',
  },
  red: {
    accent: 'bg-[#c63535]',
    icon: 'text-[#c63535]',
    iconBg: 'bg-[#c63535]/10',
  },
  slate: {
    accent: 'bg-[#5a626a]',
    icon: 'text-[#5a626a]',
    iconBg: 'bg-[#5a626a]/10',
  },
}

export function StatsCard({
  icon: Icon,
  label,
  value,
  color = 'blue',
  index = 0,
}: StatsCardProps) {
  const cfg = colorConfig[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="
        relative overflow-hidden
        bg-white
        border border-[#e2e8f0]
        rounded-xl
        p-5 cursor-default
        hover:border-[#cbd5e1] transition-colors duration-200
        shadow-none
      "
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${cfg.accent}`} />

      <div className="relative flex items-start justify-between gap-3">
        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-[#5a626a] uppercase tracking-[1.5px] mb-1.5 truncate">
            {label}
          </p>
          <motion.h3
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 + 0.1, duration: 0.3 }}
            className="text-[28px] font-black text-[#111111] tracking-tight leading-none"
          >
            {value}
          </motion.h3>
        </div>

        {/* Icon box — 8px radius */}
        <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
          <Icon size={18} className={cfg.icon} />
        </div>
      </div>
    </motion.div>
  )
}