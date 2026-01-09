import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useLogin } from '@/hooks/useAuth'
import { validateEmail, validateRequired } from '@/utils/validation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  
  const login = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate
    const emailValidation = validateEmail(email)
    const passwordValidation = validateRequired(password, 'Password')
    
    if (!emailValidation.valid || !passwordValidation.valid) {
      setErrors({
        email: emailValidation.error,
        password: passwordValidation.error,
      })
      return
    }
    
    setErrors({})
    login.mutate({ email, password })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="you@example.com"
          />
        </div>
        {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
      </div>

      {/* Error Message */}
      {login.isError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            {login.error instanceof Error ? login.error.message : 'Login failed. Please check your credentials.'}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={login.isPending}
        className="w-full py-3 bg-pink-600 text-black rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
      >
        {login.isPending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
