import { Link } from 'react-router-dom'
import { useFeaturedProducts } from '@/hooks/useProducts'
import { getTranslatedProductName } from '@/utils/translations'
import { formatCurrency } from '@/utils/formatters'
import { Heart, ShoppingCart, Star } from 'lucide-react'

export default function FeaturedProducts() {
  const { data: products, isLoading } = useFeaturedProducts()

  if (isLoading) {
    return (
      <section className="my-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
          Handpicked for You
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-96 animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="my-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Handpicked for You
        </h2>
        <p className="text-gray-600 text-lg">Trending styles curated just for you</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {(Array.isArray(products) ? products : [])?.slice(0, 8).map((product) => {
          const imageUrl = product.images?.[0]?.image_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="533"%3E%3Crect width="400" height="533" fill="%23F3F4F6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239CA3AF" font-family="sans-serif" font-size="24"%3ENo Image%3C/text%3E%3C/svg%3E'
          const hasDiscount = product.discount_percentage > 0
          const discountedPrice = hasDiscount
            ? product.base_price * (1 - product.discount_percentage / 100)
            : product.base_price

          return (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                <img
                  src={imageUrl}
                  alt={getTranslatedProductName(product)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.is_featured && (
                    <span className="px-2 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded">
                      Featured
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                      {product.discount_percentage}% OFF
                    </span>
                  )}
                </div>

                {/* Wishlist Button */}
                <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                  <Heart className="w-4 h-4 text-gray-700" />
                </button>

                {/* Quick Add to Cart */}
                <button className="absolute bottom-3 left-3 right-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white flex items-center justify-center gap-2 text-sm font-medium text-black">
                  <ShoppingCart className="w-4 h-4" />
                  Quick Add
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                {/* Product Name */}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                  {getTranslatedProductName(product)}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-600 ml-1">(4.0)</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(discountedPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatCurrency(product.base_price)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* View All Button */}
      <div className="text-center mt-10">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl text-black"
        >
          View All Products
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
