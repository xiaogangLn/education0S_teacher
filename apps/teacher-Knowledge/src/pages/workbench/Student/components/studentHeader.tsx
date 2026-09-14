// components/StudentHeader.tsx

import React from 'react';
import { Button, Space, Typography } from 'antd';
import { ArrowLeftOutlined, ExportOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface StudentHeaderProps {
  onExport?: () => void;
  onAddStudent?: () => void;
  handleCancel: () => void;
  canAddStudent?: boolean;
}

const StudentHeader: React.FC<StudentHeaderProps> = ({ onExport, onAddStudent, handleCancel, canAddStudent = false }) => {
  return (
    <div className="flex-shrink-0 flex flex-wrap justify-between items-center gap-4 mb-4">
      <div className="flex items-center gap-3">
        <Title level={4} className="!mb-0">
          📊 学生管理
        </Title>
      </div>
      <Space>
        <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleCancel}
        >
            返回
        </Button>
        <Button icon={<ExportOutlined />} onClick={onExport}>
          导出名单
        </Button>
        {canAddStudent ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={onAddStudent}>
            添加学生
          </Button>
        ) : null}
      </Space>
    </div>
  );
};

export default StudentHeader;