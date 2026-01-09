// Form validation utilities

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: 'Email is required' }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' }
  }
  
  return { valid: true }
}

export function validatePassword(password: string): { 
  valid: boolean
  error?: string
  strength?: 'weak' | 'medium' | 'strong'
} {
  if (!password) {
    return { valid: false, error: 'Password is required' }
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }
  
  // Check password strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  let score = 0
  
  if (password.length >= 12) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  
  if (score >= 4) strength = 'strong'
  else if (score >= 3) strength = 'medium'
  
  return { valid: true, strength }
}

export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone) {
    return { valid: true } // Phone is optional
  }
  
  // Indian phone number format: 10 digits
  const phoneRegex = /^[6-9]\d{9}$/
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return { valid: false, error: 'Invalid phone number (10 digits required)' }
  }
  
  return { valid: true }
}

export function validateRequired(value: string, fieldName: string): { valid: boolean; error?: string } {
  if (!value || value.trim() === '') {
    return { valid: false, error: `${fieldName} is required` }
  }
  return { valid: true }
}

export function validatePasswordMatch(password: string, confirmPassword: string): { valid: boolean; error?: string } {
  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' }
  }
  return { valid: true }
}
