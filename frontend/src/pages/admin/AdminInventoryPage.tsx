import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, X } from 'lucide-react';
import { inventoryApi } from '../../api/endpoints/inventoryApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { InventoryDTO, CreateInventoryRequest } from '../../types';

export default function AdminInventoryPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<InventoryDTO | null>(null);
  const [newQty, setNewQty] = useState(0);
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState<CreateInventoryRequest>({ productId: '', productName: '', quantity: 0 });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await inventoryApi.list();
      return res.data.data as InventoryDTO[];
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await inventoryApi.create(createForm);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setShowCreate(false);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      await inventoryApi.updateStock(editItem.productId, newQty);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setEditItem(null);
    } finally {
      setSaving(false);
    }
  };

  const items = data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-muted">{items.length} sản phẩm trong kho</span>
        <button onClick={() => setShowCreate(true)} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2">
          <Plus size={16} /> Khởi tạo tồn kho
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-bold">Khởi tạo tồn kho</h2>
              <button onClick={() => setShowCreate(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Product ID *</label>
                <input value={createForm.productId} onChange={e => setCreateForm(f => ({ ...f, productId: e.target.value }))} required className="input font-mono text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Tên sản phẩm *</label>
                <input value={createForm.productName} onChange={e => setCreateForm(f => ({ ...f, productName: e.target.value }))} required className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Số lượng ban đầu *</label>
                <input type="number" value={createForm.quantity} onChange={e => setCreateForm(f => ({ ...f, quantity: parseInt(e.target.value) }))} required min={0} className="input" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 text-sm">{saving ? '...' : 'Tạo'}</button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-outline flex-1 py-3 text-sm">Huỷ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update stock modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-xs shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-bold">Cập nhật tồn kho</h2>
              <button onClick={() => setEditItem(null)}><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm font-medium">{editItem.productName}</p>
              <p className="text-xs text-muted">Số lượng hiện tại: <strong>{editItem.quantity}</strong> | Còn lại: <strong>{editItem.available}</strong></p>
              <div>
                <label className="block text-sm font-medium mb-1.5">Số lượng mới *</label>
                <input type="number" value={newQty} onChange={e => setNewQty(parseInt(e.target.value))} min={0} className="input" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleUpdateStock} disabled={saving} className="btn-primary flex-1 py-3 text-sm">{saving ? '...' : 'Cập nhật'}</button>
                <button onClick={() => setEditItem(null)} className="btn-outline flex-1 py-3 text-sm">Huỷ</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-xs uppercase tracking-widest text-muted">
                <th className="text-left px-4 py-3">Sản phẩm</th>
                <th className="text-right px-4 py-3">Tổng</th>
                <th className="text-right px-4 py-3">Đã giữ</th>
                <th className="text-right px-4 py-3">Còn lại</th>
                <th className="text-center px-4 py-3">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item: InventoryDTO) => (
                <tr key={item.id} className="hover:bg-surface transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-muted font-mono">{item.productId.slice(0, 8)}...</p>
                  </td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-yellow-600">{item.reservedQuantity}</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">{item.available}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => { setEditItem(item); setNewQty(item.quantity); }} className="p-1.5 hover:text-accent transition-colors">
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="text-center py-12 text-muted text-sm">Kho hàng trống</div>
          )}
        </div>
      )}
    </div>
  );
}