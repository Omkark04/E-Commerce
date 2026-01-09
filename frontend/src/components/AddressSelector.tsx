import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAddresses, useDeleteAddress, type Address } from '@/hooks/useAddresses'
import AddressCard from './AddressCard'
import AddressForm from './AddressForm'
import LoadingSpinner from './LoadingSpinner'

interface AddressSelectorProps {
  selectedAddressId?: string
  onSelectAddress: (address: Address) => void
}

export default function AddressSelector({ selectedAddressId, onSelectAddress }: AddressSelectorProps) {
  const { data: addresses, isLoading } = useAddresses()
  const deleteAddress = useDeleteAddress()
  
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | undefined>()

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setShowForm(true)
  }

  const handleDelete = (address: Address) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      deleteAddress.mutate(address.id)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingAddress(undefined)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Delivery Address</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Add New Address
        </button>
      </div>

      {addresses && addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              selected={selectedAddressId === address.id}
              onSelect={() => onSelectAddress(address)}
              onEdit={() => handleEdit(address)}
              onDelete={() => handleDelete(address)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">No addresses saved yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-primary-700"
          >
            Add Your First Address
          </button>
        </div>
      )}

      {showForm && (
        <AddressForm
          address={editingAddress}
          onClose={handleCloseForm}
          onSuccess={() => {
            // If this was the first address, auto-select it
            if (addresses && addresses.length === 0) {
              // Will be handled by the query refetch
            }
          }}
        />
      )}
    </div>
  )
}
