import { useState } from 'react'
import { Plus, Ruler, Edit2, Trash2, Shirt, X } from 'lucide-react'
import { useAdminSizeCharts, useCreateSizeChart, useMainCategories, useCategories } from '@/hooks/admin/useAdmin' // Note: need to add useCreateSizeChart to hooks
import LoadingSpinner from '@/components/LoadingSpinner'

interface CreateSizeChartModalProps {
  isOpen: boolean
  onClose: () => void
}

function CreateSizeChartModal({ isOpen, onClose }: CreateSizeChartModalProps) {
  const [title, setTitle] = useState('')
  const [mainCategoryId, setMainCategoryId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [measurements, setMeasurements] = useState('Size,Chest,Length,Shoulder')
  
  const createSizeChart = useCreateSizeChart()
  const { data: mainCategories } = useMainCategories()
  const { data: categories } = useCategories(mainCategoryId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Convert CSV measurements string to object structure (mocking logic for now)
    const measurementsObj = measurements.split(',').reduce((acc, curr) => {
      acc[curr.trim()] = true
      return acc
    }, {} as Record<string, boolean>)

    try {
      await createSizeChart.mutateAsync({
        title,
        main_category_id: mainCategoryId,
        category_id: categoryId || null,
        measurements: measurementsObj
      })
      onClose()
      setTitle('')
      setMainCategoryId('')
      setCategoryId('')
    } catch (error) {
      console.error('Error creating size chart:', error)
      alert('Failed to create size chart')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Create Size Chart</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Main Category</label>
            <select
              value={mainCategoryId}
              onChange={(e) => {
                setMainCategoryId(e.target.value)
                setCategoryId('')
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              required
            >
              <option value="" className="bg-slate-900">Select Main Category</option>
              {mainCategories?.map((cat: any) => (
                <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.name_en}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Sub Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              disabled={!mainCategoryId}
            >
              <option value="" className="bg-slate-900">All (Default)</option>
              {categories?.map((cat: any) => (
                <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.name_en}</option>
              ))}
            </select>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Measurements (comma separated)</label>
            <input
              type="text"
              value={measurements}
              onChange={(e) => setMeasurements(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="e.g. Size, Chest, Length"
            />
          </div>
          <button
            type="submit"
            disabled={createSizeChart.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors mt-4"
          >
            {createSizeChart.isPending ? 'Creating...' : 'Create Chart'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function SizeChartsPage() {
  const { data: sizeCharts, isLoading } = useAdminSizeCharts()
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Size Charts</h1>
          <p className="text-gray-400">Manage sizing guides for product categories</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors shadow-lg shadow-purple-600/25"
        >
          <Plus className="w-4 h-4" />
          Create Chart
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Array.isArray(sizeCharts) ? sizeCharts : []).map((chart: any) => (
          <div key={chart.id} className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all backdrop-blur-md">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Ruler className="w-6 h-6" />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 rounded-lg bg-white/10 hover:bg-purple-500 text-gray-400 hover:text-white transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg bg-white/10 hover:bg-red-500 text-gray-400 hover:text-white transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="font-bold text-lg text-white mb-2">{chart.title}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Shirt className="w-4 h-4" />
                <span>{chart.main_category?.name_en} / {chart.category?.name_en || 'All Categories'}</span>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Saved Measurements</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(chart.measurements || {}).slice(0, 4).map((key) => (
                    <span key={key} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-gray-300">
                      {key}
                    </span>
                  ))}
                  {Object.keys(chart.measurements || {}).length > 4 && (
                    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-gray-400">
                      +{Object.keys(chart.measurements || {}).length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Card */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-gray-500 hover:text-purple-400 min-h-[280px]"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 group-hover:bg-purple-500/20 flex items-center justify-center mb-4 transition-colors">
            <Plus className="w-8 h-8" />
          </div>
          <span className="font-medium text-lg">Add Size Chart</span>
          <p className="text-sm text-gray-500 mt-2">New guide for a category</p>
        </button>
      </div>

      <CreateSizeChartModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
