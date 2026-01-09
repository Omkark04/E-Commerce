import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { formatCurrency } from '@/utils/formatters'

interface SalesChartProps {
  data: Array<{
    date: string
    revenue: number
  }>
}

export default function SalesChart({ data }: SalesChartProps) {
  // Format dates for display
  const chartData = data.map(item => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })
  }))

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff15" />
          <XAxis 
            dataKey="formattedDate" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(17, 24, 39, 0.8)', 
              borderColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              borderRadius: '12px',
              color: '#fff'
            }}
            itemStyle={{ color: '#c084fc' }}
            cursor={{ stroke: '#c084fc', strokeWidth: 1, strokeDasharray: '5 5' }}
            formatter={(value: number | undefined) => [formatCurrency(value || 0), 'Revenue']}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#c084fc"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
