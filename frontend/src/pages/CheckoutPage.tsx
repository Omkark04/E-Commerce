import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, User, MapPin, CreditCard, ShoppingBag } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAddresses, type Address } from '@/hooks/useAddresses'
import { useCartItems } from '@/hooks/useCartItems'
import { useOrderCalculations } from '@/hooks/useOrderCalculations'
import { useCreateOrder } from '@/hooks/usePayment'
import AddressSelector from '@/components/AddressSelector'
import OrderSummary from '@/components/checkout/OrderSummary'
import PaymentSelector from '@/components/checkout/PaymentSelector'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const { data: addresses } = useAddresses()
  const { data: cartItems } = useCartItems()
  const { subtotal, deliveryCharges, tax, total } = useOrderCalculations()
  const createOrder = useCreateOrder()

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('cod')

  // Auto-select default address
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddress) {
      const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0]
      setSelectedAddress(defaultAddress)
    }
  }, [addresses, selectedAddress])

  // Redirect if cart is empty
  useEffect(() => {
    const itemsArray = Array.isArray(cartItems) ? cartItems : ((cartItems as any)?.results || [])
    if (itemsArray.length === 0) {
      navigate('/cart')
    }
  }, [cartItems, navigate])

  const steps = [
    { number: 1, title: 'Profile', icon: User },
    { number: 2, title: 'Address', icon: MapPin },
    { number: 3, title: 'Payment', icon: CreditCard },
    { number: 4, title: 'Review', icon: ShoppingBag },
  ]

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select a delivery address')
      return
    }

    const itemsArray = Array.isArray(cartItems) ? cartItems : ((cartItems as any)?.results || [])
    
    if (!itemsArray || itemsArray.length === 0) {
      alert('Your cart is empty')
      return
    }

    try {
      const order = await createOrder.mutateAsync({
        shippingAddressId: selectedAddress.id,
        paymentMethod,
        subtotal,
        deliveryCharges,
        tax,
        finalAmount: total,
        cartItems: itemsArray,
      })

      // Navigate to order confirmation
      navigate(`/order-confirmation/${order.id}`)
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again.')
    }
  }

  const canProceedToNextStep = () => {
    if (currentStep === 1) return true // Profile is pre-filled
    if (currentStep === 2) return !!selectedAddress
    if (currentStep === 3) return true // Payment method is selected
    return false
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.number
            const isCompleted = currentStep > step.number

            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-600 text-white'
                        : isActive
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <p className={`text-sm mt-2 ${isActive ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Profile Info */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profile?.full_name || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={profile?.phone || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Address Selection */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <AddressSelector
                selectedAddressId={selectedAddress?.id}
                onSelectAddress={setSelectedAddress}
              />
            </div>
          )}

          {/* Step 3: Payment Method */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <PaymentSelector
                selectedMethod={paymentMethod}
                onSelectMethod={setPaymentMethod}
              />
            </div>
          )}

          {/* Step 4: Review Order */}
          {currentStep === 4 && (
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery Address</h3>
                {selectedAddress && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{selectedAddress.full_name}</p>
                    <p className="text-sm text-gray-600">{selectedAddress.phone}</p>
                    <p className="text-sm text-gray-700 mt-2">
                      {selectedAddress.address_line1}, {selectedAddress.address_line2}
                      <br />
                      {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Method</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">
                    {paymentMethod === 'razorpay' ? 'Card / UPI / Wallet (Razorpay)' : 'Cash on Delivery'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Back
              </button>
            )}
            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceedToNextStep()}
                className="flex-1 px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={createOrder.isPending || !selectedAddress}
                className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
              >
                {createOrder.isPending ? (
                  <>
                    <LoadingSpinner />
                    Placing Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  )
}
