'use client'

import { useState, useEffect, useRef } from 'react'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { BarChart2, TrendingUp, PieChart as PieIcon, AlertTriangle, Calendar } from 'lucide-react'

/* =========================================================
   CUSTOM CHART CONTAINER — bypasses ResponsiveContainer
   Uses ResizeObserver to measure parent width in pixels
   and renders chart with explicit w/h dimensions.
========================================================= */
function ChartContainer({ children, height = 240 }: { children: (width: number, height: number) => React.ReactNode; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const el = containerRef.current

    // Initial measurement
    const rect = el.getBoundingClientRect()
    if (rect.width > 0) setWidth(Math.floor(rect.width))

    // Observe future resizes
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width
        if (w > 0) setWidth(Math.floor(w))
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [mounted])

  if (!mounted) {
    return (
      <div style={{ height, width: '100%' }} className="w-full flex items-center justify-center">
        <div className="animate-pulse w-full h-full bg-[rgba(0,0,0,0.02)] rounded-lg" />
      </div>
    )
  }

  return (
    <div ref={containerRef} style={{ height, width: '100%', minWidth: 0 }} className="relative">
      {width > 0 ? children(width, height) : (
        <div className="animate-pulse w-full h-full bg-[rgba(0,0,0,0.02)] rounded-lg" />
      )}
    </div>
  )
}

// Custom tooltip for general charts
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-md px-3.5 py-2.5 shadow-none text-left">
      <p className="text-[12px] font-semibold text-[#5a626a] mb-1.5 tracking-[0.5px] font-mono">{label}</p>
      <div className="space-y-1">
        {payload.map((p: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color || p.fill }} />
              <span className="text-[#5a626a] font-light">{p.name}</span>
            </div>
            <span className="font-semibold text-[#111111]">{p.value} {p.unit || 'siswa'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Custom tooltip for single-value rates (percentages)
function RateTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const value = payload[0].value
  return (
    <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-md px-3 py-2 shadow-none text-left">
      <p className="text-[12px] font-semibold text-[#5a626a] mb-0.5 tracking-[0.5px] font-mono">{label}</p>
      <p className="text-[18px] font-bold text-[#111111] leading-none">
        {value}% <span className="text-[11px] font-light text-[#5a626a]">Kehadiran</span>
      </p>
    </div>
  )
}

const axisStyle = {
  stroke: '#e2e8f0',
  tick: { fill: '#5a626a', fontSize: 11, fontWeight: 400, fontFamily: 'Montserrat, sans-serif' },
}

/* =========================================================
   1. TREN 7 HARI TERAKHIR (Line/Area, 3 Series)
========================================================= */
export function Trend7DaysChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#c63535]/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-[#c63535]" />
          </div>
          <h3 className="text-sm font-semibold text-[#111111] tracking-tight">Tren 7 Hari Terakhir</h3>
        </div>
        <span className="text-[11px] font-mono text-[#5a626a]">Real-time</span>
      </div>
      
      <ChartContainer height={240}>
        {(w, h) => (
          <AreaChart width={w} height={h} data={data} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#008751" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#008751" stopOpacity={0.01}/>
              </linearGradient>
              <linearGradient id="colorSakit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b89750" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#b89750" stopOpacity={0.01}/>
              </linearGradient>
              <linearGradient id="colorAlfa" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c63535" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#c63535" stopOpacity={0.01}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="date" stroke={axisStyle.stroke} tick={axisStyle.tick} axisLine={false} tickLine={false} />
            <YAxis stroke={axisStyle.stroke} tick={axisStyle.tick} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="Hadir" stroke="#008751" strokeWidth={2} fillOpacity={1} fill="url(#colorHadir)" />
            <Area type="monotone" dataKey="Sakit" stroke="#b89750" strokeWidth={2} fillOpacity={1} fill="url(#colorSakit)" />
            <Area type="monotone" dataKey="Alfa" stroke="#c63535" strokeWidth={2} fillOpacity={1} fill="url(#colorAlfa)" />
          </AreaChart>
        )}
      </ChartContainer>
    </div>
  )
}

/* =========================================================
   2. DISTRIBUSI HARI INI (Donut, % in Center)
========================================================= */
export function DistributionDonutChart({ data }: { data: any[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const present = data.filter(item => item.name === 'Hadir' || item.name === 'Telat').reduce((sum, item) => sum + item.value, 0)
  const rate = total > 0 ? Math.round((present / total) * 100) : 0

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 min-w-0 overflow-hidden">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-md bg-[#c63535]/10 flex items-center justify-center">
          <PieIcon className="h-4 w-4 text-[#c63535]" />
        </div>
        <h3 className="text-sm font-semibold text-[#111111] tracking-tight">Distribusi Hari Ini</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 h-60">
        <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
          <PieChart width={160} height={160}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="90%"
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-bold text-[#5a626a] uppercase tracking-[1.5px] mb-0.5">HADIR</span>
            <span className="text-[32px] font-black text-[#111111] leading-none">{rate}%</span>
          </div>
        </div>

        {/* Dynamic Legend */}
        <div className="flex-1 w-full space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between border-b border-[#e2e8f0] pb-1.5 last:border-0 last:pb-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-light text-[#5a626a] truncate">{item.name}</span>
              </div>
              <span className="text-xs font-bold text-[#111111] shrink-0">{item.value} siswa</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   3. KEHADIRAN PER KELAS (Horizontal Bar, Dynamic Colors)
========================================================= */
export function ClassAttendanceChart({ data }: { data: any[] }) {
  // Sort classes to make layout look clean
  const sortedData = [...data].sort((a, b) => b.rate - a.rate).slice(0, 8)

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#c63535]/10 flex items-center justify-center">
            <BarChart2 className="h-4 w-4 text-[#c63535]" />
          </div>
          <h3 className="text-sm font-semibold text-[#111111] tracking-tight">Rasio Kehadiran per Kelas (%)</h3>
        </div>
        <span className="text-[10px] font-mono text-[#5a626a] uppercase tracking-wider">Top 8 Kelas</span>
      </div>

      <ChartContainer height={240}>
        {(w, h) => (
          <BarChart
            width={w}
            height={h}
            data={sortedData}
            layout="vertical"
            margin={{ top: 0, right: 10, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} stroke={axisStyle.stroke} tick={axisStyle.tick} axisLine={false} tickLine={false} />
            <YAxis dataKey="class_group" type="category" stroke={axisStyle.stroke} tick={axisStyle.tick} axisLine={false} tickLine={false} width={80} />
            <Tooltip content={<RateTooltip />} />
            <Bar dataKey="rate" radius={[0, 4, 4, 0]} maxBarSize={16}>
              {sortedData.map((entry, index) => {
                let color = '#c63535' // <70% is red
                if (entry.rate > 80) color = '#008751' // >80% is green
                else if (entry.rate >= 70) color = '#b89750' // 70-80% is yellow
                
                return <Cell key={`cell-${index}`} fill={color} />
              })}
            </Bar>
          </BarChart>
        )}
      </ChartContainer>
    </div>
  )
}

/* =========================================================
   4. TREN 30 HARI (Area, Highlight <80%, Avg Line)
========================================================= */
export function Trend30DaysChart({ data }: { data: any[] }) {
  const avgRate = data.length > 0
    ? Math.round(data.reduce((sum, item) => sum + item.rate, 0) / data.length)
    : 0

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#c63535]/10 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-[#c63535]" />
          </div>
          <h3 className="text-sm font-semibold text-[#111111] tracking-tight">Tren Kehadiran (30 Hari Terakhir)</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#5a626a]">
            <span className="w-2 h-2 rounded-full bg-[#c63535]" />
            <span>Kehadiran</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#c63535]">
            <span className="w-2 h-0.5 border-t border-dashed border-[#c63535]" />
            <span>Target 80%</span>
          </div>
        </div>
      </div>

      <ChartContainer height={240}>
        {(w, h) => (
          <AreaChart width={w} height={h} data={data} margin={{ top: 5, right: 10, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c63535" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#c63535" stopOpacity={0.01}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="date" stroke={axisStyle.stroke} tick={axisStyle.tick} axisLine={false} tickLine={false} />
            <YAxis domain={[40, 100]} stroke={axisStyle.stroke} tick={axisStyle.tick} axisLine={false} tickLine={false} />
            <Tooltip content={<RateTooltip />} />
            <ReferenceLine y={80} stroke="#c63535" strokeDasharray="4 4" strokeWidth={1.5} />
            <ReferenceLine y={avgRate} stroke="#5a626a" strokeDasharray="3 3" strokeWidth={1} label={{ value: `Rata-rata: ${avgRate}%`, fill: '#5a626a', fontSize: 10, position: 'insideTopLeft' }} />
            <Area type="monotone" dataKey="rate" stroke="#c63535" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRate)" />
          </AreaChart>
        )}
      </ChartContainer>
    </div>
  )
}

/* =========================================================
   5. REKAP 12 BULAN (Stacked Bar + Line Overlay %)
========================================================= */
export function MonthlyRecapChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#c63535]/10 flex items-center justify-center">
            <BarChart2 className="h-4 w-4 text-[#c63535]" />
          </div>
          <h3 className="text-sm font-semibold text-[#111111] tracking-tight">Rekap Kehadiran 12 Bulan terakhir</h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#008751] rounded-sm" />Hadir</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#b89750] rounded-sm" />Sakit</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#c63535] rounded-sm" />Alfa</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#c63535]" />Rate (%)</span>
        </div>
      </div>

      <ChartContainer height={260}>
        {(w, h) => (
          <ComposedChart width={w} height={h} data={data} margin={{ top: 5, right: -10, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="month" stroke={axisStyle.stroke} tick={axisStyle.tick} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" stroke={axisStyle.stroke} tick={axisStyle.tick} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke={axisStyle.stroke} tick={axisStyle.tick} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Bar yAxisId="left" dataKey="Hadir" stackId="a" fill="#008751" maxBarSize={32} />
            <Bar yAxisId="left" dataKey="Sakit" stackId="a" fill="#b89750" maxBarSize={32} />
            <Bar yAxisId="left" dataKey="Alfa" stackId="a" fill="#c63535" maxBarSize={32} />
            <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#c63535" strokeWidth={2.5} dot={{ fill: '#c63535', r: 3 }} unit="%" name="Persentase Kehadiran" />
          </ComposedChart>
        )}
      </ChartContainer>
    </div>
  )
}

/* =========================================================
   6. TOP 10 SISWA ALFA (Horizontal Bar, Clickable)
========================================================= */
export function TopAlfaStudentsChart({ data, onStudentClick }: { data: any[]; onStudentClick?: (student: any) => void }) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#c63535]/10 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-[#c63535]" />
          </div>
          <h3 className="text-sm font-semibold text-[#111111] tracking-tight">Top 10 Siswa dengan Akumulasi Alfa Terbanyak</h3>
        </div>
        <span className="text-[10px] text-[#5a626a] tracking-wide uppercase font-mono">Klik bar untuk detail</span>
      </div>

      <ChartContainer height={260}>
        {(w, h) => (
          <BarChart
            width={w}
            height={h}
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 10, left: -5, bottom: 5 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length > 0 && onStudentClick) {
                const payload = state.activePayload[0].payload
                onStudentClick(payload)
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis type="number" stroke={axisStyle.stroke} tick={axisStyle.tick} axisLine={false} tickLine={false} />
            <YAxis dataKey="name" type="category" stroke={axisStyle.stroke} tick={axisStyle.tick} axisLine={false} tickLine={false} width={100} />
            <Tooltip cursor={{ fill: '#e2e8f0' }} />
            <Bar dataKey="alfaCount" fill="#c63535" radius={[0, 4, 4, 0]} maxBarSize={16} name="Jumlah Alfa" className="cursor-pointer" />
          </BarChart>
        )}
      </ChartContainer>
    </div>
  )
}