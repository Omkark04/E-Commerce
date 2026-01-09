import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { getRedirectPath, clearRedirectPath } from '@/utils/auth'
import { authAPI } from '@/lib/api'

interface LoginCredentials {
  email: string
  password: string
}

interface SignupData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  phone?: string
}

export function useLogin() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  return useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      await login(email, password)
    },
    onSuccess: () => {
      // Redirect to intended page
      const redirectPath = getRedirectPath()
      clearRedirectPath()
      navigate(redirectPath)
    },
  })
}

export function useSignup() {
  const navigate = useNavigate()
  const { register } = useAuthStore()

  return useMutation({
    mutationFn: async ({ email, password, confirmPassword, fullName }: SignupData) => {
      await register(email, password, confirmPassword, fullName)
    },
    onSuccess: () => {
      navigate('/')
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await logout()
    },
    onSuccess: () => {
      queryClient.clear()
      navigate('/auth')
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      // TODO: Implement password reset in backend/API
      // await authAPI.forgotPassword(email)
      console.log('Forgot password implementation pending for:', email)
    },
  })
}

export function useResetPassword() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      // TODO: Implement password reset confirmation
      // await authAPI.resetPassword(newPassword)
      console.log('Reset password implementation pending')
    },
    onSuccess: () => {
      navigate('/auth?tab=login')
    },
  })
}

export function useUpdateProfile() {
  const { setProfile } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: { full_name?: string; phone?: string }) => {
      const response = await authAPI.updateProfile(updates)
      return response.data
    },
    onSuccess: (data) => {
      setProfile(data)
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

