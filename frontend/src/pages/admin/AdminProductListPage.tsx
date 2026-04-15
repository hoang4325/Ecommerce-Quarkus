import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Check, Search } from 'lucide-react';
import { productApi, categoryApi } from '../../api/endpoints/productApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import type { ProductDTO, CreateProductRequest, CategoryDTO } from '../../types';

const PAGE_SIZE = 10;

export default function AdminProductListPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductDTO | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const [form, setForm] = useState<CreateProductRequest>({ name: '', slug: '', price: 0 });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: async () => {
      const res = await productApi.list({ page, size: PAGE_SIZE, search: search || undefined });
      return res.data.data;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoryApi.list();
      return res.data.data as CategoryDTO[];
    },
    staleTime: 300000,
  });

  const products: ProductDTO[] = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const categories: CategoryDTO[] = categoriesData ?? [];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const openCreate = () => {
    setEditProduct(null);
    setForm({ name: '', slug: '', price: 0 });
    setShowForm(true);
  };

  const openEdit = (p: ProductDTO) => {
    setEditProduct(p);
    setForm({ name: p.name, slug: p.slug, description: p.description, price: p.price, imageUrl: p.imageUrl, categoryId: p.categoryId });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editProduct) {
        await productApi.update(editProduct.id, form);
      } else {
        await productApi.create(form);
      }
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá sản phẩm này?')) return;
    setDeletingId(id);
    try {
      await productApi.delete(id);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    } finally {
      setDeletingId(null);
    }
  };

  const autoSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-6">
        <form onSubmit={e => { e.preventDefault(); setSearch(searchInput); setPage(0); }} className="flex gap-2 flex-1 max-w-sm">
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Tìm sản phẩm..."
            className="border border-border px-4 py-2.5 text-sm flex-1 focus:outline-none focus:border-primary"
          />
          <button type="submit" className="btn-outline px-4 py-2.5"><Search size={14} /></button>
        </form>
        <button onClick={openCreate} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2 ml-auto">
          <Plus size={16} /> Thêm sản phẩm
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-bold text-lg">{editProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Tên sản phẩm *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: autoSlug(e.target.value) }))}
                  required
                  className="input"
                  placeholder="Áo thun basic nam"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Slug *</label>
                <input
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  required
                  className="input font-mono text-sm"
                  placeholder="ao-thun-basic-nam"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Giá (VND) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))}
                  required
                  min={0.01}
                  step={1000}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Danh mục</label>
                <select
                  value={form.categoryId ?? ''}
                  onChange={e => setForm(f => ({ ...f, categoryId: e.target.value || undefined }))}
                  className="input"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">URL ảnh</label>
                <input
                  value={form.imageUrl ?? ''}
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  className="input"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Mô tả</label>
                <textarea
                  value={form.description ?? ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="input resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 text-sm">
                  {saving ? 'Đang lưu...' : (editProduct ? 'Cập nhật' : 'Tạo mới')}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 py-3 text-sm">
                  Huỷ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-xs uppercase tracking-widest text-muted">
                <th className="text-left px-4 py-3">Sản phẩm</th>
                <th className="text-left px-4 py-3">Danh mục</th>
                <th className="text-right px-4 py-3">Giá</th>
                <th className="text-center px-4 py-3">Trạng thái</th>
                <th className="text-center px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-surface transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-10 h-12 object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-12 bg-surface flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium leading-tight">{p.name}</p>
                        <p className="text-xs text-muted font-mono">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">{p.categoryName || '—'}</td>
                  <td className="px-4 py-3 text-right font-bold text-accent">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-semibold px-2 py-1 ${p.active ? 'text-green-700 bg-green-100' : 'text-gray-500 bg-gray-100'}`}>
                      {p.active ? 'Đang bán' : 'Ẩn'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 hover:text-accent transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} className="p-1.5 hover:text-red-500 transition-colors disabled:opacity-50"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="text-center py-12 text-muted text-sm">Không có sản phẩm nào</div>
          )}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}