import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authAPI } from '@/lib/api'

interface ProfileData {
  full_name: string
  phone?: string
  email?: string
  gender?: string
  date_of_birth?: string
  location?: string
  alternate_phone?: string
  hint_name?: string
}

export default function ProfileDetailsPage() {
  const { user, setProfile } = useAuthStore()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<ProfileData>({
    full_name: '',
    phone: '',
    email: '',
    gender: '',
    date_of_birth: '',
    location: '',
    alternate_phone: '',
    hint_name: ''
  })

  // Fetch profile data - using existing cache or store if available, or fetch fresh
  useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await authAPI.getProfile()
      
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        email: user?.email || '',
        gender: data.gender || '',
        date_of_birth: data.date_of_birth || '',
        location: data.location || '',
        alternate_phone: data.alternate_phone || '',
        hint_name: data.hint_name || ''
      })

      return data
    },
    enabled: !!user?.id
  })

  // Update profile
  const updateProfile = useMutation({
    mutationFn: async (data: Partial<ProfileData>) => {
      const { data: updatedProfile } = await authAPI.updateProfile(data)
      return updatedProfile
    },
    onSuccess: (updatedProfile) => {
      setProfile(updatedProfile) // Update store
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      setIsEditing(false)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate(formData)
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Details</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div className="flex items-center py-4 border-b border-gray-200">
          <label className="w-48 text-sm font-semibold text-gray-700">Full Name</label>
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            ) : (
              <span className="text-gray-900">{formData.full_name || '- not added -'}</span>
            )}
          </div>
        </div>

        {/* Mobile Number */}
        <div className="flex items-center py-4 border-b border-gray-200">
          <label className="w-48 text-sm font-semibold text-gray-700">Mobile Number</label>
          <div className="flex-1">
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            ) : (
              <span className="text-gray-900">{formData.phone || '- not added -'}</span>
            )}
          </div>
        </div>

        {/* Email ID */}
        <div className="flex items-center py-4 border-b border-gray-200">
          <label className="w-48 text-sm font-semibold text-gray-700">Email ID</label>
          <div className="flex-1">
            <span className="text-gray-900">{formData.email || '- not added -'}</span>
          </div>
        </div>

        {/* Gender */}
        <div className="flex items-center py-4 border-b border-gray-200">
          <label className="w-48 text-sm font-semibold text-gray-700">Gender</label>
          <div className="flex-1">
            {isEditing ? (
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <span className="text-gray-900 capitalize">{formData.gender || '- not added -'}</span>
            )}
          </div>
        </div>

        {/* Date of Birth */}
        <div className="flex items-center py-4 border-b border-gray-200">
          <label className="w-48 text-sm font-semibold text-gray-700">Date of Birth</label>
          <div className="flex-1">
            {isEditing ? (
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            ) : (
              <span className="text-gray-900">{formData.date_of_birth || '- not added -'}</span>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center py-4 border-b border-gray-200">
          <label className="w-48 text-sm font-semibold text-gray-700">Location</label>
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            ) : (
              <span className="text-gray-900">{formData.location || '- not added -'}</span>
            )}
          </div>
        </div>

        {/* Alternate Mobile */}
        <div className="flex items-center py-4 border-b border-gray-200">
          <label className="w-48 text-sm font-semibold text-gray-700">Alternate Mobile</label>
          <div className="flex-1">
            {isEditing ? (
              <input
                type="tel"
                value={formData.alternate_phone}
                onChange={(e) => setFormData({ ...formData, alternate_phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            ) : (
              <span className="text-gray-900">{formData.alternate_phone || '- not added -'}</span>
            )}
          </div>
        </div>

        {/* Hint Name */}
        <div className="flex items-center py-4 border-b border-gray-200">
          <label className="w-48 text-sm font-semibold text-gray-700">Hint Name</label>
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={formData.hint_name}
                onChange={(e) => setFormData({ ...formData, hint_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            ) : (
              <span className="text-gray-900">{formData.hint_name || '- not added -'}</span>
            )}
          </div>
        </div>

        {/* Edit Button */}
        <div className="pt-4">
          {isEditing ? (
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="px-8 py-3 bg-pink-600 text-white font-semibold rounded hover:bg-pink-700 disabled:opacity-50 transition-colors"
              >
                {updateProfile.isPending ? 'Saving...' : 'SAVE'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-50 transition-colors"
              >
                CANCEL
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-full max-w-md py-3 bg-pink-600 text-white font-semibold rounded hover:bg-pink-700 transition-colors"
            >
              EDIT
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

