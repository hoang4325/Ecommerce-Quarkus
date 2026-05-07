import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, ChevronRight, CircleDot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { notificationApi } from '../../api/endpoints/notificationApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import type { NotificationDTO } from '../../types';

export default function NotificationPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await notificationApi.getAll();
      return res.data.data as NotificationDTO[];
    },
  });

  const markRead = async (id: string) => {
    await notificationApi.markAsRead(id);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const notifications = data ?? [];
  const unread = notifications.filter(n => !n.read);

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="container-shop max-w-4xl border-t border-black/10 py-6">
        <nav className="flex items-center gap-2 text-sm text-black/60">
          <Link to="/" className="transition-colors hover:text-primary">Home</Link>
          <ChevronRight size={16} />
          <span className="font-medium text-primary">Notifications</span>
        </nav>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-[40px] font-black leading-tight text-primary md:text-[48px]">NOTIFICATIONS</h1>
            <p className="mt-2 text-sm text-black/60">
              Keep up with order updates, inventory changes, and account messages.
            </p>
          </div>
          {unread.length > 0 && (
            <button
              type="button"
              onClick={async () => {
                for (const notification of unread) {
                  await notificationApi.markAsRead(notification.id);
                }
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
              }}
              className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-black/80"
            >
              <CheckCheck size={17} />
              Mark all read
            </button>
          )}
        </div>

        <div className="mt-8 rounded-lg border border-black/10 bg-white p-4 md:p-6">
          {notifications.length === 0 ? (
            <div className="py-12">
              <EmptyState icon={<Bell size={32} />} message="No notifications yet" />
            </div>
          ) : (
            <div className="divide-y divide-black/10">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => !notification.read && markRead(notification.id)}
                  className="flex w-full gap-4 py-5 text-left transition-colors hover:bg-[#F7F7F7] md:px-3"
                >
                  <span className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    notification.read ? 'bg-[#F0F0F0] text-black/35' : 'bg-primary text-white'
                  }`}>
                    {notification.read ? <Bell size={18} /> : <CircleDot size={18} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm leading-6 ${notification.read ? 'text-black/55' : 'font-medium text-primary'}`}>
                      {notification.message}
                    </span>
                    <span className="mt-2 flex flex-wrap items-center gap-2 text-xs text-black/45">
                      {new Date(notification.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                      {notification.type && (
                        <span className="rounded-full bg-[#F0F0F0] px-3 py-1 font-medium text-black/60">{notification.type}</span>
                      )}
                    </span>
                  </span>
                  {!notification.read && <span className="hidden text-sm font-medium text-primary md:block">Mark read</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
