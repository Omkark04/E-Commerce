import { CreditCard, Wallet } from 'lucide-react'

interface PaymentSelectorProps {
  selectedMethod: 'razorpay' | 'cod'
  onSelectMethod: (method: 'razorpay' | 'cod') => void
}

export default function PaymentSelector({ selectedMethod, onSelectMethod }: PaymentSelectorProps) {
  const paymentMethods = [
    {
      id: 'razorpay' as const,
      name: 'Card / UPI / Wallet',
      description: 'Pay securely using Razorpay',
      icon: CreditCard,
    },
    {
      id: 'cod' as const,
      name: 'Cash on Delivery',
      description: 'Pay when you receive',
      icon: Wallet,
    },
  ]

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon
          const isSelected = selectedMethod === method.id

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelectMethod(method.id)}
              className={`p-4 border-2 rounded-lg text-left transition ${
                isSelected
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{method.name}</h4>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-primary-600' : 'border-gray-300'
                }`}>
                  {isSelected && <div className="w-3 h-3 rounded-full bg-primary-600"></div>}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {selectedMethod === 'razorpay' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Razorpay integration is set up but requires API keys to be configured.
            You'll be redirected to a secure payment gateway.
          </p>
        </div>
      )}

      {selectedMethod === 'cod' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Cash on Delivery:</strong> Pay in cash when your order is delivered to your doorstep.
          </p>
        </div>
      )}
    </div>
  )
}
