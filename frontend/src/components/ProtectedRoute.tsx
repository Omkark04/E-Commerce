import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { setRedirectPath } from '@/utils/auth'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: string
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile } = useAuthStore()
  const location = useLocation()

  // Check if user is authenticated
  if (!user) {
    // Save intended destination
    setRedirectPath(location.pathname)
    return <Navigate to="/auth" replace />
  }

  // Check role if required
  if (requiredRole && profile?.role !== requiredRole) {
    // Check role hierarchy
    const roleHierarchy: Record<string, number> = {
      'admin': 5,
      'shop_owner': 4,
      'co_shop_owner': 3,
      'delivery_partner': 2,
      'customer': 1,
    }

    const userLevel = roleHierarchy[profile?.role || ''] || 0
    const requiredLevel = roleHierarchy[requiredRole] || 0

    if (userLevel < requiredLevel) {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}
