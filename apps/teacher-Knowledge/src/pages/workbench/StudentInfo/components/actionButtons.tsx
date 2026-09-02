import React from 'react';
import { Button } from 'antd';
import {
  FileTextOutlined,
  BookOutlined,
  SendOutlined,
} from '@ant-design/icons';

interface ActionButtonsProps {
  onExport: () => void;
  onGeneratePlan: () => void;
  onSendToParent: () => void;
  loading?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onExport,
  onGeneratePlan,
  onSendToParent,
  loading = false,
}) => {
  return (
    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
      <Button
        type="primary"
        icon={<FileTextOutlined />}
        onClick={onExport}
        loading={loading}
        className="flex-1"
      >
        导出报告
      </Button>
      <Button
        icon={<BookOutlined />}
        onClick={onGeneratePlan}
        loading={loading}
        className="flex-1"
      >
        生成学习计划
      </Button>
      <Button
        icon={<SendOutlined />}
        onClick={onSendToParent}
        loading={loading}
        className="flex-1"
      >
        发送给家长
      </Button>
    </div>
  );
};