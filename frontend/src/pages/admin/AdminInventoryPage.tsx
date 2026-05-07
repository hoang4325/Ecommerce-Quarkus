import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Warehouse, X } from 'lucide-react';
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
  const totalAvailable = items.reduce((sum, item) => sum + item.available, 0);
  const totalReserved = items.reduce((sum, item) => sum + item.reservedQuantity, 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-black/10 bg-white p-5">
          <p className="text-sm font-medium text-black/50">Tracked SKUs</p>
          <p className="mt-3 text-3xl font-black text-primary">{items.length}</p>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-5">
          <p className="text-sm font-medium text-black/50">Available Units</p>
          <p className="mt-3 text-3xl font-black text-primary">{totalAvailable}</p>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-5">
          <p className="text-sm font-medium text-black/50">Reserved Units</p>
          <p className="mt-3 text-3xl font-black text-primary">{totalReserved}</p>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-black/10 bg-white p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white"><Warehouse size={20} /></span>
          <div>
            <h2 className="text-xl font-bold text-primary">Inventory Control</h2>
            <p className="text-sm text-black/50">Initialize and update product stock levels.</p>
          </div>
        </div>
        <button type="button" onClick={() => setShowCreate(true)} className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-white">
          <Plus size={17} /> Initialize stock
        </button>
      </section>

      {(showCreate || editItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/10 p-6">
              <h2 className="text-xl font-bold text-primary">{editItem ? 'Update Stock' : 'Initialize Stock'}</h2>
              <button type="button" onClick={() => { setShowCreate(false); setEditItem(null); }}><X size={22} /></button>
            </div>
            {editItem ? (
              <div className="space-y-4 p-6">
                <div className="rounded-lg bg-[#F7F7F7] p-4">
                  <p className="font-bold text-primary">{editItem.productName}</p>
                  <p className="mt-1 text-xs text-black/50">Current: {editItem.quantity} | Reserved: {editItem.reservedQuantity} | Available: {editItem.available}</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-primary">New quantity</label>
                  <input type="number" value={newQty} onChange={e => setNewQty(parseInt(e.target.value))} min={0} className="h-12 w-full rounded-full bg-[#F0F0F0] px-5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={handleUpdateStock} disabled={saving} className="h-12 flex-1 rounded-full bg-primary text-sm font-medium text-white disabled:opacity-50">{saving ? 'Updating...' : 'Update'}</button>
                  <button type="button" onClick={() => setEditItem(null)} className="h-12 flex-1 rounded-full border border-black/10 text-sm font-medium">Cancel</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4 p-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-primary">Product ID</label>
                  <input value={createForm.productId} onChange={e => setCreateForm(f => ({ ...f, productId: e.target.value }))} required className="h-12 w-full rounded-full bg-[#F0F0F0] px-5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-primary">Product name</label>
                  <input value={createForm.productName} onChange={e => setCreateForm(f => ({ ...f, productName: e.target.value }))} required className="h-12 w-full rounded-full bg-[#F0F0F0] px-5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-primary">Initial quantity</label>
                  <input type="number" value={createForm.quantity} onChange={e => setCreateForm(f => ({ ...f, quantity: parseInt(e.target.value) }))} required min={0} className="h-12 w-full rounded-full bg-[#F0F0F0] px-5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="h-12 flex-1 rounded-full bg-primary text-sm font-medium text-white disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button>
                  <button type="button" onClick={() => setShowCreate(false)} className="h-12 flex-1 rounded-full border border-black/10 text-sm font-medium">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F7F7F7] text-xs uppercase tracking-[0.18em] text-black/45">
                <tr>
                  <th className="px-5 py-4 text-left">Product</th>
                  <th className="px-5 py-4 text-right">Total</th>
                  <th className="px-5 py-4 text-right">Reserved</th>
                  <th className="px-5 py-4 text-right">Available</th>
                  <th className="px-5 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-[#F7F7F7]">
                    <td className="px-5 py-4">
                      <p className="font-bold text-primary">{item.productName}</p>
                      <p className="mt-1 font-mono text-xs text-black/45">{item.productId.slice(0, 8)}...</p>
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-primary">{item.quantity}</td>
                    <td className="px-5 py-4 text-right font-medium text-amber-600">{item.reservedQuantity}</td>
                    <td className="px-5 py-4 text-right font-bold text-green-700">{item.available}</td>
                    <td className="px-5 py-4 text-center">
                      <button type="button" onClick={() => { setEditItem(item); setNewQty(item.quantity); }} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 transition-colors hover:border-primary">
                        <Pencil size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && <div className="py-12 text-center text-sm text-black/50">Inventory is empty.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
