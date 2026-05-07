import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ImageIcon, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { productApi, categoryApi } from '../../api/endpoints/productApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import type { ProductDTO, CreateProductRequest, CategoryDTO } from '../../types';

const PAGE_SIZE = 10;
const formatPrice = (price: number) => `$${Math.round(price / 10000)}`;

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

  const openCreate = () => {
    setEditProduct(null);
    setForm({ name: '', slug: '', price: 0 });
    setShowForm(true);
  };

  const openEdit = (product: ProductDTO) => {
    setEditProduct(product);
    setForm({ name: product.name, slug: product.slug, description: product.description, price: product.price, imageUrl: product.imageUrl, categoryId: product.categoryId });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editProduct) await productApi.update(editProduct.id, form);
      else await productApi.create(form);
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
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-black/10 bg-white p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary">Product Catalog</h2>
          <p className="mt-1 text-sm text-black/50">{data?.totalElements ?? products.length} products in this view</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <form onSubmit={e => { e.preventDefault(); setSearch(searchInput); setPage(0); }} className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search products..." className="h-11 w-full rounded-full bg-[#F0F0F0] pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
          </form>
          <button type="button" onClick={openCreate} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-white">
            <Plus size={17} /> Add product
          </button>
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/10 p-6">
              <h2 className="text-xl font-bold text-primary">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button type="button" onClick={() => setShowForm(false)}><X size={22} /></button>
            </div>
            <form onSubmit={handleSave} className="grid gap-4 p-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-primary">Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: autoSlug(e.target.value) }))} required className="h-12 w-full rounded-full bg-[#F0F0F0] px-5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-primary">Slug</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required className="h-12 w-full rounded-full bg-[#F0F0F0] px-5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-primary">Price</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))} required min={0.01} step={1000} className="h-12 w-full rounded-full bg-[#F0F0F0] px-5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-primary">Category</label>
                <select value={form.categoryId ?? ''} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value || undefined }))} className="h-12 w-full rounded-full bg-[#F0F0F0] px-5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10">
                  <option value="">Select category</option>
                  {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-primary">Image URL</label>
                <input value={form.imageUrl ?? ''} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} className="h-12 w-full rounded-full bg-[#F0F0F0] px-5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-primary">Description</label>
                <textarea value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} className="w-full resize-none rounded-lg bg-[#F0F0F0] px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>
              <div className="flex gap-3 pt-2 md:col-span-2">
                <button type="submit" disabled={saving} className="h-12 flex-1 rounded-full bg-primary text-sm font-medium text-white disabled:opacity-50">{saving ? 'Saving...' : editProduct ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="h-12 flex-1 rounded-full border border-black/10 text-sm font-medium">Cancel</button>
              </div>
            </form>
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
                  <th className="px-5 py-4 text-left">Category</th>
                  <th className="px-5 py-4 text-right">Price</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-[#F7F7F7]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#F0F0F0]"><ImageIcon size={18} className="text-black/30" /></div>
                        )}
                        <div>
                          <p className="font-bold text-primary">{product.name}</p>
                          <p className="mt-1 font-mono text-xs text-black/45">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-black/60">{product.categoryName || '—'}</td>
                    <td className="px-5 py-4 text-right font-bold text-primary">{formatPrice(product.price)}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {product.active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button type="button" onClick={() => openEdit(product)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 transition-colors hover:border-primary"><Pencil size={15} /></button>
                        <button type="button" onClick={() => handleDelete(product.id)} disabled={deletingId === product.id} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-red-500 transition-colors hover:border-red-500 disabled:opacity-50"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && <div className="py-12 text-center text-sm text-black/50">No products found.</div>}
          </div>
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
