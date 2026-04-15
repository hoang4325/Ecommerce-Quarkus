import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-muted">{categories.length} danh mục</span>
        <button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2">
          <Plus size={16} /> Thêm danh mục
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-bold text-lg">Thêm danh mục mới</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Tên danh mục *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: autoSlug(e.target.value) }))}
                  required
                  className="input"
                  placeholder="Áo nam"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Slug *</label>
                <input
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  required
                  className="input font-mono text-sm"
                  placeholder="ao-nam"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 text-sm">
                  {saving ? 'Đang tạo...' : 'Tạo danh mục'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 py-3 text-sm">Huỷ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-xs uppercase tracking-widest text-muted">
                <th className="text-left px-4 py-3">Tên</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-left px-4 py-3">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((c: CategoryDTO) => (
                <tr key={c.id} className="hover:bg-surface transition-colors">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-3 text-muted text-xs">
                    {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && (
            <div className="text-center py-12 text-muted text-sm">Chưa có danh mục nào</div>
          )}
        </div>
      )}
    </div>
  );
}