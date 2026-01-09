import { useSearchParams, Link } from 'react-router-dom'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'

export default function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'login'

  const setTab = (newTab: string) => {
    setSearchParams({ tab: newTab })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-primary-600">
            ShopName
          </Link>
          <p className="text-gray-600 mt-2">
            {tab === 'login' ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Tab Switcher */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                tab === 'login'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setTab('signup')}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                tab === 'signup'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Forms */}
          {tab === 'login' ? <LoginForm /> : <SignupForm />}

          {/* Forgot Password Link (only on login) */}
          {tab === 'login' && (
            <div className="mt-4 text-center">
              <Link
                to="/auth/forgot-password"
                className="text-sm text-primary-600 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
