import { useQuery } from '@tanstack/react-query';
import { CreditCard } from 'lucide-react';
import { paymentApi } from '../../api/endpoints/paymentApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { PaymentDTO } from '../../types';

const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')} đ`;

export default function AdminPaymentPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const res = await paymentApi.getAll();
      return res.data.data as PaymentDTO[];
    },
  });

  const payments = data ?? [];
  const totalVolume = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-black/10 bg-white p-5">
          <p className="text-sm font-medium text-black/50">Transactions</p>
          <p className="mt-3 text-3xl font-black text-primary">{payments.length}</p>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-5">
          <p className="text-sm font-medium text-black/50">Payment Volume</p>
          <p className="mt-3 text-3xl font-black text-primary">{formatPrice(totalVolume)}</p>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-5">
          <p className="text-sm font-medium text-black/50">Successful</p>
          <p className="mt-3 text-3xl font-black text-primary">{payments.filter(p => p.status === 'SUCCESS').length}</p>
        </div>
      </section>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
          <div className="flex items-center gap-3 border-b border-black/10 p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
              <CreditCard size={20} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-primary">Payment Ledger</h2>
              <p className="text-sm text-black/50">Track transaction status and payment references.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F7F7F7] text-xs uppercase tracking-[0.18em] text-black/45">
                <tr>
                  <th className="px-5 py-4 text-left">Transaction</th>
                  <th className="px-5 py-4 text-left">Order</th>
                  <th className="px-5 py-4 text-right">Amount</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-left">Date</th>
                  <th className="px-5 py-4 text-left">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-[#F7F7F7]">
                    <td className="px-5 py-4 font-mono text-xs text-black/55">{payment.transactionId || 'Pending'}</td>
                    <td className="px-5 py-4 font-mono text-xs text-black/55">{payment.orderId?.slice(0, 8)}...</td>
                    <td className="px-5 py-4 text-right font-bold text-primary">{formatPrice(payment.amount)}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${payment.status === 'SUCCESS' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {payment.status === 'SUCCESS' ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-black/55">{new Date(payment.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
                    <td className="max-w-[240px] truncate px-5 py-4 text-xs text-black/55">{payment.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payments.length === 0 && <div className="py-12 text-center text-sm text-black/50">No transactions yet.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
