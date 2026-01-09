import { getStatusColor, getStatusText } from '@/utils/formatters'

interface OrderStatusBadgeProps {
  status: string
  size?: 'sm' | 'md' | 'lg'
}

export default function OrderStatusBadge({ status, size = 'md' }: OrderStatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${getStatusColor(status)} ${sizeClasses[size]}`}>
      {getStatusText(status)}
    </span>
  )
}
