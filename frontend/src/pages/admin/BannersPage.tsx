import { useState } from 'react'
import { Plus, Image as ImageIcon, Calendar, Edit2, Trash2, Eye, EyeOff, X, Upload } from 'lucide-react'
import { useAdminBanners, useCreateBanner } from '@/hooks/admin/useAdmin'
import LoadingSpinner from '@/components/LoadingSpinner'
import { format } from 'date-fns'
import { uploadImage } from '../../utils/imageUpload'

const positions = {
  hero: 'Hero Slider',
  sidebar: 'Sidebar',
  popup: 'Popup Modal',
  middle: 'Middle Section',
  bottom: 'Bottom Section'
}

interface CreateBannerModalProps {
  isOpen: boolean
  onClose: () => void
}

function CreateBannerModal({ isOpen, onClose }: CreateBannerModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [position, setPosition] = useState('hero')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  const createBanner = useCreateBanner()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile) {
      alert('Please select an image')
      return
    }

    try {
      setIsUploading(true)
      const imageUrl = await uploadImage(imageFile)
      
      await createBanner.mutateAsync({
        title,
        description,
        image_url: imageUrl,
        link,
        position,
        is_active: true
      })
      
      onClose()
      setTitle('')
      setDescription('')
      setLink('')
      setImageFile(null)
    } catch (error) {
      console.error('Error creating banner:', error)
      alert('Failed to create banner')
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Create New Banner</h3>
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
            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 h-20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                {Object.entries(positions).map(([key, label]) => (
                  <option key={key} value={key} className="bg-slate-900">{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Link (Optional)</label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                placeholder="/products/..."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Banner Image</label>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {imageFile ? (
                <div className="text-sm text-purple-400 font-medium">{imageFile.name}</div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <Upload className="w-8 h-8" />
                  <span>Click to upload image</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={createBanner.isPending || isUploading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors mt-4"
          >
            {createBanner.isPending || isUploading ? 'Creating...' : 'Create Banner'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function BannersPage() {
  const { data: banners, isLoading } = useAdminBanners()
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
          <h1 className="text-2xl font-bold text-white">Banners</h1>
          <p className="text-gray-400">Manage marketing banners and sliders</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors shadow-lg shadow-purple-600/25"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Array.isArray(banners) ? banners : []).map((banner: any) => (
          <div key={banner.id} className="group relative rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all backdrop-blur-md overflow-hidden">
            {/* Image Preview */}
            <div className="relative aspect-video bg-gray-900 border-b border-white/10">
              {banner.image_url ? (
                <img 
                  src={banner.image_url} 
                  alt={banner.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ImageIcon className="w-12 h-12 text-gray-700" />
                </div>
              )}
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button className="p-2 rounded-xl bg-white/10 hover:bg-purple-500 text-white transition-colors backdrop-blur">
                  <Edit2 className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-xl bg-white/10 hover:bg-red-500 text-white transition-colors backdrop-blur">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Status Badge */}
              <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg border backdrop-blur text-xs font-medium flex items-center gap-1.5 ${
                banner.is_active 
                  ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                  : 'bg-gray-500/20 border-gray-500/30 text-gray-400'
              }`}>
                {banner.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {banner.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-white line-clamp-1">{banner.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{banner.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 text-xs text-gray-500">
                <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                  {positions[banner.position as keyof typeof positions] || banner.position}
                </div>
                {banner.start_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(banner.start_date), 'MMM d')}
                    {banner.end_date && ` - ${format(new Date(banner.end_date), 'MMM d')}`}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add New Card */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-gray-500 hover:text-purple-400 min-h-[300px]"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 group-hover:bg-purple-500/20 flex items-center justify-center mb-4 transition-colors">
            <Plus className="w-8 h-8" />
          </div>
          <span className="font-medium text-lg">Create New Banner</span>
          <p className="text-sm text-gray-500 mt-2">Hero sliders, sales popups, etc.</p>
        </button>
      </div>

      <CreateBannerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
