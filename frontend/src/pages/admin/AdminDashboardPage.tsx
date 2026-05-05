import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderAdminApi } from '../../api/endpoints/orderApi';
import { productApi, categoryApi } from '../../api/endpoints/productApi';
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Tag
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  colorClass: string;
}) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 ${colorClass}`}></div>
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
    
    {trend && (
      <div className="mt-4 flex items-center gap-2 text-sm">
        <span className={`flex items-center ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'} font-medium`}>
          {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {trendValue}
        </span>
        <span className="text-gray-400">vs tháng trước</span>
      </div>
    )}
  </div>
);

export default function AdminDashboardPage() {
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['admin-orders', { page: 0, size: 100 }],
    queryFn: () => orderAdminApi.list({ page: 0, size: 100 }).then(r => r.data.data)
  });

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['admin-products', { page: 0, size: 1 }],
    queryFn: () => productApi.list({ page: 0, size: 1 }).then(r => r.data.data)
  });

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => categoryApi.list().then(r => r.data.data)
  });

  if (isLoadingOrders || isLoadingProducts || isLoadingCategories) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const orders = ordersData?.content || [];
  const totalOrders = ordersData?.totalElements || 0;
  const totalProducts = productsData?.totalElements || 0;
  const totalCategories = categoriesData?.length || 0;

  // Calculate total revenue from confirmed/completed orders
  const revenue = orders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tổng quan hệ thống</h1>
          <p className="text-gray-500 mt-1">Theo dõi hoạt động kinh doanh và hiệu suất cửa hàng</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
            <Activity size={16} />
            Báo cáo chi tiết
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng doanh thu" 
          value={`$${revenue.toFixed(2)}`}
          icon={DollarSign}
          trend="up"
          trendValue="+12.5%"
          colorClass="bg-emerald-500"
        />
        <StatCard 
          title="Tổng đơn hàng" 
          value={totalOrders}
          icon={ShoppingCart}
          trend="up"
          trendValue="+5.2%"
          colorClass="bg-blue-500"
        />
        <StatCard 
          title="Sản phẩm" 
          value={totalProducts}
          icon={Package}
          colorClass="bg-indigo-500"
        />
        <StatCard 
          title="Khách hàng" 
          value="1,248"
          icon={Users}
          trend="up"
          trendValue="+18.2%"
          colorClass="bg-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Chart / Table placeholder */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg text-gray-900">Đơn hàng cần xử lý ({pendingOrders})</h3>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Xem tất cả</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Mã đơn</th>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">Ngày đặt</th>
                  <th className="px-4 py-3 text-right rounded-tr-lg">Giá trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.filter(o => o.status === 'PENDING').slice(0, 5).map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">#{order.id.slice(-6).toUpperCase()}</td>
                    <td className="px-4 py-3">{order.userId.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">${order.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}
                {pendingOrders === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      Không có đơn hàng nào đang chờ xử lý
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats or Categories */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-lg text-gray-900 mb-6">Trạng thái hệ thống</h3>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Tag size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Danh mục sản phẩm</p>
                <div className="flex items-end justify-between mt-1">
                  <span className="text-xl font-bold text-gray-900">{totalCategories}</span>
                  <span className="text-xs text-emerald-500 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">Đang hoạt động</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                <TrendingUp size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Tỷ lệ chuyển đổi</p>
                <div className="flex items-end justify-between mt-1">
                  <span className="text-xl font-bold text-gray-900">3.8%</span>
                  <span className="text-xs text-emerald-500 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">+0.4%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Activity size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Sức khỏe Server</p>
                <div className="flex items-end justify-between mt-1">
                  <span className="text-xl font-bold text-gray-900">Tốt</span>
                  <span className="text-xs text-emerald-500 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">99.9% Uptime</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <button className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors">
              Kiểm tra toàn bộ hệ thống
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
