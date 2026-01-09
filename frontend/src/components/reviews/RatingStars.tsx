import { FiStar } from 'react-icons/fi'
import { FaStar, FaStarHalfAlt } from 'react-icons/fa'

interface RatingStarsProps {
  rating: number
  maxRating?: number
  size?: number
  showNumber?: boolean
  interactive?: boolean
  onRatingChange?: (rating: number) => void
}

export default function RatingStars({
  rating,
  maxRating = 5,
  size = 16,
  showNumber = false,
  interactive = false,
  onRatingChange
}: RatingStarsProps) {
  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value)
    }
  }

  const renderStar = (index: number) => {
    const value = index + 1
    const filled = rating >= value
    const halfFilled = rating >= value - 0.5 && rating < value

    if (filled) {
      return (
        <FaStar
          key={index}
          size={size}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''} text-yellow-400`}
          onClick={() => handleClick(value)}
        />
      )
    } else if (halfFilled) {
      return (
        <FaStarHalfAlt
          key={index}
          size={size}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''} text-yellow-400`}
          onClick={() => handleClick(value)}
        />
      )
    } else {
      return (
        <FiStar
          key={index}
          size={size}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''} text-gray-300`}
          onClick={() => handleClick(value)}
        />
      )
    }
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => renderStar(i))}
      </div>
      {showNumber && (
        <span className="text-sm font-semibold text-gray-700 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
