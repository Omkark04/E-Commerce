import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useCreateAddress, useUpdateAddress, type Address } from '@/hooks/useAddresses'
import LocationPicker from './LocationPicker'
import LoadingSpinner from './LoadingSpinner'

interface AddressFormProps {
  address?: Address
  onClose: () => void
  onSuccess?: () => void
}

export default function AddressForm({ address, onClose, onSuccess }: AddressFormProps) {
  const createAddress = useCreateAddress()
  const updateAddress = useUpdateAddress()

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    address_type: 'home' as 'home' | 'work' | 'other',
    is_default: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    if (address) {
      setFormData({
        full_name: address.full_name,
        phone: address.phone,
        address_line1: address.address_line1,
        address_line2: address.address_line2 || '',
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        address_type: address.address_type,
        is_default: address.is_default,
      })
    }
  }, [address])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleLocationSelect = (addressData: {
    lat: number
    lng: number
    address_line1: string
    address_line2: string
    city: string
    state: string
    pincode: string
  }) => {
    setFormData(prev => ({
      ...prev,
      address_line1: addressData.address_line1,
      address_line2: addressData.address_line2,
      city: addressData.city,
      state: addressData.state,
      pincode: addressData.pincode,
    }))
    setShowMap(false)
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number'
    if (!formData.address_line1.trim()) newErrors.address_line1 = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required'
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Invalid pincode'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      if (address) {
        await updateAddress.mutateAsync({ id: address.id, updates: formData })
      } else {
        await createAddress.mutateAsync(formData)
      }
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error saving address:', error)
      alert('Failed to save address. Please try again.')
    }
  }

  const isLoading = createAddress.isPending || updateAddress.isPending

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {address ? 'Edit Address' : 'Add New Address'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.full_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.full_name && <p className="text-sm text-red-600 mt-1">{errors.full_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="10-digit mobile number"
                />
                {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Address Lines */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Address Line 1 *
                </label>
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="text-sm text-blue-600 hover:text-primary-700"
                >
                  {showMap ? 'Hide Map' : 'Select on Map'}
                </button>
              </div>
              <input
                type="text"
                value={formData.address_line1}
                onChange={(e) => handleChange('address_line1', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.address_line1 ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="House No., Building Name"
              />
              {errors.address_line1 && <p className="text-sm text-red-600 mt-1">{errors.address_line1}</p>}
            </div>

            {showMap && (
              <LocationPicker onLocationSelect={handleLocationSelect} />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                value={formData.address_line2}
                onChange={(e) => handleChange('address_line2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Road name, Area, Colony"
              />
            </div>

            {/* City, State, Pincode */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.state && <p className="text-sm text-red-600 mt-1">{errors.state}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.pincode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="6-digit pincode"
                  maxLength={6}
                />
                {errors.pincode && <p className="text-sm text-red-600 mt-1">{errors.pincode}</p>}
              </div>
            </div>

            {/* Address Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Type
              </label>
              <div className="flex gap-4">
                {['home', 'work', 'other'].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value={type}
                      checked={formData.address_type === type}
                      onChange={(e) => handleChange('address_type', e.target.value)}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-sm text-gray-700 capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Default Address */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => handleChange('is_default', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm text-gray-700">Set as default address</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-green-700 rounded-lg hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300"
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner /> : address ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
