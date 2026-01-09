interface LoadingSpinnerProps {
  className?: string
}

export default function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center p-8 ${className || ''}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  )
}
