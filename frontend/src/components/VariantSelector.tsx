import { useState } from 'react'
import type { ProductVariant } from '@/types'

interface VariantSelectorProps {
  variants: ProductVariant[]
  selectedVariant: ProductVariant | null
  onVariantChange: (variant: ProductVariant) => void
}

export default function VariantSelector({
  variants,
  selectedVariant,
  onVariantChange,
}: VariantSelectorProps) {
  // Get unique sizes and colors
  const sizes = Array.from(new Set(variants.map((v) => v.size)))
  
  // Create unique colors array with proper deduplication
  const uniqueColorsMap = new Map<string, { name: string; code: string }>()
  variants.forEach((v) => {
    if (!uniqueColorsMap.has(v.color)) {
      uniqueColorsMap.set(v.color, { name: v.color, code: v.color_code })
    }
  })
  const colors = Array.from(uniqueColorsMap.values())

  const [selectedSize, setSelectedSize] = useState(selectedVariant?.size || sizes[0])
  const [selectedColor, setSelectedColor] = useState(selectedVariant?.color || colors[0]?.name)

  const handleSizeChange = (size: string) => {
    setSelectedSize(size)
    const variant = variants.find((v) => v.size === size && v.color === selectedColor)
    if (variant) onVariantChange(variant)
  }

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    const variant = variants.find((v) => v.size === selectedSize && v.color === color)
    if (variant) onVariantChange(variant)
  }

  const getVariantStock = (size: string, color: string) => {
    const variant = variants.find((v) => v.size === size && v.color === color)
    return variant?.stock_quantity || 0
  }

  return (
    <div className="space-y-6">
      {/* Size Selection */}
      {sizes.length > 1 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Size</h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const stock = getVariantStock(size, selectedColor)
              const isSelected = selectedSize === size
              const isOutOfStock = stock === 0

              return (
                <button
                  key={size}
                  onClick={() => !isOutOfStock && handleSizeChange(size)}
                  disabled={isOutOfStock}
                  className={`px-4 py-2 border rounded-lg font-medium transition ${
                    isSelected
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : isOutOfStock
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 hover:border-primary-400'
                  }`}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {colors.length > 1 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Color</h3>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => {
              const stock = getVariantStock(selectedSize, color.name)
              const isSelected = selectedColor === color.name
              const isOutOfStock = stock === 0

              return (
                <button
                  key={color.name}
                  onClick={() => !isOutOfStock && handleColorChange(color.name)}
                  disabled={isOutOfStock}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition ${
                    isSelected
                      ? 'border-primary-600 bg-primary-50'
                      : isOutOfStock
                      ? 'border-gray-200 opacity-50 cursor-not-allowed'
                      : 'border-gray-300 hover:border-primary-400'
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: color.code }}
                  />
                  <span className="text-sm font-medium">{color.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Stock Status */}
      {selectedVariant && (
        <div className="text-sm">
          {selectedVariant.stock_quantity > 0 ? (
            <span className="text-green-600 font-medium">
              ✓ In Stock ({selectedVariant.stock_quantity} available)
            </span>
          ) : (
            <span className="text-red-600 font-medium">✗ Out of Stock</span>
          )}
        </div>
      )}
    </div>
  )
}
