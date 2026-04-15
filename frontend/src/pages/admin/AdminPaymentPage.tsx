import { useQuery } from '@tanstack/react-query';
import { paymentApi } from '../../api/endpoints/paymentApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { PaymentDTO } from '../../types';

export default function AdminPaymentPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const res = await paymentApi.getAll();
      return res.data.data as PaymentDTO[];
    },
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const payments = data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-muted">{payments.length} giao dịch</span>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-xs uppercase tracking-widest text-muted">
                <th className="text-left px-4 py-3">ID giao dịch</th>
                <th className="text-left px-4 py-3">Order ID</th>
                <th className="text-right px-4 py-3">Số tiền</th>
                <th className="text-center px-4 py-3">Trạng thái</th>
                <th className="text-left px-4 py-3">Ngày</th>
                <th className="text-left px-4 py-3">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((p: PaymentDTO) => (
                <tr key={p.id} className="hover:bg-surface transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted">{p.transactionId || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{p.orderId?.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-right font-bold text-accent">{formatPrice(p.amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-semibold px-2.5 py-1 ${p.status === 'SUCCESS' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                      {p.status === 'SUCCESS' ? 'Thành công' : 'Thất bại'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted max-w-[200px] truncate">{p.reason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && (
            <div className="text-center py-12 text-muted text-sm">Chưa có giao dịch nào</div>
          )}
        </div>
      )}
    </div>
  );
}