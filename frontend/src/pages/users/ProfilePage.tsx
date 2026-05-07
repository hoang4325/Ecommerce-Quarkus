import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, ChevronRight, Mail, MapPin, Phone, Save, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userApi } from '../../api/endpoints/userApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { UpdateProfileRequest } from '../../types';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<UpdateProfileRequest>({});

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await userApi.getMyProfile();
      return res.data.data!;
    },
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      phone: profile.phone ?? '',
      address: profile.address ?? '',
      city: profile.city ?? '',
      country: profile.country ?? '',
    });
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError('');
    try {
      await userApi.updateProfile(form);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message ?? 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  const set = (k: keyof UpdateProfileRequest) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  if (isLoading) return <LoadingSpinner size="lg" />;
  if (!profile) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="container-shop border-t border-black/10 py-6">
        <nav className="flex items-center gap-2 text-sm text-black/60">
          <Link to="/" className="transition-colors hover:text-primary">Home</Link>
          <ChevronRight size={16} />
          <span className="font-medium text-primary">Profile</span>
        </nav>

        <div className="mt-6 grid gap-5 lg:grid-cols-[330px_1fr]">
          <aside className="h-fit rounded-lg border border-black/10 bg-white p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white">
              <User size={34} />
            </div>
            <h1 className="mt-5 text-3xl font-black leading-tight text-primary">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="mt-2 text-sm text-black/60">{profile.email}</p>

            <div className="mt-6 space-y-3 border-t border-black/10 pt-6 text-sm">
              <div className="flex items-center gap-3 text-black/60">
                <Mail size={18} className="text-primary" />
                {profile.email}
              </div>
              <div className="flex items-center gap-3 text-black/60">
                <Phone size={18} className="text-primary" />
                {profile.phone || 'No phone number'}
              </div>
              <div className="flex items-start gap-3 text-black/60">
                <MapPin size={18} className="mt-0.5 text-primary" />
                <span>{profile.address || 'No saved address'}</span>
              </div>
            </div>
          </aside>

          <section className="rounded-lg border border-black/10 bg-white p-5 md:p-8">
            <div className="mb-8">
              <h2 className="text-[34px] font-black leading-tight text-primary">ACCOUNT DETAILS</h2>
              <p className="mt-2 text-sm text-black/60">Update your contact details for smoother checkout and delivery.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-primary">First name</label>
                  <input type="text" value={form.firstName ?? ''} onChange={set('firstName')} placeholder="First name" className="h-12 w-full rounded-full bg-[#F0F0F0] px-5 text-sm text-primary placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-primary">Last name</label>
                  <input type="text" value={form.lastName ?? ''} onChange={set('lastName')} placeholder="Last name" className="h-12 w-full rounded-full bg-[#F0F0F0] px-5 text-sm text-primary placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-primary">Phone number</label>
                <input type="tel" value={form.phone ?? ''} onChange={set('phone')} placeholder="0901 234 567" className="h-12 w-full rounded-full bg-[#F0F0F0] px-5 text-sm text-primary placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-primary">Address</label>
                <input type="text" value={form.address ?? ''} onChange={set('address')} placeholder="House number, street, ward..." className="h-12 w-full rounded-full bg-[#F0F0F0] px-5 text-sm text-primary placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-primary">City</label>
                  <input type="text" value={form.city ?? ''} onChange={set('city')} placeholder="Ho Chi Minh City" className="h-12 w-full rounded-full bg-[#F0F0F0] px-5 text-sm text-primary placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-primary">Country</label>
                  <input type="text" value={form.country ?? ''} onChange={set('country')} placeholder="Vietnam" className="h-12 w-full rounded-full bg-[#F0F0F0] px-5 text-sm text-primary placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
              </div>

              {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
              {saved && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  <CheckCircle size={18} />
                  Profile saved successfully.
                </div>
              )}

              <button type="submit" disabled={saving} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-medium text-white transition-colors hover:bg-black/80 disabled:opacity-50">
                <Save size={17} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
