// components/StudentHeader.tsx
import React from 'react';
import { Button, Tag } from 'antd';
import { type UserOutlined, type FileTextOutlined, PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface StudentHeaderProps {
  name: string;
  className: string;
  studentNo: string;
  grade: string;
  status: 'active' | 'transferred' | 'graduated';
  onViewPortrait?: () => void;
  onAddRecord?: () => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  name,
  className,
  studentNo,
  grade,
  status,
  onViewPortrait,
  onAddRecord,
}) => {
  const navigate = useNavigate();
  const statusMap = {
    active: { color: 'success', label: '在读' },
    transferred: { color: 'warning', label: '已转班' },
    graduated: { color: 'default', label: '已毕业' },
  };

  const statusInfo = statusMap[status] || statusMap.active;

  return (
    <div className="flex-shrink-0 flex flex-wrap justify-between items-start gap-3 mb-4">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-xl text-gray-800">{name}</span>
          <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {className} · 学号 {studentNo} · {grade}届
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button className="rounded-full" icon={<ArrowLeftOutlined />} onClick={() => navigate('/workbench/studentList')}>
            返回学生列表
          </Button>
        {onViewPortrait && (
          <Button className="rounded-full" onClick={onViewPortrait}>
            📊 查看画像
          </Button>
        )}
        {onAddRecord && (
          <Button type="primary" icon={<PlusOutlined />} className="rounded-full" onClick={onAddRecord}>
            添加记录
          </Button>
        )}
      </div>
    </div>
  );
};