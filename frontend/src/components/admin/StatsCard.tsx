import { ArrowUpRight, ArrowDownRight, type LucideIcon } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  type?: 'currency' | 'number'
  variant?: 'primary' | 'success' | 'warning' | 'danger'
  className?: string
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeLabel = 'from last month',
  icon: Icon, 
  type = 'number',
  variant = 'primary',
  className = ''
}: StatsCardProps) {
  
  const formattedValue = type === 'currency' 
    ? formatCurrency(Number(value))
    : value.toLocaleString()

  const isPositive = change && change > 0

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'from-green-500/20 to-emerald-500/20 text-emerald-400'
      case 'warning':
        return 'from-yellow-500/20 to-orange-500/20 text-yellow-400'
      case 'danger':
        return 'from-red-500/20 to-rose-500/20 text-red-400'
      default:
        return 'from-purple-500/20 to-pink-500/20 text-purple-400'
    }
  }

  return (
    <div className={`rounded-2xl p-6 border ${className || 'bg-white/5 border-white/10 backdrop-blur-md'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${getVariantStyles()}`}>
          <Icon className="w-6 h-6" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white">{formattedValue}</p>
        
        {change !== undefined && (
          <p className="text-xs text-gray-500 mt-2">
            <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
              {change > 0 ? '+' : ''}{change}%
            </span> {changeLabel}
          </p>
        )}
      </div>
    </div>
  )
}
