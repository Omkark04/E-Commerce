import { MapPin, Edit, Trash2, Star } from 'lucide-react'
import type { Address } from '@/hooks/useAddresses'

interface AddressCardProps {
  address: Address
  onEdit?: () => void
  onDelete?: () => void
  onSelect?: () => void
  selected?: boolean
  showActions?: boolean
}

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSelect,
  selected,
  showActions = true,
}: AddressCardProps) {
  const getAddressTypeColor = (type: string) => {
    switch (type) {
      case 'home':
        return 'bg-blue-100 text-blue-800'
      case 'work':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div
      className={`p-4 border-2 rounded-lg transition cursor-pointer ${
        selected
          ? 'border-primary-600 bg-primary-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${getAddressTypeColor(address.address_type)}`}>
              {address.address_type}
            </span>
            {address.is_default && (
              <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                <Star className="w-3 h-3 fill-current" />
                Default
              </span>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 mb-1">{address.full_name}</h3>
          <p className="text-sm text-gray-600 mb-1">{address.phone}</p>
          
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              {address.address_line1}
              {address.address_line2 && `, ${address.address_line2}`}
              <br />
              {address.city}, {address.state} - {address.pincode}
            </p>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2 ml-4">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
