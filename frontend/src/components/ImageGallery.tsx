import { useState } from 'react'
import { ZoomIn } from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
  productName: string
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  // Use placeholder if no images
  const displayImages = images.length > 0 
    ? images 
    : ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="800"%3E%3Crect width="600" height="800" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E']

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden group">
        <img
          src={displayImages[selectedImage]}
          alt={`${productName} - Image ${selectedImage + 1}`}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        />
        
        {/* Zoom Icon */}
        {!isZoomed && (
          <div className="absolute top-4 right-4 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition">
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                selectedImage === index
                  ? 'border-primary-600'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <img
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
