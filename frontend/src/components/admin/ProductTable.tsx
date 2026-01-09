import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit, Trash2, ToggleLeft, ToggleRight, Search } from 'lucide-react'
import { useAdminProducts, useDeleteProduct, useToggleProductStatus } from '@/hooks/admin/useProducts'
import type { Product } from '@/types'
import { getTranslatedProductName } from '@/utils/translations'
import { formatCurrency } from '@/utils/formatters'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ProductTable() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  
  const { data: products, isLoading } = useAdminProducts({ search, status: statusFilter })
  const deleteProduct = useDeleteProduct()
  const toggleStatus = useToggleProductStatus()

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProduct.mutate(id)
    }
  }

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleStatus.mutate({ id, isActive: !currentStatus })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div>
      {/* Advanced Filters */}
      <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search products by name, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[ 
              { id: 'all', label: 'All Products' },
              { id: 'active', label: 'Active' },
              { id: 'inactive', label: 'Inactive' }
            ].map((status) => (
              <button
                key={status.id}
                onClick={() => setStatusFilter(status.id as any)}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  statusFilter === status.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {products && products.length > 0 ? (
                products.map((product: Product) => {
                  const imageUrl = product.images?.[0]?.image_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect width="60" height="60" fill="%23374151"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239CA3AF" font-family="sans-serif" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E'
                  // Use total_stock from API response directly
                  const totalStock = product.total_stock ?? 0

                  return (
                    <tr key={product.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={imageUrl}
                            alt={product.name_en}
                            className="w-12 h-12 object-cover rounded-lg bg-white/5"
                          />
                          <div>
                            <p className="font-medium text-white">{getTranslatedProductName(product)}</p>
                            <p className="text-xs text-white/50">ID: {product.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/80">
                        <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70">
                          {product.category?.name_en || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {formatCurrency(Number(product.base_price))}
                        {product.discount_percentage > 0 && (
                          <span className="ml-2 text-xs text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded">-{product.discount_percentage}%</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`${totalStock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {totalStock} units
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                          product.is_active 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-white/5 text-white/40 border-white/10'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(product.id, product.is_active)}
                            className={`p-2 rounded-lg transition-colors ${
                                product.is_active 
                                    ? 'text-emerald-400 hover:bg-emerald-500/10' 
                                    : 'text-white/40 hover:bg-white/10 text-white'
                            }`}
                            title={product.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {product.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, getTranslatedProductName(product))}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete"
                            disabled={deleteProduct.isPending}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center text-white/40">
                    <p className="text-lg font-medium">No products found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
