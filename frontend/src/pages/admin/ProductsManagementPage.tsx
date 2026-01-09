import { Plus, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProductTable from '@/components/admin/ProductTable'
import { useAdminProducts } from '@/hooks/admin/useProducts'
import { exportProductsToCSV } from '@/utils/csvExport'

export default function ProductsManagementPage() {
  const { data: products } = useAdminProducts()

  const handleExportCSV = () => {
    if (products && products.length > 0) {
      exportProductsToCSV(products as any)
    } else {
      alert('No products to export')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Product Management</h1>
          <p className="text-white/60 mt-1">Manage your store's inventory and offerings</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all border border-white/10 backdrop-blur-sm"
          >
            <Download className="w-5 h-5" />
            <span>Export CSV</span>
          </button>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      <ProductTable />
    </div>
  )
}
