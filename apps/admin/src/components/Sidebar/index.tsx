// components/sidebar/index.tsx
import React from 'react';
import { Layout, Menu, theme } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  BookOutlined,
  TeamOutlined,
  AppstoreOutlined,
  CrownOutlined,
  FolderOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
  ApiOutlined,
  FormOutlined,
  PayCircleOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

interface SidebarComponentProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const menuItems = [
  {
    key: '/application',
    icon: <DashboardOutlined />,
    label: '首页',
  },
  {
    key: '/application/schools',
    icon: <FolderOutlined />,
    label: '学校管理',
  },
  {
    key: '/application/grades',
    icon: <CloudUploadOutlined />,
    label: '年级管理',
  },
  {
    key: '/application/classs',
    icon: <BookOutlined />,
    label: '班级管理',
  },
  {
    key: '/application/students',
    icon: <TeamOutlined />,
    label: '学生管理',
  },
  {
    key: '/application/teachers',
    icon: <CheckCircleOutlined />,
    label: '老师管理',
  },
  {
    key: '/application/commercial',
    icon: <CrownOutlined />,
    label: '商业用户',
  },
  {
    key: '/application/commercial-plans',
    icon: <AppstoreOutlined />,
    label: '套餐能力',
  },
  {
    key: '/application/payments',
    icon: <PayCircleOutlined />,
    label: '支付配置',
  },
  {
    key: '/application/ai-models',
    icon: <ApiOutlined />,
    label: '模型目录',
  },
  {
    key: '/application/prompts',
    icon: <FormOutlined />,
    label: '提示词中心',
  },
];

export const SidebarComponent: React.FC<SidebarComponentProps> = ({
  collapsed,
  onCollapse,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={240}
      style={{
        background: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
        height: '100%',
        overflow: 'auto',
      }}
    >

      {/* 菜单 */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        className="border-r-0 py-2"
        style={{ background: 'transparent' }}
      />
    </Sider>
  );
};