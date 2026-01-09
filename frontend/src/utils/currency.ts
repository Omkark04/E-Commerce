export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatPrice = (price: number, discount?: number): { 
  original: string
  final: string
  savings: string
} => {
  const originalPrice = formatCurrency(price)
  
  if (discount && discount > 0) {
    const finalPrice = price * (1 - discount / 100)
    const savings = price - finalPrice
    
    return {
      original: originalPrice,
      final: formatCurrency(finalPrice),
      savings: formatCurrency(savings),
    }
  }
  
  return {
    original: originalPrice,
    final: originalPrice,
    savings: formatCurrency(0),
  }
}
