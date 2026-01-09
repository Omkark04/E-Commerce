// Database Types
export type UserRole = 'admin' | 'shop_owner' | 'co_shop_owner' | 'delivery_partner' | 'customer'

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'packed' 
  | 'shipped' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled' 
  | 'returned'

export type PaymentMethod = 'cod' | 'online'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  role: UserRole
  language_preference: 'en' | 'hi' | 'mr'
  avatar_url: string | null
  loyalty_points: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name_en: string
  name_hi: string
  name_mr: string
  slug: string
  image_url: string | null
  display_order: number
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  name_en: string
  name_hi: string
  name_mr: string
  description_en: string
  description_hi: string
  description_mr: string
  category_id: string
  base_price: number
  discount_percentage: number
  is_featured: boolean
  is_active: boolean
  total_stock?: number
  total_views: number
  total_sales: number
  created_at: string
  updated_at: string
  category?: Category
  variants?: ProductVariant[]
  images?: ProductImage[]
}

export interface ProductVariant {
  id: string
  product_id: string
  size: string
  color: string
  color_code: string
  sku: string
  stock_quantity: number
  additional_price: number
  image_urls: string[]
  created_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  variant_id: string | null
  image_url: string
  display_order: number
  is_primary: boolean
  created_at: string
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  title: string
  comment: string
  images: string[]
  is_verified_purchase: boolean
  helpful_count: number
  created_at: string
  updated_at: string
  user?: Profile
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  variant_id: string
  quantity: number
  created_at: string
  updated_at: string
  product?: Product
  variant?: ProductVariant
}

export interface Address {
  id: string
  user_id: string
  full_name: string
  phone: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string
  pincode: string
  is_default: boolean
  address_type: 'home' | 'work' | 'other'
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  order_number: string
  total_amount: number
  discount_amount: number
  delivery_charge: number
  final_amount: number
  status: OrderStatus
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  payment_id: string | null
  shipping_address_id: string
  delivery_partner_id: string | null
  tracking_number: string | null
  estimated_delivery: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
  shipping_address?: Address
  tracking?: OrderTracking[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id: string
  quantity: number
  price_at_purchase: number
  discount_applied: number
  created_at: string
  product?: Product
  variant?: ProductVariant
}

export interface OrderTracking {
  id: string
  order_id: string
  status: OrderStatus
  location: string | null
  notes: string | null
  updated_by: string
  created_at: string
}

export interface Coupon {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_value: number
  max_discount: number | null
  usage_limit: number
  used_count: number
  valid_from: string
  valid_until: string
  is_active: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'order' | 'offer' | 'system'
  is_read: boolean
  action_url: string | null
  created_at: string
}

export interface Wishlist {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product?: Product
}
