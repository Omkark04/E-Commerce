import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import ProductGrid from '@/components/ProductGrid'
import ProductFilters from '@/components/ProductFilters'

export default function ProductsPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const categoryFromUrl = searchParams.get('category') || undefined

  const [filters, setFilters] = useState<{
    categoryId?: string
    minPrice?: number
    maxPrice?: number
    search?: string
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular'
  }>({
    categoryId: categoryFromUrl,
    sortBy: 'newest',
  })

  const { data: products, isLoading } = useProducts(filters)

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const search = formData.get('search') as string
    setFilters({ ...filters, search })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('nav.products')}</h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-xl">
          <input
            type="text"
            name="search"
            placeholder={t('common.search')}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <ProductFilters onFilterChange={setFilters} />
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-3">
          <div className="mb-4 text-gray-600">
            {products && `${products.length} products found`}
          </div>
          <ProductGrid products={products} isLoading={isLoading} />
        </main>
      </div>
    </div>
  )
}
