import { useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productsAPI } from '../../lib/api'
import ProductForm from '../../components/admin/ProductForm'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null
      const { data } = await productsAPI.getById(id)
      return data
    },
    enabled: isEdit,
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-white">
          {isEdit ? 'Edit Product' : 'Create New Product'}
        </h1>
        <p className="text-white/60 mt-1">
          {isEdit ? 'Update product details and inventory' : 'Add a new product to your catalog'}
        </p>
      </div>

      <ProductForm productId={id} initialData={product} />
    </div>
  )
}
