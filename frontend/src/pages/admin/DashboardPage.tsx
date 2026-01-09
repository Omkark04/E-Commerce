import { DollarSign, ShoppingCart, Users, Package, TrendingUp } from 'lucide-react'
import { useAdminDashboard } from '@/hooks/admin/useAdmin'
import StatsCard from '@/components/admin/StatsCard'
import SalesChart from '@/components/admin/SalesChart'
import RecentOrders from '@/components/admin/RecentOrders'
import LoadingSpinner from '@/components/LoadingSpinner'
import { formatCurrency } from '@/utils/formatters'

export default function DashboardPage() {
  const { data: stats, isLoading } = useAdminDashboard()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    )
  }



  // Revenue stats
  const totalRevenue = stats?.revenue?.total_revenue || 0

  // Assuming 'previous_month' revenue isn't available yet, using mock placeholder
  const revenueChange = 12 

  // Order stats
  const totalOrders = stats?.orders?.total_orders || 0

  const ordersChange = 8

  // Customer stats
  const totalCustomers = stats?.customers?.total_customers || 0
  const newCustomers = stats?.customers?.new_this_week || 0
  
  // Product stats
  const lowStockCount = stats?.low_stock_alerts?.length || 0

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-gray-400 mt-2">Welcome back to your store performance overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={totalRevenue}
          change={revenueChange}
          icon={DollarSign}
          type="currency"
          className="bg-white/5 border-white/10 backdrop-blur-md"
        />
        <StatsCard
          title="Total Orders"
          value={totalOrders}
          change={ordersChange}
          icon={ShoppingCart}
          type="number"
          className="bg-white/5 border-white/10 backdrop-blur-md"
        />
        <StatsCard
          title="Total Customers"
          value={totalCustomers}
          change={newCustomers} // Showing new customers count instead of %
          changeLabel="new this week"
          icon={Users}
          type="number"
          className="bg-white/5 border-white/10 backdrop-blur-md"
        />
        <StatsCard
          title="Low Stock Alerts"
          value={lowStockCount}
          icon={Package}
          type="number"
          variant={lowStockCount > 0 ? 'danger' : 'success'}
          className="bg-white/5 border-white/10 backdrop-blur-md"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Revenue Analytics</h2>
              <p className="text-sm text-gray-400">Weekly revenue performance</p>
            </div>
            <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <SalesChart data={stats?.revenue_graph || []} />
        </div>

        {/* Top Products */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl">
          <h2 className="text-lg font-bold text-white mb-6">Best Selling Products</h2>
          <div className="space-y-4">
            {stats?.best_sellers?.length > 0 ? (
              stats.best_sellers.map((product: any, index: number) => (
                <div key={product.product__id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center font-bold text-white shadow-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{product.product__name_en}</h3>
                    <p className="text-sm text-gray-400">{product.total_quantity} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-purple-300">{formatCurrency(product.total_revenue)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No sales data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Orders</h2>
            <p className="text-sm text-gray-400">Latest customer transactions</p>
          </div>
          <button className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors">
            View All Orders
          </button>
        </div>
        <RecentOrders />
      </div>
    </div>
  )
}
