import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile } from '@/types'
import { authAPI, clearTokens, setTokens, getAccessToken } from '@/lib/api'

// User type for Django JWT auth
interface User {
  id: number
  email: string
  full_name: string
  role?: string
}

interface AuthState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, password2: string, fullName: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  fetchProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      
      login: async (email: string, password: string) => {
        try {
          const response = await authAPI.login(email, password)
          const { access, refresh } = response.data
          setTokens(access, refresh)
          
          // Fetch user profile
          await get().fetchProfile()
        } catch (error) {
          throw error
        }
      },
      
      register: async (email: string, password: string, password2: string, fullName: string) => {
        try {
          const response = await authAPI.register({
            email,
            password,
            password2,
            full_name: fullName,
          })
          const { access, refresh } = response.data
          setTokens(access, refresh)
          
          // Fetch user profile
          await get().fetchProfile()
        } catch (error) {
          throw error
        }
      },
      
      logout: async () => {
        try {
          await authAPI.logout()
        } catch {
          // Ignore errors on logout
        }
        clearTokens()
        set({ user: null, profile: null, isAuthenticated: false })
      },
      
      checkAuth: async () => {
        const token = getAccessToken()
        if (!token) {
          set({ isLoading: false, isAuthenticated: false })
          return
        }
        
        try {
          await get().fetchProfile()
          set({ isLoading: false })
        } catch {
          clearTokens()
          set({ user: null, profile: null, isLoading: false, isAuthenticated: false })
        }
      },
      
      fetchProfile: async () => {
        try {
          const [userResponse, profileResponse] = await Promise.all([
            authAPI.getCurrentUser(),
            authAPI.getProfile(),
          ])
          
          set({
            user: userResponse.data,
            profile: profileResponse.data,
            isAuthenticated: true,
          })
        } catch (error) {
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
