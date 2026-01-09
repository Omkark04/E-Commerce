import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import type { Product } from '@/types'
import { formatPrice } from '@/utils/currency'
import { getTranslatedProductName } from '@/utils/translations'
import { useAddToCart } from '@/hooks/useCart'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useAddToCart()
  const productName = getTranslatedProductName(product)
  const pricing = formatPrice(product.base_price, product.discount_percentage)

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    // Get first available variant
    const firstVariant = product.variants?.[0]
    if (firstVariant) {
      addToCart.mutate({
        productId: product.id,
        variantId: firstVariant.id,
        quantity: 1,
      })
    }
  }

  // Get first product image or use gray placeholder
  const imageUrl = product.images?.[0]?.image_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="400"%3E%3Crect width="300" height="400" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E'

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Discount Badge */}
          {product.discount_percentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
              {product.discount_percentage}% OFF
            </div>
          )}

          {/* Featured Badge */}
          {product.is_featured && (
            <div className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded text-xs font-semibold">
              Featured
            </div>
          )}

          {/* Quick Actions */}
          <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleQuickAdd}
              disabled={addToCart.isPending}
              className="p-2 bg-white rounded-full shadow-md hover:bg-primary-600 hover:text-white transition"
              title="Quick Add to Cart"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => e.preventDefault()}
              className="p-2 bg-white rounded-full shadow-md hover:bg-red-500 hover:text-white transition"
              title="Add to Wishlist"
            >
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition">
            {productName}
          </h3>
          
          <div className="flex items-center gap-2">
            {product.discount_percentage > 0 ? (
              <>
                <span className="text-lg font-bold text-gray-900">{pricing.final}</span>
                <span className="text-sm text-gray-500 line-through">{pricing.original}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">{pricing.final}</span>
            )}
          </div>

          {/* Stock Status */}
          {product.variants && product.variants.length > 0 && (
            <div className="mt-2">
              {product.variants.some(v => v.stock_quantity > 0) ? (
                <span className="text-xs text-green-600">In Stock</span>
              ) : (
                <span className="text-xs text-red-600">Out of Stock</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
