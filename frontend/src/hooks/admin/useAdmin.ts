import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  dashboardAPI, 
  ordersAPI, 
  productsAPI, 
  customersAPI, 
  refundsAPI,
  reviewsAPI,
  paymentsAPI,
  promotionsAPI,
  categoriesAPI,
  companiesAPI,
  sizeChartsAPI
} from '@/lib/api'

// Dashboard Stats
export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => dashboardAPI.getStats(),
    select: (response) => response.data,
    refetchInterval: 60000, // Refresh every minute
  })
}

// Admin Orders
export function useAdminOrders(params?: { status?: string; payment_method?: string; date_from?: string; date_to?: string }) {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: () => ordersAPI.adminGetAll(params),
    select: (response) => {
      const data = response.data
      return Array.isArray(data) ? data : (data?.results || [])
    },
  })
}

export function useAdminOrderStats() {
  return useQuery({
    queryKey: ['admin', 'orders', 'stats'],
    queryFn: () => ordersAPI.getStats(),
    select: (response) => response.data,
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => ordersAPI.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
  })
}

export function useExportOrdersCSV() {
  return useMutation({
    mutationFn: (params?: any) => ordersAPI.exportCSV(params),
    onSuccess: (response: any) => {
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'orders_export.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
    },
  })
}

// Admin Products
export function useAdminProducts(params?: any) {
  return useQuery({
    queryKey: ['admin', 'products', params],
    queryFn: () => productsAPI.adminGetAll(params),
    select: (response) => response.data,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => productsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
  })
}

export function useLowStockProducts() {
  return useQuery({
    queryKey: ['admin', 'products', 'low-stock'],
    queryFn: () => productsAPI.getLowStock(),
    select: (response) => response.data,
  })
}

// Admin Customers
export function useAdminCustomers(params?: { page?: number; per_page?: number }) {
  return useQuery({
    queryKey: ['admin', 'customers', params],
    queryFn: () => customersAPI.getAll(params),
    select: (response) => response.data,
  })
}

export function useAdminCustomerDetail(id: number) {
  return useQuery({
    queryKey: ['admin', 'customers', id],
    queryFn: () => customersAPI.getById(id),
    select: (response) => response.data,
    enabled: !!id,
  })
}

// Admin Refunds
export function useAdminRefunds(params?: { status?: string }) {
  return useQuery({
    queryKey: ['admin', 'refunds', params],
    queryFn: () => refundsAPI.getAll(params),
    select: (response) => response.data,
  })
}

export function useUpdateRefund() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => refundsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'refunds'] })
    },
  })
}

// Admin Reviews
export function useAdminReviews(params?: { status?: string; rating?: number }) {
  return useQuery({
    queryKey: ['admin', 'reviews', params],
    queryFn: () => reviewsAPI.adminGetAll(params),
    select: (response) => response.data,
  })
}

export function useUpdateReviewStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      reviewsAPI.adminUpdateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] })
    },
  })
}

// Admin Payments
export function useAdminPayments(params?: any) {
  return useQuery({
    queryKey: ['admin', 'payments', params],
    queryFn: () => paymentsAPI.getAll(params),
    select: (response) => response.data,
  })
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      paymentsAPI.updateStatus(id, { payment_status: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] })
    },
  })
}

// Categories
export function useMainCategories() {
  return useQuery({
    queryKey: ['main-categories'],
    queryFn: () => categoriesAPI.getMainCategories(),
    select: (response) => {
      const data = response.data
      return Array.isArray(data) ? data : (data?.results || [])
    },
  })
}

export function useCategories(mainCategoryId?: string) {
  return useQuery({
    queryKey: ['categories', mainCategoryId],
    queryFn: () => categoriesAPI.getCategories({ main_category_id: mainCategoryId }),
    select: (response) => {
      const data = response.data
      return Array.isArray(data) ? data : (data?.results || [])
    },
  })
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => categoriesAPI.adminGetCategories(),
    select: (response) => {
      const data = response.data
      return Array.isArray(data) ? data : (data?.results || [])
    },
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => categoriesAPI.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useCreateMainCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => categoriesAPI.createMainCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['main-categories'] })
    },
  })
}

// Companies
export function useCompanies() {
  return useQuery({
    queryKey: ['admin', 'companies'],
    queryFn: () => companiesAPI.getAll(),
    select: (response) => response.data,
  })
}

export function useCreateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => companiesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] })
    },
  })
}

// Coupons
export function useAdminCoupons() {
  return useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: () => promotionsAPI.getCoupons(),
    select: (response) => response.data,
  })
}

export function useCreateCoupon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => promotionsAPI.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] })
    },
  })
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => promotionsAPI.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] })
    },
  })
}

// Banners
export function useAdminBanners() {
  return useQuery({
    queryKey: ['admin', 'banners'],
    queryFn: () => promotionsAPI.getBannersAdmin(),
    select: (response) => {
      const data = response.data
      return Array.isArray(data) ? data : (data?.results || [])
    },
  })
}

export function useCreateBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => promotionsAPI.createBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] })
    },
  })
}

// Size Charts
export function useAdminSizeCharts(params?: any) {
  return useQuery({
    queryKey: ['admin', 'size-charts', params],
    queryFn: () => sizeChartsAPI.getAll(params),
    select: (response) => {
      const data = response.data
      return Array.isArray(data) ? data : (data?.results || [])
    },
  })
}

export function useCreateSizeChart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => sizeChartsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'size-charts'] })
    },
  })
}

// Apply Bulk Discount
export function useApplyBulkDiscount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => promotionsAPI.applyBulkDiscount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
  })
}
