import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, Heart, Minus, Plus, ArrowLeft } from 'lucide-react'
import { useProduct } from '@/hooks/useProducts'
import { useAddToCart } from '@/hooks/useCart'
import { useAuthStore } from '@/store/authStore'
import { formatPrice } from '@/utils/currency'
import { getTranslatedProductName, getTranslatedProductDescription } from '@/utils/translations'
import ImageGallery from '@/components/ImageGallery'
import VariantSelector from '@/components/VariantSelector'
import LoadingSpinner from '@/components/LoadingSpinner'
import ReviewSummary from '@/components/reviews/ReviewSummary'
import ReviewsList from '@/components/reviews/ReviewsList'
import ReviewForm from '@/components/reviews/ReviewForm'
import type { ProductVariant } from '@/types'

export default function ProductDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { data: product, isLoading } = useProduct(id!)
  const addToCart = useAddToCart()

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [showReviewForm, setShowReviewForm] = useState(false)

  // Set initial variant when product loads
  if (product && !selectedVariant && product.variants && product.variants.length > 0) {
    setSelectedVariant(product.variants[0])
  }

  const handleAddToCart = () => {
    if (selectedVariant) {
      addToCart.mutate({
        productId: product!.id,
        variantId: selectedVariant.id,
        quantity,
      })
    }
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= (selectedVariant?.stock_quantity || 0)) {
      setQuantity(newQuantity)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link to="/products" className="text-primary-600 hover:underline">
            ← Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const productName = getTranslatedProductName(product)
  const productDescription = getTranslatedProductDescription(product)
  const pricing = formatPrice(product.base_price, product.discount_percentage)
  
  // Get product images
  const imageUrls = product.images?.map(img => img.image_url) || []

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('common.back')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div>
          <ImageGallery images={imageUrls} productName={productName} />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title and Price */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{productName}</h1>
            <div className="flex items-center gap-3">
              {product.discount_percentage > 0 ? (
                <>
                  <span className="text-3xl font-bold text-gray-900">{pricing.final}</span>
                  <span className="text-xl text-gray-500 line-through">{pricing.original}</span>
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded">
                    {product.discount_percentage}% OFF
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900">{pricing.final}</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-600 leading-relaxed">{productDescription}</p>
          </div>

          {/* Variant Selection */}
          {product.variants && product.variants.length > 0 && (
            <VariantSelector
              variants={product.variants}
              selectedVariant={selectedVariant}
              onVariantChange={setSelectedVariant}
            />
          )}

          {/* Quantity Selector */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quantity</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 py-2 font-semibold text-gray-900">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (selectedVariant?.stock_quantity || 0)}
                  className="p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stock_quantity === 0 || addToCart.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              <ShoppingCart className="w-5 h-5" />
              {addToCart.isPending ? 'Adding...' : t('product.addToCart')}
            </button>
            <button className="p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
              <Heart className="w-6 h-6" />
            </button>
          </div>

          {/* Order Now Button */}
          <button
            onClick={() => {
              if (selectedVariant) {
                addToCart.mutate({
                  productId: product!.id,
                  variantId: selectedVariant.id,
                  quantity,
                }, {
                  onSuccess: () => {
                    window.location.href = '/checkout'
                  }
                })
              }
            }}
            disabled={!selectedVariant || selectedVariant.stock_quantity === 0 || addToCart.isPending}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {addToCart.isPending ? 'Processing...' : 'Order Now'}
          </button>

          {/* Success Message */}
          {addToCart.isSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">✓ Added to cart successfully!</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          
          {/* Review Summary */}
          <div className="mb-8">
            <ReviewSummary productId={product.id} />
          </div>

          {/* Write Review Button */}
          {user && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="mb-6 px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors"
            >
              Write a Review
            </button>
          )}

          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-8">
              <ReviewForm
                productId={product.id}
                onSuccess={() => setShowReviewForm(false)}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          )}

          {/* Reviews List */}
          <ReviewsList productId={product.id} />
        </div>
      </div>
    </div>
  )
}
