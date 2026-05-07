import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Tag, X } from 'lucide-react';
import { categoryApi } from '../../api/endpoints/productApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { CategoryDTO } from '../../types';

export default function AdminCategoryPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '' });
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoryApi.list();
      return res.data.data as CategoryDTO[];
    },
  });

  const autoSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await categoryApi.create(form);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowForm(false);
      setForm({ name: '', slug: '' });
    } finally {
      setSaving(false);
    }
  };

  const categories = data ?? [];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-black/10 bg-white p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary">Categories</h2>
          <p className="mt-1 text-sm text-black/50">{categories.length} merchandising groups</p>
        </div>
        <button type="button" onClick={() => setShowForm(true)} className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-white">
          <Plus size={17} /> Add category
        </button>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/10 p-6">
              <h2 className="text-xl font-bold text-primary">Add Category</h2>
              <button type="button" onClick={() => setShowForm(false)}><X size={22} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-primary">Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: autoSlug(e.target.value) }))} required className="h-12 w-full rounded-full bg-[#F0F0F0] px-5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" placeholder="T-shirts" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-primary">Slug</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required className="h-12 w-full rounded-full bg-[#F0F0F0] px-5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black/10" placeholder="t-shirts" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="h-12 flex-1 rounded-full bg-primary text-sm font-medium text-white disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button>
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
          <table className="w-full text-sm">
            <thead className="bg-[#F7F7F7] text-xs uppercase tracking-[0.18em] text-black/45">
              <tr>
                <th className="px-5 py-4 text-left">Name</th>
                <th className="px-5 py-4 text-left">Slug</th>
                <th className="px-5 py-4 text-left">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {categories.map(category => (
                <tr key={category.id} className="hover:bg-[#F7F7F7]">
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2 font-bold text-primary"><Tag size={16} /> {category.name}</span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-black/55">{category.slug}</td>
                  <td className="px-5 py-4 text-xs text-black/55">{new Date(category.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && <div className="py-12 text-center text-sm text-black/50">No categories yet.</div>}
        </div>
      )}
    </div>
  );
}
