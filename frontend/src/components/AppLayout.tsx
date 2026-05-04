'use client';

import React, { useState } from 'react';
import { Layout, Menu, Typography, theme } from 'antd';
import {
  AppstoreOutlined,
  TeamOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';

const { Sider, Content, Header } = Layout;
const { Title } = Typography;

/**
 * Main application layout with sidebar navigation.
 * Provides consistent navigation across all pages.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { token } = theme.useToken();

  // Navigation menu items
  const menuItems = [
    {
      key: '/items',
      icon: <AppstoreOutlined />,
      label: 'Master Items',
    },
    {
      key: '/suppliers',
      icon: <TeamOutlined />,
      label: 'Master Suppliers',
    },
    {
      key: '/prices',
      icon: <DollarOutlined />,
      label: 'Price Management',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
        }}
        width={240}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}>
          <Title level={5} style={{ margin: 0, color: token.colorPrimary }}>
            {collapsed ? 'PM' : 'Price Manager'}
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: token.colorBgContainer,
          padding: '0 24px',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          display: 'flex',
          alignItems: 'center',
        }}>
          <Title level={4} style={{ margin: 0 }}>
            {menuItems.find(i => i.key === pathname)?.label || 'Price Management Tool'}
          </Title>
        </Header>
        <Content style={{ margin: 16, padding: 24, background: token.colorBgContainer, borderRadius: 8 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
