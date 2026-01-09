import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, DollarSign, Tag, Image, Layers, Plus, Trash2, Globe } from 'lucide-react'
import { useCategories } from '../../hooks/useCategories'
import { useCreateProduct, useUpdateProduct } from '../../hooks/admin/useProducts'
import { useDefaultSizes, useDefaultColors } from '../../hooks/admin/useSizesColors'
import ImageUploader from './ImageUploader'
import LoadingSpinner from '../../components/LoadingSpinner'
import { translateProductContent } from '../../services/translationService'

interface ProductFormProps {
  productId?: string
  initialData?: any
}

interface ProductFormData {
  name_en: string
  name_hi: string
  name_mr: string
  description_en: string
  description_hi: string
  description_mr: string
  category_id: string
  base_price: number
  discount_percentage: number
  stock_quantity: number
  brand: string
  is_featured: boolean
  is_active: boolean
  is_new_arrival: boolean
  images: string[]
  videos: string[]
  variants: any[]
}

export default function ProductForm({ productId, initialData }: ProductFormProps) {
  const navigate = useNavigate()
  const { data: categories } = useCategories()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const [formData, setFormData] = useState<ProductFormData>({
    name_en: '',
    name_hi: '',
    name_mr: '',
    description_en: '',
    description_hi: '',
    description_mr: '',
    category_id: '',
    base_price: 0,
    discount_percentage: 0,
    stock_quantity: 0,
    brand: '',
    is_featured: false,
    is_active: true,
    is_new_arrival: false,
    images: [],
    videos: [],
    variants: [],
  })
  
  // Fetch default sizes based on selected category
  const { data: defaultSizes } = useDefaultSizes(formData.category_id)
  const { data: defaultColors } = useDefaultColors()

  // We are not using `errors` for strict validation UI in this iteration as per previous styling 
  // but keeping basic state valid for submission
  const isLoading = createProduct.isPending || updateProduct.isPending
  const [isTranslating, setIsTranslating] = useState(false)

  const handleAutoTranslate = async () => {
    if (!formData.name_en.trim() && !formData.description_en.trim()) {
      return
    }

    setIsTranslating(true)
    try {
      const translations = await translateProductContent(
        formData.name_en,
        formData.description_en
      )
      
      setFormData(prev => ({
        ...prev,
        name_hi: translations.name_hi,
        name_mr: translations.name_mr,
        description_hi: translations.description_hi,
        description_mr: translations.description_mr,
      }))
    } catch (error) {
      console.error('Translation error:', error)
      alert('Translation failed. Please try again or enter translations manually.')
    } finally {
      setIsTranslating(false)
    }
  }

  useEffect(() => {
    if (initialData) {
      setFormData({
        name_en: initialData.name_en || '',
        name_hi: initialData.name_hi || '',
        name_mr: initialData.name_mr || '',
        description_en: initialData.description_en || '',
        description_hi: initialData.description_hi || '',
        description_mr: initialData.description_mr || '',
        category_id: initialData.category?.id || initialData.category_id || '',
        base_price: initialData.base_price || 0,
        discount_percentage: initialData.discount_percentage || 0,
        stock_quantity: initialData.stock_quantity || 0,
        brand: initialData.brand || '',
        is_featured: initialData.is_featured || false,
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        is_new_arrival: initialData.is_new_arrival || false,
        images: initialData.images?.filter((img: any) => !img.image_url?.includes('video')).map((img: any) => img.image_url) || [],
        videos: initialData.images?.filter((img: any) => img.image_url?.includes('video')).map((img: any) => img.image_url) || [],
        variants: initialData.variants || [],
      })
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (productId) {
        await updateProduct.mutateAsync({
          id: productId,
          updates: formData,
        })
        alert('Product updated successfully!')
      } else {
        await createProduct.mutateAsync(formData)
        alert('Product created successfully!')
      }
      navigate('/admin/products')
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error saving product. Please try again.')
    }
  }

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { sku: '', color: '', size: '', stock_quantity: 0, additional_price: 0, image_url: '' }]
    }))
  }

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }))
  }

  const updateVariant = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => i === index ? { ...v, [field]: value } : v)
    }))
  }

  return (
      <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
        {/* Basic Information */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
              <Package className="w-5 h-5 text-purple-400" />
              Basic Information
            </h2>
            <button
              type="button"
              onClick={handleAutoTranslate}
              disabled={isTranslating || (!formData.name_en.trim() && !formData.description_en.trim())}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isTranslating ? (
                <>
                  <LoadingSpinner className="w-4 h-4 !border-white/30 !border-t-white" />
                  Translating...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Auto-Translate to Hindi & Marathi
                </>
              )}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Product Name (EN)</label>
              <input
                type="text"
                required
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-gray-600"
                placeholder="e.g. Premium Cotton Shirt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Product Name (HI)</label>
              <input
                type="text"
                value={formData.name_hi}
                onChange={(e) => setFormData({ ...formData, name_hi: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-gray-600"
                placeholder="उत्पाद का नाम"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Product Name (MR)</label>
              <input
                type="text"
                value={formData.name_mr}
                onChange={(e) => setFormData({ ...formData, name_mr: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-gray-600"
                placeholder="उत्पादनाचे नाव"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Description (EN)</label>
              <textarea
                rows={4}
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-gray-600"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Description (HI)</label>
              <textarea
                rows={4}
                value={formData.description_hi}
                onChange={(e) => setFormData({ ...formData, description_hi: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-gray-600"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Description (MR)</label>
              <textarea
                rows={4}
                value={formData.description_mr}
                onChange={(e) => setFormData({ ...formData, description_mr: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
            <DollarSign className="w-5 h-5 text-green-400" />
            Pricing & Inventory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Base Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">KD</span>
                <input
                  type="number"
                  required
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Discount Percentage</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">KD</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Available stock"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Category & Status */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
            <Tag className="w-5 h-5 text-blue-400" />
            Taxonomy & Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all [&>option]:bg-slate-900"
              >
                <option value="">Select Category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status Flags</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-600 bg-white/5 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900 transition-all"
                  />
                  <span className="text-gray-300 group-hover:text-white transition-colors">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-600 bg-white/5 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900 transition-all"
                  />
                  <span className="text-gray-300 group-hover:text-white transition-colors">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.is_new_arrival}
                    onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-600 bg-white/5 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900 transition-all"
                  />
                  <span className="text-gray-300 group-hover:text-white transition-colors">New Arrival</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
            <Image className="w-5 h-5 text-pink-400" />
            Product Images
          </h2>
          <p className="text-sm text-white/60 mb-4">Upload product images. First image will be the primary image.</p>
          <ImageUploader
            images={formData.images}
            onChange={(images) => setFormData({ ...formData, images })}
            acceptVideo={false}
            maxFiles={10}
          />
        </div>

        {/* Videos */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
            <Image className="w-5 h-5 text-blue-400" />
            Product Videos
          </h2>
          <p className="text-sm text-white/60 mb-4">Upload product videos to showcase your product.</p>
          <ImageUploader
            images={formData.videos}
            onChange={(videos) => setFormData({ ...formData, videos })}
            acceptVideo={true}
            maxFiles={3}
          />
        </div>

        {/* Variants */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
              <Layers className="w-5 h-5 text-yellow-400" />
              Variants
            </h2>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-400 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Variant
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.variants.map((variant, index) => (
              <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10 relative group">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">SKU</label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="SKU-123"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Color</label>
                    <select
                      value={variant.color}
                      onChange={(e) => updateVariant(index, 'color', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-slate-900"
                    >
                      <option value="">Select Color</option>
                      {defaultColors?.map((color: any) => (
                        <option key={color.id} value={color.name}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Size</label>
                    <select
                      value={variant.size}
                      onChange={(e) => updateVariant(index, 'size', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-slate-900"
                    >
                      <option value="">
                        {!formData.category_id ? 'Select category first' : defaultSizes?.length === 0 ? 'No sizes for this category' : 'Select Size'}
                      </option>
                      {defaultSizes?.map((size: any) => (
                        <option key={size.id} value={size.size_code}>
                          {size.size_label} ({size.size_code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Stock</label>
                    <input
                      type="number"
                      value={variant.stock_quantity}
                      onChange={(e) => updateVariant(index, 'stock_quantity', parseInt(e.target.value) || 0)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Additional Price (₹)</label>
                    <input
                      type="number"
                      value={variant.additional_price || 0}
                      onChange={(e) => updateVariant(index, 'additional_price', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">Variant Image</label>
                  <ImageUploader
                    images={variant.image_url ? [variant.image_url] : []}
                    onChange={(images) => updateVariant(index, 'image_url', images[0] || '')}
                    acceptVideo={false}
                    maxFiles={1}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2.5 rounded-xl border border-white/20 text-gray-300 font-medium hover:bg-white/5 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner className="w-5 h-5 !border-white/30 !border-t-white" />
                Saving...
              </span>
            ) : (
              'Save Product'
            )}
          </button>
        </div>
      </form>
  )
}
