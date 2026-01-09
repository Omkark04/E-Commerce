import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token management
export const getAccessToken = () => localStorage.getItem('access_token')
export const getRefreshToken = () => localStorage.getItem('refresh_token')
export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('access_token', access)
  localStorage.setItem('refresh_token', refresh)
}
export const clearTokens = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: any) => Promise.reject(error)
)

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          })
          
          const { access } = response.data
          localStorage.setItem('access_token', access)
          
          originalRequest.headers.Authorization = `Bearer ${access}`
          return api(originalRequest)
        } catch (refreshError) {
          clearTokens()
          window.location.href = '/auth'
          return Promise.reject(refreshError)
        }
      }
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login/', { email, password }),
  
  register: (data: { email: string; password: string; full_name: string }) =>
    api.post('/auth/register/', data),
  
  logout: () => {
    const refresh = getRefreshToken()
    return api.post('/auth/logout/', { refresh })
  },
  
  getProfile: () => api.get('/profile/'),
  
  updateProfile: (data: any) => api.put('/profile/', data),
  
  changePassword: (data: { old_password: string; new_password: string }) =>
    api.post('/auth/password-change/', data),
    
  getCurrentUser: () => api.get('/me/'),
}

// Products API
export const productsAPI = {
  getAll: (params?: any) => api.get('/products/', { params }),
  getById: (id: string) => api.get(`/products/${id}/`),
  getFeatured: () => api.get('/products/featured/'),
  getByCategory: (categoryId: string) => api.get(`/products/category/${categoryId}/`),
  
  // Admin
  adminGetAll: (params?: any) => api.get('/admin/products/', { params }),
  create: (data: any) => api.post('/admin/products/', data),
  update: (id: string, data: any) => api.put(`/admin/products/${id}/`, data),
  delete: (id: string) => api.delete(`/admin/products/${id}/`),
  toggleStatus: (id: string) => api.post(`/admin/products/${id}/toggle-status/`),
  getLowStock: () => api.get('/admin/products/low-stock/'),
  exportCSV: () => api.get('/admin/products/export/', { responseType: 'blob' }),
  importCSV: (formData: FormData) => api.post('/admin/products/import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Variants
  getVariants: (productId: string) => api.get(`/admin/products/${productId}/variants/`),
  createVariant: (productId: string, data: any) => api.post(`/admin/products/${productId}/variants/`, data),
  updateVariant: (variantId: string, data: any) => api.put(`/admin/products/variants/${variantId}/`, data),
  deleteVariant: (variantId: string) => api.delete(`/admin/products/variants/${variantId}/`),
  
  // Images
  getImages: (productId: string) => api.get(`/admin/products/${productId}/images/`),
  createImage: (productId: string, data: any) => api.post(`/admin/products/${productId}/images/`, data),
  deleteImage: (imageId: string) => api.delete(`/admin/products/images/${imageId}/`),
}

// Categories API
export const categoriesAPI = {
  getMainCategories: () => api.get('/main-categories/'),
  getCategories: (params?: { main_category_id?: string }) => api.get('/categories/', { params }),
  getById: (id: string) => api.get(`/categories/${id}/`),
  
  // Admin
  adminGetCategories: () => api.get('/admin/categories/'),
  createCategory: (data: any) => api.post('/admin/categories/', data),
  updateCategory: (id: string, data: any) => api.put(`/admin/categories/${id}/`, data),
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}/`),
  
  createMainCategory: (data: any) => api.post('/admin/main-categories/', data),
  updateMainCategory: (id: string, data: any) => api.put(`/admin/main-categories/${id}/`, data),
}

// Companies API
export const companiesAPI = {
  getAll: () => api.get('/admin/companies/'),
  create: (data: any) => api.post('/admin/companies/', data),
  update: (id: string, data: any) => api.put(`/admin/companies/${id}/`, data),
  delete: (id: string) => api.delete(`/admin/companies/${id}/`),
}

// Cart API
export const cartAPI = {
  getItems: () => api.get('/cart/'),
  addItem: (data: { product_id: string; variant_id: string; quantity: number }) =>
    api.post('/cart/', data),
  updateItem: (id: string, data: { quantity: number }) => api.put(`/cart/${id}/`, data),
  removeItem: (id: string) => api.delete(`/cart/${id}/`),
  clear: () => api.delete('/cart/clear/'),
}

// Addresses API
export const addressesAPI = {
  getAll: () => api.get('/addresses/'),
  create: (data: any) => api.post('/addresses/', data),
  update: (id: string, data: any) => api.put(`/addresses/${id}/`, data),
  delete: (id: string) => api.delete(`/addresses/${id}/`),
  setDefault: (id: string) => api.post(`/addresses/${id}/set-default/`),
}

// Orders API
export const ordersAPI = {
  getAll: (params?: any) => api.get('/orders/', { params }),
  getById: (id: string) => api.get(`/orders/${id}/`),
  create: (data: any) => api.post('/orders/', data),
  cancel: (id: string) => api.post(`/orders/${id}/cancel/`),
  reorder: (id: string) => api.post(`/orders/${id}/reorder/`),
  
  // Admin
  adminGetAll: (params?: any) => api.get('/admin/orders/', { params }),
  adminGetById: (id: string) => api.get(`/admin/orders/${id}/`),
  adminCreate: (data: any) => api.post('/admin/orders/create/', data),
  updateStatus: (id: string, data: any) => api.put(`/admin/orders/${id}/status/`, data),
  assignDelivery: (id: string, data: any) => api.put(`/admin/orders/${id}/assign-delivery/`, data),
  updateTracking: (id: string, data: any) => api.put(`/admin/orders/${id}/tracking/`, data),
  getStats: () => api.get('/admin/orders/stats/'),
  exportCSV: (params?: any) => api.get('/admin/orders/export/', { params, responseType: 'blob' }),
  getDeliveryPartners: () => api.get('/admin/delivery-partners/'),
}

// Refunds API
export const refundsAPI = {
  getAll: (params?: any) => api.get('/admin/refunds/', { params }),
  getById: (id: string) => api.get(`/admin/refunds/${id}/`),
  update: (id: string, data: any) => api.put(`/admin/refunds/${id}/update/`, data),
  exportCSV: (params?: any) => api.get('/admin/refunds/export/', { params, responseType: 'blob' }),
}

// Reviews API
export const reviewsAPI = {
  getForProduct: (productId: string) => api.get(`/products/${productId}/reviews/`),
  getSummary: (productId: string) => api.get(`/products/${productId}/reviews/summary/`),
  getShowcase: () => api.get('/reviews/showcase/'),
  create: (productId: string, data: any) => api.post(`/products/${productId}/reviews/create/`, data),
  updateOwn: (id: string, data: any) => api.put(`/reviews/${id}/`, data),
  deleteOwn: (id: string) => api.delete(`/reviews/${id}/`),
  vote: (id: string, data: { is_helpful: boolean }) => api.post(`/reviews/${id}/vote/`, data),
  
  // Admin
  adminGetAll: (params?: any) => api.get('/admin/reviews/', { params }),
  adminUpdateStatus: (id: string, status: string) => 
    api.put(`/admin/reviews/${id}/status/`, { status }),
  adminDelete: (id: string) => api.delete(`/admin/reviews/${id}/`),
}

// Wishlist API
export const wishlistAPI = {
  getAll: () => api.get('/wishlist/'),
  add: (productId: string) => api.post('/wishlist/', { product_id: productId }),
  remove: (productId: string) => api.delete(`/wishlist/${productId}/`),
}

// Promotions API
export const promotionsAPI = {
  validateCoupon: (code: string, orderTotal: number) =>
    api.post('/coupons/validate/', { code, order_total: orderTotal }),
  getFlashSales: () => api.get('/flash-sales/'),
  getBanners: () => api.get('/banners/'),
  
  // Admin Coupons
  getCoupons: () => api.get('/admin/coupons/'),
  createCoupon: (data: any) => api.post('/admin/coupons/', data),
  updateCoupon: (id: string, data: any) => api.put(`/admin/coupons/${id}/`, data),
  deleteCoupon: (id: string) => api.delete(`/admin/coupons/${id}/`),
  
  // Admin Flash Sales
  getFlashSalesAdmin: () => api.get('/admin/flash-sales/'),
  createFlashSale: (data: any) => api.post('/admin/flash-sales/', data),
  updateFlashSale: (id: string, data: any) => api.put(`/admin/flash-sales/${id}/`, data),
  deleteFlashSale: (id: string) => api.delete(`/admin/flash-sales/${id}/`),
  
  // Admin Banners
  getBannersAdmin: () => api.get('/admin/banners/'),
  createBanner: (data: any) => api.post('/admin/banners/', data),
  updateBanner: (id: string, data: any) => api.put(`/admin/banners/${id}/`, data),
  deleteBanner: (id: string) => api.delete(`/admin/banners/${id}/`),
  
  // Bulk discount
  applyBulkDiscount: (data: any) => api.post('/admin/products/bulk-discount/', data),
}

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get('/notifications/'),
  markRead: (id: string) => api.post(`/notifications/${id}/read/`),
  markAllRead: () => api.post('/notifications/read-all/'),
}

// Customers API (Admin)
export const customersAPI = {
  getAll: (params?: any) => api.get('/admin/customers/', { params }),
  getById: (id: number) => api.get(`/admin/customers/${id}/`),
}

// Dashboard API (Admin)
export const dashboardAPI = {
  getStats: () => api.get('/admin/dashboard/'),
}

// Size Charts API
export const sizeChartsAPI = {
  getAll: (params?: any) => api.get('/admin/size-charts/', { params }),
  create: (data: any) => api.post('/admin/size-charts/', data),
  update: (id: string, data: any) => api.put(`/admin/size-charts/${id}/`, data),
  delete: (id: string) => api.delete(`/admin/size-charts/${id}/`),
}

// Payments API (Admin)
export const paymentsAPI = {
  getAll: (params?: any) => api.get('/admin/payments/', { params }),
  updateStatus: (id: string, data: { payment_status: string }) =>
    api.put(`/admin/payments/${id}/status/`, data),
}

// Upload API (Cloudinary)
export const uploadAPI = {
  upload: (formData: FormData) => api.post('/admin/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (publicId: string, type: 'image' | 'video' = 'image') =>
    api.delete('/admin/upload/delete/', { data: { public_id: publicId, type } }),
}

export default api
