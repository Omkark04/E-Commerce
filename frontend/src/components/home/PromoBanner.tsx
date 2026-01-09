import { Tag } from 'lucide-react'

export default function PromoBanner() {
  return (
    <div className="relative my-8">
      {/* Decorative Zigzag Edges */}
      <div className="relative bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-2xl overflow-hidden">
        {/* Top Zigzag */}
        <div className="absolute top-0 left-0 right-0 h-4">
          <svg viewBox="0 0 1200 20" className="w-full h-full">
            <path d="M0 20 L20 0 L40 20 L60 0 L80 20 L100 0 L120 20 L140 0 L160 20 L180 0 L200 20 L220 0 L240 20 L260 0 L280 20 L300 0 L320 20 L340 0 L360 20 L380 0 L400 20 L420 0 L440 20 L460 0 L480 20 L500 0 L520 20 L540 0 L560 20 L580 0 L600 20 L620 0 L640 20 L660 0 L680 20 L700 0 L720 20 L740 0 L760 20 L780 0 L800 20 L820 0 L840 20 L860 0 L880 20 L900 0 L920 20 L940 0 L960 20 L980 0 L1000 20 L1020 0 L1040 20 L1060 0 L1080 20 L1100 0 L1120 20 L1140 0 L1160 20 L1180 0 L1200 20 L1200 20 L0 20 Z" fill="white" />
          </svg>
        </div>

        {/* Bottom Zigzag */}
        <div className="absolute bottom-0 left-0 right-0 h-4">
          <svg viewBox="0 0 1200 20" className="w-full h-full">
            <path d="M0 0 L20 20 L40 0 L60 20 L80 0 L100 20 L120 0 L140 20 L160 0 L180 20 L200 0 L220 20 L240 0 L260 20 L280 0 L300 20 L320 0 L340 20 L360 0 L380 20 L400 0 L420 20 L440 0 L460 20 L480 0 L500 20 L520 0 L540 20 L560 0 L580 20 L600 0 L620 20 L640 0 L660 20 L680 0 L700 20 L720 0 L740 20 L760 0 L780 20 L800 0 L820 20 L840 0 L860 20 L880 0 L900 20 L920 0 L940 20 L960 0 L980 20 L1000 0 L1020 20 L1040 0 L1060 20 L1080 0 L1100 20 L1120 0 L1140 20 L1160 0 L1180 20 L1200 0 L1200 0 L0 0 Z" fill="white" />
          </svg>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left Side - Offer Text */}
            <div className="flex items-center gap-3">
              <Tag className="w-8 h-8 text-white" />
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  FLAT ₹500 OFF*
                </h3>
                <p className="text-sm text-white/90">On your first purchase</p>
              </div>
            </div>

            {/* Right Side - Coupon Code */}
            <div className="flex flex-col items-center md:items-end gap-2">
              <span className="text-sm font-medium text-white/90">USE CODE:</span>
              <div className="px-6 py-3 bg-white rounded-lg shadow-lg">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600 tracking-wider">
                  TENZ500
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
