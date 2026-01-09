import { formatDate } from './formatters'

interface OrderForExport {
  order_number: string
  user?: { full_name?: string; email?: string }
  created_at: string
  status: string
  payment_method: string
  payment_status: string
  final_amount: number
  items?: any[]
}

interface ProductForExport {
  id: string
  name_en: string
  category?: { name_en: string }
  base_price: number
  discount_percentage: number
  is_active: boolean
  variants?: { stock_quantity: number }[]
  total_sales?: number
}

/**
 * Convert data to CSV format and trigger download
 */
function downloadCSV(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Escape CSV field value
 */
function escapeCSVField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return ''
  }
  
  const stringValue = String(value)
  
  // If the value contains comma, newline, or quote, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  
  return stringValue
}

/**
 * Export orders data to CSV file
 */
export function exportOrdersToCSV(orders: OrderForExport[]): void {
  const headers = [
    'Order Number',
    'Customer Name',
    'Customer Email',
    'Date',
    'Status',
    'Payment Method',
    'Payment Status',
    'Items Count',
    'Total Amount'
  ]
  
  const rows = orders.map(order => [
    escapeCSVField(order.order_number),
    escapeCSVField(order.user?.full_name || 'N/A'),
    escapeCSVField(order.user?.email || 'N/A'),
    escapeCSVField(formatDate(order.created_at, 'yyyy-MM-dd HH:mm')),
    escapeCSVField(order.status),
    escapeCSVField(order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'),
    escapeCSVField(order.payment_status),
    escapeCSVField(order.items?.length || 0),
    escapeCSVField(order.final_amount)
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
  
  const date = new Date().toISOString().split('T')[0]
  downloadCSV(csvContent, `orders_export_${date}.csv`)
}

/**
 * Export products data to CSV file
 */
export function exportProductsToCSV(products: ProductForExport[]): void {
  const headers = [
    'Product ID',
    'Product Name',
    'Category',
    'Base Price',
    'Discount %',
    'Final Price',
    'Total Stock',
    'Total Sales',
    'Status'
  ]
  
  const rows = products.map(product => {
    const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock_quantity || 0), 0) || 0
    const finalPrice = product.base_price * (1 - product.discount_percentage / 100)
    
    return [
      escapeCSVField(product.id),
      escapeCSVField(product.name_en),
      escapeCSVField(product.category?.name_en || 'Uncategorized'),
      escapeCSVField(product.base_price),
      escapeCSVField(product.discount_percentage),
      escapeCSVField(finalPrice.toFixed(2)),
      escapeCSVField(totalStock),
      escapeCSVField(product.total_sales || 0),
      escapeCSVField(product.is_active ? 'Active' : 'Inactive')
    ]
  })
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
  
  const date = new Date().toISOString().split('T')[0]
  downloadCSV(csvContent, `products_export_${date}.csv`)
}

/**
 * Export payments data to CSV file
 */
export function exportPaymentsToCSV(orders: OrderForExport[]): void {
  const headers = [
    'Order Number',
    'Customer Name',
    'Date',
    'Payment Method',
    'Payment Status',
    'Amount'
  ]
  
  const rows = orders.map(order => [
    escapeCSVField(order.order_number),
    escapeCSVField(order.user?.full_name || 'N/A'),
    escapeCSVField(formatDate(order.created_at, 'yyyy-MM-dd HH:mm')),
    escapeCSVField(order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'),
    escapeCSVField(order.payment_status),
    escapeCSVField(order.final_amount)
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
  
  const date = new Date().toISOString().split('T')[0]
  downloadCSV(csvContent, `payments_export_${date}.csv`)
}
