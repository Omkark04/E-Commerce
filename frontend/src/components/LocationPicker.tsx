import { useState, useEffect } from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'

interface LocationPickerProps {
  onLocationSelect: (addressData: {
    lat: number
    lng: number
    address_line1: string
    address_line2: string
    city: string
    state: string
    pincode: string
  }) => void
  initialLat?: number
  initialLng?: number
}

const mapContainerStyle = {
  width: '100%',
  height: '300px',
}

const defaultCenter = {
  lat: 19.0760, // Mumbai
  lng: 72.8777,
}

export default function LocationPicker({ 
  onLocationSelect, 
  initialLat, 
  initialLng 
}: LocationPickerProps) {
  const [markerPosition, setMarkerPosition] = useState({
    lat: initialLat || defaultCenter.lat,
    lng: initialLng || defaultCenter.lng,
  })
  const [mapCenter, setMapCenter] = useState({
    lat: initialLat || defaultCenter.lat,
    lng: initialLng || defaultCenter.lng,
  })
  const [showLocationPrompt, setShowLocationPrompt] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  })

  // Auto-detect location on component mount
  useEffect(() => {
    if (isLoaded && !initialLat && !initialLng) {
      checkAndGetLocation()
    } else {
      setIsLoadingLocation(false)
    }
  }, [isLoaded, initialLat, initialLng])

  const checkAndGetLocation = () => {
    if (!navigator.geolocation) {
      setShowLocationPrompt(true)
      setIsLoadingLocation(false)
      return
    }

    // Check if location permission is granted
    navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'denied') {
        setShowLocationPrompt(true)
        setIsLoadingLocation(false)
      } else {
        getCurrentLocationAndCenter()
      }
    }).catch(() => {
      // Fallback if permissions API not supported
      getCurrentLocationAndCenter()
    })
  }

  const getCurrentLocationAndCenter = () => {
    setIsLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        
        setMarkerPosition({ lat, lng })
        setMapCenter({ lat, lng })
        setIsLoadingLocation(false)

        // Auto-fill address for current location
        try {
          const geocoder = new google.maps.Geocoder()
          const result = await geocoder.geocode({ location: { lat, lng } })
          
          if (result.results[0]) {
            parseAndFillAddress(lat, lng, result.results[0].address_components)
          }
        } catch (error) {
          console.error('Geocoding error:', error)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        setShowLocationPrompt(true)
        setIsLoadingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const parseAndFillAddress = (lat: number, lng: number, addressComponents: google.maps.GeocoderAddressComponent[]) => {
    let street = ''
    let area = ''
    let city = ''
    let state = ''
    let pincode = ''
    
    addressComponents.forEach((component) => {
      const types = component.types
      
      if (types.includes('street_number') || types.includes('premise')) {
        street = component.long_name
      } else if (types.includes('route') || types.includes('sublocality_level_2') || types.includes('sublocality_level_1')) {
        area = area ? `${area}, ${component.long_name}` : component.long_name
      } else if (types.includes('locality')) {
        city = component.long_name
      } else if (types.includes('administrative_area_level_1')) {
        state = component.long_name
      } else if (types.includes('postal_code')) {
        pincode = component.long_name
      }
    })
    
    const address_line1 = street || area.split(',')[0] || ''
    const address_line2 = street ? area : (area.split(',').slice(1).join(',') || '')
    
    onLocationSelect({
      lat,
      lng,
      address_line1: address_line1.trim(),
      address_line2: address_line2.trim(),
      city: city || '',
      state: state || '',
      pincode: pincode || '',
    })
  }

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return

    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    
    setMarkerPosition({ lat, lng })

    // Reverse geocode to get address
    try {
      const geocoder = new google.maps.Geocoder()
      const result = await geocoder.geocode({ location: { lat, lng } })
      
      if (result.results[0]) {
        parseAndFillAddress(lat, lng, result.results[0].address_components)
      } else {
        onLocationSelect({
          lat,
          lng,
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          pincode: '',
        })
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      onLocationSelect({
        lat,
        lng,
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
      })
    }
  }

  const handleGetCurrentLocation = () => {
    getCurrentLocationAndCenter()
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Location Permission Prompt */}
      {showLocationPrompt && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-yellow-800">Location Access Required</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Please enable location services in your browser settings to automatically detect your current location.
                You can also manually select your location on the map below.
              </p>
              <button
                onClick={() => {
                  setShowLocationPrompt(false)
                  getCurrentLocationAndCenter()
                }}
                className="mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {isLoadingLocation ? 'Detecting your location...' : 'Click on the map to select location'}
        </p>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLoadingLocation}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:text-gray-400"
        >
          {isLoadingLocation ? 'Locating...' : 'Use Current Location'}
        </button>
      </div>
      
      <div className="rounded-lg overflow-hidden border border-gray-300 relative">
        {isLoadingLocation && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Getting your location...</p>
            </div>
          </div>
        )}
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={15}
          onClick={handleMapClick}
        >
          <Marker position={markerPosition} />
        </GoogleMap>
      </div>
    </div>
  )
}
