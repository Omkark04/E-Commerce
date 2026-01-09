// Authentication utility functions

const REDIRECT_PATH_KEY = 'auth_redirect_path'

export function getRedirectPath(): string {
  return sessionStorage.getItem(REDIRECT_PATH_KEY) || '/'
}

export function setRedirectPath(path: string): void {
  sessionStorage.setItem(REDIRECT_PATH_KEY, path)
}

export function clearRedirectPath(): void {
  sessionStorage.removeItem(REDIRECT_PATH_KEY)
}

export function hasRole(userRole: string | null, requiredRole: string): boolean {
  if (!userRole) return false
  
  const roleHierarchy = {
    'admin': 5,
    'shop_owner': 4,
    'co_shop_owner': 3,
    'delivery_partner': 2,
    'customer': 1,
  }
  
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0
  
  return userLevel >= requiredLevel
}

export function isAdmin(userRole: string | null): boolean {
  return userRole === 'admin' || userRole === 'shop_owner'
}
