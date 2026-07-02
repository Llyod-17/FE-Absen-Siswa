'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DataPoint {
  date: string
  Hadir: number
  Telat: number
  Sakit: number
  Alpa: number
  Belum: number
}

interface CustomSvgChartProps {
  data: DataPoint[]
}

const CATEGORIES = [
  { key: 'Hadir', label: 'Hadir', color: '#10b981' }, // Emerald-500
  { key: 'Telat', label: 'Telat', color: '#f59e0b' }, // Amber-500
  { key: 'Sakit', label: 'Sakit', color: '#f97316' }, // Orange-500
  { key: 'Alpa', label: 'Alpa', color: '#f43f5e' },   // Rose-500
  { key: 'Belum', label: 'Belum Absen', color: '#64748b' } // Slate-500
] as const

export function CustomSvgChart({ data }: CustomSvgChartProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>({
    Hadir: true,
    Telat: true,
    Sakit: true,
    Alpa: true,
    Belum: true
  })

  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const handleToggle = (key: string) => {
    setActiveFilters((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      // Ensure at least one filter is active
      if (!Object.values(next).some(Boolean)) return prev
      return next
    })
  }

  // Chart configuration dimensions
  const width = 600
  const height = 300
  const paddingLeft = 40
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 40

  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom

  // Calculate absolute stacked totals for each day based on active filters
  const dailyTotals = data.map((day) => {
    return CATEGORIES.reduce((sum, cat) => {
      if (activeFilters[cat.key]) {
        return sum + (day[cat.key as keyof DataPoint] as number || 0)
      }
      return sum
    }, 0)
  })

  const maxTotal = Math.max(...dailyTotals, 10) // Avoid division by 0

  // Grid ticks
  const ticksCount = 5
  const ticks = Array.from({ length: ticksCount }, (_, i) => Math.round((maxTotal / (ticksCount - 1)) * i))

  // Render bars
  const barWidth = 40
  const gap = (chartWidth - barWidth * data.length) / (data.length - 1 || 1)

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Tren Kehadiran Harian (7 Hari)</h3>
          <p className="text-xs text-slate-500 font-light">Grafik interaktif presensi terintegrasi</p>
        </div>
        
        {/* Toggle Filters */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const active = activeFilters[cat.key]
            return (
              <button
                key={cat.key}
                onClick={() => handleToggle(cat.key)}
                className={`
                  flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full border transition-all cursor-pointer
                  ${active 
                    ? 'bg-slate-900 text-white border-transparent' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }
                `}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          {/* Y Axis Grid Lines */}
          {ticks.map((tick, idx) => {
            const y = paddingTop + chartHeight - (tick / maxTotal) * chartHeight
            return (
              <g key={idx} className="opacity-45">
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="#cbd5e1" 
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text 
                  x={paddingLeft - 8} 
                  y={y + 4} 
                  textAnchor="end" 
                  className="fill-slate-500 font-mono text-[10px]"
                >
                  {tick}
                </text>
              </g>
            )
          })}

          {/* Bars */}
          {data.map((day, dayIdx) => {
            const x = paddingLeft + dayIdx * (barWidth + gap)
            
            // Calculate absolute stack values
            let currentY = paddingTop + chartHeight
            const stackSegments: { key: string; height: number; y: number; color: string; val: number }[] = []

            CATEGORIES.forEach((cat) => {
              if (activeFilters[cat.key]) {
                const val = (day[cat.key as keyof DataPoint] as number) || 0
                const segmentHeight = (val / maxTotal) * chartHeight
                currentY -= segmentHeight
                stackSegments.push({
                  key: cat.key,
                  height: segmentHeight,
                  y: currentY,
                  color: cat.color,
                  val
                })
              }
            })

            return (
              <g 
                key={dayIdx}
                onMouseEnter={() => {
                  setHoveredBarIndex(dayIdx)
                  setTooltipPos({
                    x: x + barWidth / 2,
                    y: Math.min(...stackSegments.map(s => s.y)) - 10
                  })
                }}
                onMouseMove={() => {
                  setTooltipPos({
                    x: x + barWidth / 2,
                    y: Math.min(...stackSegments.map(s => s.y)) - 10
                  })
                }}
                onMouseLeave={() => setHoveredBarIndex(null)}
                className="cursor-pointer"
              >
                {/* Invisible hover area cover */}
                <rect 
                  x={x - 4} 
                  y={paddingTop} 
                  width={barWidth + 8} 
                  height={chartHeight} 
                  fill="transparent"
                />

                {/* Stacked rects */}
                {stackSegments.map((seg) => (
                  <motion.rect
                    key={seg.key}
                    x={x}
                    y={seg.y}
                    width={barWidth}
                    height={seg.height}
                    fill={seg.color}
                    rx={2}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    className="transition-all duration-200"
                    style={{ transformOrigin: 'bottom' }}
                    opacity={hoveredBarIndex === null || hoveredBarIndex === dayIdx ? 1 : 0.65}
                  />
                ))}

                {/* X Axis Label */}
                <text 
                  x={x + barWidth / 2} 
                  y={height - paddingBottom + 18} 
                  textAnchor="middle" 
                  className="fill-slate-600 font-medium text-[11px]"
                >
                  {day.date}
                </text>
              </g>
            )
          })}

          {/* X Axis Line */}
          <line 
            x1={paddingLeft} 
            y1={paddingTop + chartHeight} 
            x2={width - paddingRight} 
            y2={paddingTop + chartHeight} 
            stroke="#94a3b8" 
            strokeWidth={1} 
          />
        </svg>

        {/* HTML Tooltip on hover */}
        <AnimatePresence>
          {hoveredBarIndex !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: 'absolute',
                left: `${(tooltipPos.x / width) * 100}%`,
                top: `${(tooltipPos.y / height) * 100}%`,
                transform: 'translate(-50%, -100%)',
                zIndex: 50
              }}
              className="bg-slate-900 text-white rounded-lg p-3 shadow-xl text-left min-w-[130px] pointer-events-none"
            >
              <p className="text-[10px] font-mono text-slate-400 mb-1 border-b border-slate-800 pb-1">
                {data[hoveredBarIndex].date}
              </p>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => {
                  const val = data[hoveredBarIndex][cat.key as keyof DataPoint] as number
                  if (!activeFilters[cat.key] || val === 0) return null
                  return (
                    <div key={cat.key} className="flex items-center justify-between text-[11px] gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="font-light text-slate-300">{cat.label}</span>
                      </div>
                      <span className="font-semibold">{val} siswa</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
