import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useRemoveFromCart, useUpdateCartQuantity } from '@/hooks/useCart'
import { useCartItems } from '@/hooks/useCartItems'
import { formatCurrency } from '@/utils/currency'
import { getTranslatedProductName } from '@/utils/translations'

export default function CartPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { getTotalItems } = useCartStore()
  const { data: items = [], isLoading } = useCartItems()
  const removeFromCart = useRemoveFromCart()
  const updateQuantity = useUpdateCartQuantity()

  const handleQuantityChange = (itemId: string, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta
    if (newQuantity >= 1) {
      updateQuantity.mutate({ itemId, quantity: newQuantity })
    }
  }

  const handleRemove = (itemId: string) => {
    removeFromCart.mutate(itemId)
  }

  // Calculate totals from fetched items
  const itemsArray = Array.isArray(items) ? items : ((items as any)?.results || [])
  const subtotal = itemsArray.reduce((total: number, item: any) => {
    if (!item.product || !item.variant) return total
    const price = item.product.base_price + (item.variant.additional_price || 0)
    const discount = item.product.discount_percentage || 0
    const finalPrice = price * (1 - discount / 100)
    return total + finalPrice * item.quantity
  }, 0)
  
  const deliveryCharge = subtotal > 1000 ? 0 : 50
  const total = subtotal + deliveryCharge

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading cart...</div>
      </div>
    )
  }
  if (itemsArray.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('cart.empty')}</h1>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <Link
            to="/products"
            className="inline-block px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition"
          >
            {t('common.continueShopping')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('cart.title')} ({getTotalItems()} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {itemsArray.map((item: any) => {
            const product = item.product
            const variant = item.variant
            
            if (!product || !variant) return null

            const productName = getTranslatedProductName(product)
            const price = product.base_price + (variant.additional_price || 0)
            const discount = product.discount_percentage
            const finalPrice = price * (1 - discount / 100)
            const imageUrl = variant.image_urls?.[0] || product.images?.[0]?.image_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect width="150" height="150" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E'

            return (
              <div key={item.id} className="flex gap-4 bg-white p-4 rounded-lg shadow-sm">
                {/* Product Image */}
                <img
                  src={imageUrl}
                  alt={productName}
                  className="w-24 h-24 object-cover rounded-lg"
                />

                {/* Product Info */}
                <div className="flex-1">
                  <Link
                    to={`/products/${product.id}`}
                    className="font-semibold text-gray-900 hover:text-primary-600"
                  >
                    {productName}
                  </Link>
                  <div className="text-sm text-gray-600 mt-1">
                    <span>Size: {variant.size}</span>
                    {variant.color !== 'Default' && (
                      <span className="ml-3">Color: {variant.color}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-gray-900">{formatCurrency(finalPrice)}</span>
                    {discount > 0 && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatCurrency(price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                      disabled={item.quantity <= 1}
                      className="p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-1 font-semibold text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                      className="p-2 text-gray-700 hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('checkout.orderSummary')}</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span>{deliveryCharge === 0 ? 'FREE' : formatCurrency(deliveryCharge)}</span>
              </div>
              {deliveryCharge > 0 && (
                <p className="text-xs text-green-600">
                  Add {formatCurrency(1000 - subtotal)} more for FREE delivery!
                </p>
              )}
              <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="block w-full py-3 bg-pink-600 text-white text-center rounded-lg font-semibold hover:bg-pink-700 transition"
            >
              {t(user ? 'cart.proceedToCheckout' : 'Login to Checkout')}
            </Link>

            <Link
              to="/products"
              className="block w-full mt-3 py-3 border border-gray-300 text-gray-900 text-center rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              {t('common.continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
