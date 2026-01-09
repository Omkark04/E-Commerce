import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, Film } from 'lucide-react'
import { uploadAPI } from '@/lib/api'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  acceptVideo?: boolean
  maxFiles?: number
}

export default function ImageUploader({ 
  images, 
  onChange, 
  acceptVideo = false,
  maxFiles = 5 
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length >= maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    const remainingSlots = maxFiles - images.length
    const filesToUpload = acceptedFiles.slice(0, remainingSlots)

    setUploading(true)
    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await uploadAPI.upload(formData)
        return response.data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      onChange([...images, ...uploadedUrls])
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload files. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [images, onChange, maxFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptVideo ? {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov']
    } : {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: true,
  })

  const isVideo = (url: string) => {
    return url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') || url.includes('video')
  }

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const handleSetPrimary = (index: number) => {
    const reordered = [...images]
    const [primary] = reordered.splice(index, 1)
    reordered.unshift(primary)
    onChange(reordered)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
        <p className="text-sm text-gray-500">First image will be the primary image</p>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-primary-600 font-medium">Drop images here...</p>
        ) : (
          <div>
            <p className="text-gray-600 font-medium mb-1">
              Drag & drop images here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG, JPEG, WEBP (Max 5MB each)
            </p>
          </div>
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                {isVideo(image) ? (
                  <>
                    <video
                      src={image}
                      className="w-full h-full object-cover"
                      controls={false}
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded flex items-center gap-1">
                      <Film className="w-3 h-3" />
                      Video
                    </div>
                  </>
                ) : (
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              {/* Primary Badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-primary-600 text-white text-xs font-semibold rounded">
                  Primary
                </div>
              )}

              {/* Actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(index)}
                    className="px-3 py-1 bg-white text-gray-900 text-sm rounded hover:bg-gray-100"
                  >
                    Set Primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">No images uploaded yet</p>
        </div>
      )}

      {uploading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
          <p className="text-sm text-gray-600 mt-2">Uploading images...</p>
        </div>
      )}
    </div>
  )
}
