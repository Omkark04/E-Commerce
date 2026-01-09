import { useState } from 'react'
import { Percent, Tag, Zap, Search, AlertCircle, Plus, Trash2, Calendar, X } from 'lucide-react'
import { useCategories } from '../../hooks/useCategories'
import { useBulkDiscount, useCoupons, useFlashSales, useCreateCoupon, useCreateFlashSale, useDeleteCoupon, useDeleteFlashSale } from '../../hooks/admin/useDiscounts'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatDate } from '../../utils/formatters'

interface CreateCouponModalProps {
  isOpen: boolean
  onClose: () => void
}

function CreateCouponModal({ isOpen, onClose }: CreateCouponModalProps) {
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState('percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  
  const createCoupon = useCreateCoupon()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createCoupon.mutateAsync({
        code,
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        valid_until: validUntil,
        usage_limit: usageLimit ? parseInt(usageLimit) : null,
        is_active: true
      })
      onClose()
      setCode('')
      setDiscountValue('')
      setValidUntil('')
      setUsageLimit('')
    } catch (error) {
      console.error('Error creating coupon:', error)
      alert('Failed to create coupon')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Create Coupon</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Coupon Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 font-mono"
              placeholder="e.g. SUMMER25"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 [&>option]:bg-slate-900"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Value</label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                placeholder="20"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Valid Until</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Limit (Optional)</label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                placeholder="Total uses"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={createCoupon.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors mt-4"
          >
            {createCoupon.isPending ? 'Creating...' : 'Create Coupon'}
          </button>
        </form>
      </div>
    </div>
  )
}

interface CreateFlashSaleModalProps {
  isOpen: boolean
  onClose: () => void
}

function CreateFlashSaleModal({ isOpen, onClose }: CreateFlashSaleModalProps) {
  const [name, setName] = useState('')
  const [discountPercentage, setDiscountPercentage] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  
  const createSale = useCreateFlashSale()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createSale.mutateAsync({
        name_en: name,
        discount_percentage: parseFloat(discountPercentage),
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        is_active: true
      })
      onClose()
      setName('')
      setDiscountPercentage('')
      setStartTime('')
      setEndTime('')
    } catch (error) {
      console.error('Error creating flash sale:', error)
      alert('Failed to create flash sale')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Create Flash Sale</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Sale Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="e.g. Midnight Sale"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Discount Percentage</label>
            <div className="relative">
              <input
                type="number"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                placeholder="50"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Start Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">End Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={createSale.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors mt-4"
          >
            {createSale.isPending ? 'Creating...' : 'Create Sale'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function DiscountsManagementPage() {
  const [activeTab, setActiveTab] = useState<'bulk' | 'coupons' | 'flash'>('bulk')

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Discounts & Offers</h1>
        <p className="text-gray-400 mt-1">Manage bulk discounts, coupons, and flash sales.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-6 overflow-x-auto">
        <button
          className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'bulk'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          onClick={() => setActiveTab('bulk')}
        >
          <Percent className="w-4 h-4" />
          Bulk Discounts
        </button>
        <button
          className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'coupons'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          onClick={() => setActiveTab('coupons')}
        >
          <Tag className="w-4 h-4" />
          Coupons
        </button>
        <button
          className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'flash'
              ? 'border-purple-500 text-purple-400 bg-purple-500/10'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          onClick={() => setActiveTab('flash')}
        >
          <Zap className="w-4 h-4" />
          Flash Sales
        </button>
      </div>

      {/* Content */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
        {activeTab === 'bulk' && <BulkDiscountsTab />}
        {activeTab === 'coupons' && <CouponsTab />}
        {activeTab === 'flash' && <FlashSalesTab />}
      </div>
    </div>
  )
}

function BulkDiscountsTab() {
  const { data: categories } = useCategories()
  const bulkDiscount = useBulkDiscount()

  const [categoryId, setCategoryId] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [discountPercent, setDiscountPercent] = useState('')
  const [searchText, setSearchText] = useState('')

  const handleApply = async () => {
    if (!discountPercent) {
      alert('Please enter a discount percentage')
      return
    }

    if (confirm('Are you sure you want to apply this discount? This will update all matching products.')) {
      try {
        await bulkDiscount.mutateAsync({
          discountPercentage: parseInt(discountPercent),
          categoryId: categoryId || null,
          minPrice: minPrice ? parseFloat(minPrice) : null,
          maxPrice: maxPrice ? parseFloat(maxPrice) : null,
          searchText: searchText || null,
        })
        alert('Discounts applied successfully!')
        setCategoryId('')
        setMinPrice('')
        setMaxPrice('')
        setDiscountPercent('')
        setSearchText('')
      } catch (error: any) {
        alert('Failed to apply discounts: ' + error.message)
      }
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl mb-6 flex items-start gap-3 text-purple-300">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold mb-1 text-purple-200">How Bulk Discounts Work</p>
          <p className="opacity-80">
            This tool updates the discount percentage for all active products matching your criteria.
            Set criteria to narrow down which products to update. Leave criteria empty to apply to more products.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-slate-900"
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name_en}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Min Price</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Max Price</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="No limit"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-400 mb-1">Product Name Contains</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="e.g. Shirt"
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 mt-6">
          <label className="block text-sm font-bold text-white mb-2">New Discount %</label>
          <div className="flex gap-4 items-end">
            <div className="flex-1 relative">
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2 bg-white/5 border border-purple-500/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold text-lg"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
            </div>
            <button
              onClick={handleApply}
              disabled={bulkDiscount.isPending}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-lg shadow-purple-600/25"
            >
              {bulkDiscount.isPending ? 'Applying...' : 'Apply Discount'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CouponsTab() {
  const { data: coupons, isLoading } = useCoupons()
  const deleteCoupon = useDeleteCoupon()
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (isLoading) return <div className="p-12 flex justify-center"><LoadingSpinner /></div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Active Coupons</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium transition-colors shadow-lg shadow-purple-600/25"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>
      
      {coupons && coupons.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-400">Code</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Discount</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Valid Until</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Usage</th>
                <th className="p-4 text-sm font-semibold text-gray-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-white/5">
              {coupons.map((coupon: any) => (
                <tr key={coupon.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono font-bold text-purple-400">{coupon.code}</td>
                  <td className="p-4 text-white">
                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${
                      coupon.is_active 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">{formatDate(coupon.valid_until)}</td>
                  <td className="p-4 text-sm text-gray-400">{coupon.used_count || 0}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ''}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => {
                        if(confirm('Delete coupon?')) deleteCoupon.mutate(coupon.id)
                      }}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-gray-400 py-12 text-center bg-white/5 rounded-xl border border-white/10 border-dashed">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No coupons found. Create some to get started!</p>
        </div>
      )}
      <CreateCouponModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

function FlashSalesTab() {
  const { data: sales, isLoading } = useFlashSales()
  const deleteSale = useDeleteFlashSale()
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (isLoading) return <div className="p-12 flex justify-center"><LoadingSpinner /></div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Flash Sales</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium transition-colors shadow-lg shadow-purple-600/25"
        >
          <Plus className="w-4 h-4" />
          Create Flash Sale
        </button>
      </div>

      {sales && sales.length > 0 ? (
        <div className="space-y-4">
          {sales.map((sale: any) => (
            <div key={sale.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex justify-between items-center hover:border-purple-500/30 transition-all backdrop-blur-md">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold text-lg text-white">{sale.name_en}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                    sale.is_active 
                      ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                      : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                  }`}>
                    {sale.is_active ? 'Active' : 'Ended'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="text-purple-400 font-bold">{sale.discount_percentage}% OFF</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(sale.start_time)} - {formatDate(sale.end_time)}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  if(confirm('End/Delete flash sale?')) deleteSale.mutate(sale.id)
                }}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 py-12 text-center bg-white/5 rounded-xl border border-white/10 border-dashed">
          <Zap className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No active flash sales.</p>
        </div>
      )}
      <CreateFlashSaleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
