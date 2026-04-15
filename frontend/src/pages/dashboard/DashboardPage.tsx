import { Card, Col, Row, Statistic } from 'antd';
import { ShoppingCartOutlined, OrderedListOutlined, BellOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../../api/endpoints/orderApi';
import { notificationApi } from '../../api/endpoints/notificationApi';
import { authStore } from '../../auth/authStore';

const DashboardPage = () => {
  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderApi.listMyOrders().then((r) => r.data.data!),
  });

  const { data: unreadNotifications } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationApi.getUnread().then((r) => r.data.data ?? []),
  });

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Welcome, {authStore.user?.firstName || 'User'}!</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="My Orders"
              value={orders?.length ?? 0}
              prefix={<OrderedListOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Orders"
              value={orders?.filter((o) => o.status === 'PENDING').length ?? 0}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Unread Notifications"
              value={unreadNotifications?.length ?? 0}
              prefix={<BellOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Spent"
              value={orders?.filter((o) => o.status === 'CONFIRMED').reduce((sum, o) => sum + o.totalAmount, 0) ?? 0}
              prefix="$"
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      {authStore.isAdmin && (
        <Card style={{ marginTop: 24 }} title="Admin Quick Info">
          <p>You have admin access. Use the sidebar to manage products, orders, inventory, and more.</p>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;