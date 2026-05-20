'use client'

import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'
import { BarChart2, TrendingUp } from 'lucide-react'

interface AttendanceChartProps {
  data: Array<{ date: string; attendance: number; total?: number }>
  title?: string
  type?: 'line' | 'bar'
}

/* ── Custom dark tooltip ── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/60 rounded-xl px-4 py-3 shadow-2xl shadow-black/40">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-white">
        {payload[0].value}
        <span className="text-xs text-slate-400 font-normal ml-1">siswa</span>
      </p>
    </div>
  )
}

const chartCommonProps = {
  margin: { top: 4, right: 4, left: -16, bottom: 0 },
}

const axisStyle = {
  stroke: '#334155',
  tick: { fill: '#64748b', fontSize: 11 },
}

export function AttendanceChart({
  data,
  title = 'Attendance Trend',
  type = 'line',
}: AttendanceChartProps) {
  const Icon = type === 'line' ? TrendingUp : BarChart2

  if (!data || data.length === 0) {
    return (
      <div className="
        bg-slate-900/70 backdrop-blur-xl border border-slate-700/50
        rounded-2xl shadow-xl shadow-black/30 p-6
      ">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Icon className="h-4 w-4 text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        <div className="h-64 flex items-center justify-center text-slate-600 text-sm">
          Tidak ada data tersedia
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="
        bg-slate-900/70 backdrop-blur-xl border border-slate-700/50
        rounded-2xl shadow-xl shadow-black/30 p-5 overflow-hidden
      "
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
          <Icon className="h-4 w-4 text-blue-400" />
        </div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={260}>
        {type === 'line' ? (
          <LineChart data={data} {...chartCommonProps}>
            <defs>
              <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                <stop offset="50%" stopColor="#60a5fa" stopOpacity={1} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke={axisStyle.stroke}
              tick={axisStyle.tick}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke={axisStyle.stroke}
              tick={axisStyle.tick}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1 }} />
            <Line
              type="monotone"
              dataKey="attendance"
              stroke="url(#lineGlow)"
              strokeWidth={2.5}
              dot={{ fill: '#60a5fa', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#93c5fd', strokeWidth: 0 }}
            />
          </LineChart>
        ) : (
          <BarChart data={data} {...chartCommonProps}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke={axisStyle.stroke}
              tick={axisStyle.tick}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke={axisStyle.stroke}
              tick={axisStyle.tick}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', radius: 8 }} />
            <Bar
              dataKey="attendance"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  )
}