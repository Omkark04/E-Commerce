import { Link } from 'react-router-dom'
import { useCategories } from '@/hooks/useCategories'
import { getTranslatedCategoryName } from '@/utils/translations'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function CategoryGrid() {
  const { data: categories, isLoading } = useCategories()

  if (isLoading) {
    return (
      <section className="my-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="my-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Shop by Category
        </h2>
        <p className="text-gray-600 text-lg">Discover our exquisite collection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories?.map((category, index) => {
          // Different gradient colors for each category
          const gradients = [
            'from-purple-600 to-pink-600',
            'from-pink-600 to-rose-600',
            'from-amber-600 to-orange-600',
          ]
          const gradient = gradients[index % gradients.length]

          return (
            <Link
              key={category.id}
              to={`/products?category=${category.slug}`}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 h-80"
            >
              {/* Background Image Placeholder with Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
                  }} />
                </div>
              </div>

              {/* Content Overlay */}
              <div className="relative h-full flex flex-col justify-end p-6 bg-gradient-to-t from-black/60 to-transparent">
                {/* Badge */}
                {index === 0 && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-yellow-400 text-gray-900 rounded-full text-xs font-bold">
                    <Sparkles className="w-3 h-3" />
                    Featured
                  </div>
                )}

                {/* Category Name */}
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:scale-105 transition-transform">
                  {getTranslatedCategoryName(category)}
                </h3>

                {/* CTA */}
                <div className="flex items-center gap-2 text-white group-hover:gap-3 transition-all">
                  <span className="font-medium">Explore Collection</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Discount Badge (if applicable) */}
                {index === 0 && (
                  <div className="absolute bottom-6 right-6 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                    <span className="text-white font-bold">Up to 30% OFF</span>
                  </div>
                )}
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}
