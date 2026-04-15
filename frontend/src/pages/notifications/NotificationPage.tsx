import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationApi } from '../../api/endpoints/notificationApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import type { NotificationDTO } from '../../types';
import clsx from 'clsx';

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

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="container-shop py-12 max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="section-subtitle mb-1">Tài khoản</p>
          <h1 className="section-title">Thông báo</h1>
        </div>
        {notifications.some(n => !n.read) && (
          <button
            onClick={async () => {
              for (const n of notifications.filter(x => !x.read)) {
                await notificationApi.markAsRead(n.id);
              }
              queryClient.invalidateQueries({ queryKey: ['notifications'] });
            }}
            className="flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors font-medium"
          >
            <CheckCheck size={16} /> Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={32} />}
          message="Không có thông báo nào"
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n: NotificationDTO) => (
            <div
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className={clsx(
                'flex gap-4 p-5 border transition-colors cursor-pointer',
                n.read
                  ? 'border-border bg-white text-muted'
                  : 'border-border bg-white hover:border-primary'
              )}
            >
              <div className={clsx('w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0', n.read ? 'bg-gray-200' : 'bg-accent')} />
              <div className="flex-1 min-w-0">
                <p className={clsx('text-sm leading-relaxed', !n.read && 'font-medium text-primary')}>{n.message}</p>
                <p className="text-xs text-muted mt-1.5">
                  {new Date(n.createdAt).toLocaleString('vi-VN')}
                  {n.type && <span className="ml-2 bg-surface px-2 py-0.5">{n.type}</span>}
                </p>
              </div>
              {!n.read && (
                <button className="text-xs text-accent hover:underline flex-shrink-0">Đã đọc</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}