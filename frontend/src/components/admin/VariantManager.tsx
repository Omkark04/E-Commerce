import { useState } from 'react'
import { X, Plus } from 'lucide-react'

interface Variant {
  id?: string
  size: string
  color: string
  color_code: string
  sku: string
  stock_quantity: number
  additional_price: number
}

interface VariantManagerProps {
  variants: Variant[]
  onChange: (variants: Variant[]) => void
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']
const COLORS = [
  { name: 'Black', code: '#000000' },
  { name: 'White', code: '#FFFFFF' },
  { name: 'Red', code: '#EF4444' },
  { name: 'Blue', code: '#3B82F6' },
  { name: 'Green', code: '#10B981' },
  { name: 'Yellow', code: '#F59E0B' },
  { name: 'Purple', code: '#8B5CF6' },
  { name: 'Pink', code: '#EC4899' },
  { name: 'Gray', code: '#6B7280' },
  { name: 'Brown', code: '#92400E' },
]

export default function VariantManager({ variants, onChange }: VariantManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newVariant, setNewVariant] = useState<Variant>({
    size: 'M',
    color: 'Black',
    color_code: '#000000',
    sku: '',
    stock_quantity: 0,
    additional_price: 0,
  })

  const handleAddVariant = () => {
    if (!newVariant.sku) {
      alert('SKU is required')
      return
    }

    onChange([...variants, { ...newVariant }])
    setNewVariant({
      size: 'M',
      color: 'Black',
      color_code: '#000000',
      sku: '',
      stock_quantity: 0,
      additional_price: 0,
    })
    setShowAddForm(false)
  }

  const handleRemoveVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index))
  }

  const handleColorChange = (color: string, code: string) => {
    setNewVariant({ ...newVariant, color, color_code: code })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Product Variants</h3>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Add Variant
        </button>
      </div>

      {/* Add Variant Form */}
      {showAddForm && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size *</label>
              <select
                value={newVariant.size}
                onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {SIZES.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color *</label>
              <select
                value={newVariant.color}
                onChange={(e) => {
                  const selected = COLORS.find(c => c.name === e.target.value)
                  if (selected) handleColorChange(selected.name, selected.code)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {COLORS.map((color) => (
                  <option key={color.name} value={color.name}>{color.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
              <input
                type="text"
                value={newVariant.sku}
                onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., TSH-BLK-M"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
              <input
                type="number"
                value={newVariant.stock_quantity}
                onChange={(e) => setNewVariant({ ...newVariant, stock_quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Price (₹)</label>
              <input
                type="number"
                value={newVariant.additional_price}
                onChange={(e) => setNewVariant({ ...newVariant, additional_price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={handleAddVariant}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add Variant
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Variants List */}
      {variants.length > 0 ? (
        <div className="space-y-2">
          {variants.map((variant, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Size:</span>
                  <span className="ml-2 font-medium">{variant.size}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Color:</span>
                  <div
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: variant.color_code }}
                  />
                  <span className="font-medium">{variant.color}</span>
                </div>
                <div>
                  <span className="text-gray-500">SKU:</span>
                  <span className="ml-2 font-medium">{variant.sku}</span>
                </div>
                <div>
                  <span className="text-gray-500">Stock:</span>
                  <span className="ml-2 font-medium">{variant.stock_quantity}</span>
                </div>
                <div>
                  <span className="text-gray-500">+Price:</span>
                  <span className="ml-2 font-medium">₹{variant.additional_price}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveVariant(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          No variants added yet. Click "Add Variant" to create product variants.
        </div>
      )}
    </div>
  )
}
