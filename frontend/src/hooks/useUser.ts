import { useQuery } from '@tanstack/react-query'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export function useCurrentUser() {
  const { user, setUser, setProfile } = useAuthStore()

  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const [userResponse, profileResponse] = await Promise.all([
          authAPI.getCurrentUser(),
          authAPI.getProfile(),
        ])
        
        const currentUser = userResponse.data
        const profile = profileResponse.data

        setUser(currentUser)
        setProfile(profile)

        return { user: currentUser, profile }
      } catch (error) {
        setUser(null)
        setProfile(null)
        return null
      }
    },
    initialData: user ? { user, profile: useAuthStore.getState().profile! } : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

