// components/PermissionDropdown.tsx
import React from 'react';
import { Dropdown } from 'antd';
import { type PermissionType, PERMISSION_CONFIG } from '../types';

interface PermissionDropdownProps {
  currentPermission: PermissionType;
  onChange: (permission: PermissionType) => void;
  trigger?: React.ReactNode;
}

export const PermissionDropdown: React.FC<PermissionDropdownProps> = ({
  currentPermission,
  onChange,
  trigger,
}) => {
  const items = Object.entries(PERMISSION_CONFIG).map(([key, config]) => ({
    key,
    label: (
      <div className="flex items-center gap-2 py-1">
        <span>{config.icon}</span>
        <div>
          <div className="font-medium">{config.label}</div>
          <div className="text-xs text-gray-400">{config.desc}</div>
        </div>
        {key === currentPermission && (
          <span className="text-blue-500 ml-auto">✓</span>
        )}
      </div>
    ),
  }));

  return (
    <Dropdown
      menu={{
        items,
        onClick: ({ key }) => onChange(key as PermissionType),
        selectedKeys: [currentPermission],
      }}
      trigger={['click']}
      placement="bottomRight"
    >
      {trigger || (
        <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800">
          🔐 {PERMISSION_CONFIG[currentPermission].label} ▼
        </button>
      )}
    </Dropdown>
  );
};