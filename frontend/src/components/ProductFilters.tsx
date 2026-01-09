import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCategories } from '@/hooks/useCategories'
import { getTranslatedCategoryName } from '@/utils/translations'

interface ProductFiltersProps {
  onFilterChange: (filters: {
    categoryId?: string
    minPrice?: number
    maxPrice?: number
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular'
  }) => void
}

export default function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const { t } = useTranslation()
  const { data: categories } = useCategories()
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 })
  const [sortBy, setSortBy] = useState<string>('newest')

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    onFilterChange({
      categoryId: categoryId || undefined,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      sortBy: sortBy as any,
    })
  }

  const handlePriceChange = (min: number, max: number) => {
    setPriceRange({ min, max })
    onFilterChange({
      categoryId: selectedCategory || undefined,
      minPrice: min,
      maxPrice: max,
      sortBy: sortBy as any,
    })
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    onFilterChange({
      categoryId: selectedCategory || undefined,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      sortBy: sort as any,
    })
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">{t('nav.categories')}</h3>
        <div className="space-y-2">
          <button
            onClick={() => handleCategoryChange('')}
            className={`w-full text-left px-3 py-2 rounded transition ${
              selectedCategory === '' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
            }`}
          >
            All Categories
          </button>
          {categories?.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`w-full text-left px-3 py-2 rounded transition ${
                selectedCategory === category.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              {getTranslatedCategoryName(category)}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => handlePriceChange(Number(e.target.value), priceRange.max)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => handlePriceChange(priceRange.min, Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePriceChange(0, 1000)}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
            >
              Under ₹1000
            </button>
            <button
              onClick={() => handlePriceChange(1000, 3000)}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
            >
              ₹1000-₹3000
            </button>
          </div>
        </div>
      </div>

      {/* Sort By */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">{t('common.sort')}</h3>
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="newest">Newest First</option>
          <option value="popular">Most Popular</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  )
}
