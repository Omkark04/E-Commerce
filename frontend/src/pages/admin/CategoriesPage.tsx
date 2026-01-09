import { useState } from 'react'
import { Plus, Edit2, Trash2, ChevronRight, FolderTree, X, Globe } from 'lucide-react'
import { useMainCategories, useCategories, useCreateCategory, useCreateMainCategory } from '../../hooks/admin/useAdmin'
import LoadingSpinner from '../../components/LoadingSpinner'
import { translateToHindiAndMarathi } from '../../services/translationService'

interface CreateCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'main' | 'sub'
  mainCategoryId?: string | null
}

function CreateCategoryModal({ isOpen, onClose, type, mainCategoryId }: CreateCategoryModalProps) {
  const [nameEn, setNameEn] = useState('')
  const [nameHi, setNameHi] = useState('')
  const [nameMr, setNameMr] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const createMain = useCreateMainCategory()
  const createSub = useCreateCategory()

  const handleAutoTranslate = async () => {
    if (!nameEn.trim()) return
    
    setIsTranslating(true)
    try {
      const translations = await translateToHindiAndMarathi(nameEn)
      setNameHi(translations.hi)
      setNameMr(translations.mr)
    } catch (error) {
      console.error('Translation error:', error)
      alert('Translation failed. Please try again or enter translations manually.')
    } finally {
      setIsTranslating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (type === 'main') {
        await createMain.mutateAsync({
          name_en: nameEn,
          name_hi: nameHi,
          name_mr: nameMr
        })
      } else {
        if (!mainCategoryId) return
        await createSub.mutateAsync({
          name_en: nameEn,
          name_hi: nameHi,
          name_mr: nameMr,
          main_category_id: mainCategoryId
        })
      }
      onClose()
      setNameEn('')
      setNameHi('')
      setNameMr('')
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Add {type === 'main' ? 'Main' : 'Sub'} Category</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoTranslate}
              disabled={isTranslating || !nameEn.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-blue-500/40 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isTranslating ? (
                <>
                  <LoadingSpinner className="w-3 h-3 !border-white/30 !border-t-white" />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3" />
                  <span>Auto-Translate</span>
                </>
              )}
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Name (English)</label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Name (Hindi)</label>
            <input
              type="text"
              value={nameHi}
              onChange={(e) => setNameHi(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Name (Marathi)</label>
            <input
              type="text"
              value={nameMr}
              onChange={(e) => setNameMr(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            type="submit"
            disabled={createMain.isPending || createSub.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors mt-4"
          >
            {createMain.isPending || createSub.isPending ? 'Creating...' : 'Create Category'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  const { data: mainCategories, isLoading: mainLoading } = useMainCategories()
  const { data: categories, isLoading: catLoading } = useCategories()
  const [selectedMainId, setSelectedMainId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'main' | 'sub'>('main')

  // Filter categories by selected main category
  const filteredCategories = selectedMainId 
    ? categories?.filter((c: any) => c.main_category?.id === selectedMainId)
    : categories

  if (mainLoading || catLoading) {
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
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-gray-400">Manage main and sub-categories</p>
        </div>
        <button 
          onClick={() => {
            setModalType('main')
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors shadow-lg shadow-purple-600/25"
        >
          <Plus className="w-4 h-4" />
          Add Main Category
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Categories List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-white px-2">Main Categories</h2>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
            <button
              onClick={() => setSelectedMainId(null)}
              className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                selectedMainId === null 
                  ? 'bg-purple-500/20 text-white border-l-4 border-purple-500' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderTree className="w-5 h-5" />
                <span className="font-medium">All Categories</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                {categories?.length || 0}
              </span>
            </button>
            
            <div className="divide-y divide-white/5 border-t border-white/10">
              {mainCategories?.map((main: any) => (
                <button
                  key={main.id}
                  onClick={() => setSelectedMainId(main.id)}
                  className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                    selectedMainId === main.id 
                      ? 'bg-purple-500/20 text-white border-l-4 border-purple-500' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="font-medium">{main.name_en}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${selectedMainId === main.id ? 'rotate-90 text-purple-400' : ''}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sub Categories Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white px-2">
            {selectedMainId 
              ? `${mainCategories?.find((m: any) => m.id === selectedMainId)?.name_en} Categories`
              : 'All Categories'
            }
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredCategories?.map((category: any) => (
              <div key={category.id} className="group relative p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all backdrop-blur-md">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                    {category.image_url ? (
                      <img src={category.image_url} alt={category.name_en} className="w-full h-full object-cover" />
                    ) : (
                      <FolderTree className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg bg-white/10 hover:bg-purple-500 text-gray-400 hover:text-white transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500 text-gray-400 hover:text-white transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-1">{category.name_en}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                      {category.main_category?.name_en}
                    </span>
                    <span>• {category.slug}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add New Card */}
            <button 
              onClick={() => {
                if (!selectedMainId) {
                  alert('Please select a main category first')
                  return
                }
                setModalType('sub')
                setIsModalOpen(true)
              }}
              className="group flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-gray-500 hover:text-purple-400 h-full min-h-[140px]"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-purple-500/20 flex items-center justify-center mb-2 transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <span className="font-medium">Add New Category</span>
            </button>
          </div>
        </div>
      </div>

      <CreateCategoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        type={modalType}
        mainCategoryId={selectedMainId}
      />
    </div>
  )
}
