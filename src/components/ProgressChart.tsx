'use client'

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
  Legend,
} from 'recharts'

interface DistanceChartProps {
  data: Array<{
    date: string
    distance: number
    type?: string
  }>
}

interface PainChartProps {
  data: Array<{
    date: string
    painBefore: number
    painAfter: number
  }>
}

interface WeeklyBarChartProps {
  data: Array<{
    week: string
    distance: number
    sessions: number
  }>
}

const CustomTooltipStyle = {
  contentStyle: {
    backgroundColor: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    color: '#f1f5f9',
    fontSize: '12px',
    padding: '8px 12px',
  },
  labelStyle: { color: '#94a3b8', marginBottom: '4px' },
  itemStyle: { color: '#e2e8f0' },
}

export function DistanceChart({ data }: DistanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#64748b', fontSize: 10 }}
          axisLine={{ stroke: '#1e293b' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 10 }}
          axisLine={{ stroke: '#1e293b' }}
          tickLine={false}
          unit="m"
        />
        <Tooltip
          {...CustomTooltipStyle}
          formatter={(value) => [`${value}m`, 'Distancia']}
        />
        <Line
          type="monotone"
          dataKey="distance"
          stroke="#0ea5e9"
          strokeWidth={2}
          dot={{ fill: '#0ea5e9', r: 3 }}
          activeDot={{ r: 5, fill: '#38bdf8' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function PainChart({ data }: PainChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#64748b', fontSize: 10 }}
          axisLine={{ stroke: '#1e293b' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 10 }}
          axisLine={{ stroke: '#1e293b' }}
          tickLine={false}
          domain={[0, 10]}
        />
        <Tooltip
          {...CustomTooltipStyle}
          formatter={(value, name) => [
            `${value}/10`,
            name === 'painBefore' ? 'Antes' : 'Después',
          ]}
        />
        <Legend
          wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
          formatter={(value) => value === 'painBefore' ? 'Antes' : 'Después'}
        />
        <Line
          type="monotone"
          dataKey="painBefore"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={{ fill: '#f59e0b', r: 3 }}
          strokeDasharray="4 2"
        />
        <Line
          type="monotone"
          dataKey="painAfter"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ fill: '#ef4444', r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function WeeklyBarChart({ data }: WeeklyBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="week"
          tick={{ fill: '#64748b', fontSize: 10 }}
          axisLine={{ stroke: '#1e293b' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 10 }}
          axisLine={{ stroke: '#1e293b' }}
          tickLine={false}
          unit="m"
        />
        <Tooltip
          {...CustomTooltipStyle}
          formatter={(value, name) => [
            name === 'distance' ? `${value}m` : `${value} sesiones`,
            name === 'distance' ? 'Distancia' : 'Sesiones',
          ]}
        />
        <Bar
          dataKey="distance"
          fill="#0ea5e9"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
