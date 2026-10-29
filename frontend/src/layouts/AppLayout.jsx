import { Button, Flex, Layout, Menu, Typography } from 'antd'
import { Link, Outlet, useLocation } from 'react-router'
import useAuth from '../auth/useAuth'

const NAV_ITEMS = [
  { key: '/employees', label: <Link to="/employees">Employees</Link> },
  { key: '/insights', label: <Link to="/insights">Insights</Link> },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Typography.Text strong style={{ color: '#fff', whiteSpace: 'nowrap' }}>
          ACME Salaries
        </Typography.Text>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={NAV_ITEMS}
          style={{ flex: 1, minWidth: 0 }}
        />
        <Flex align="center" gap={12}>
          <Typography.Text style={{ color: '#fff' }}>{user.email}</Typography.Text>
          <Button onClick={logout}>Log out</Button>
        </Flex>
      </Layout.Header>
      <Layout.Content style={{ padding: 24 }}>
        <Outlet />
      </Layout.Content>
    </Layout>
  )
}
