// components/StudentTable.tsx

import React, { useMemo } from 'react';
import { Table, Button, Space, Tag, Progress, Avatar } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { type Student } from '../types';
import { STATUS_MAP, getTransferTagColor, getMasteryColor, getMasteryTextColor } from '../constants';

interface StudentTableProps {
  students: Student[];
  total: number;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  loading?: boolean;
  onTableChange: (pagination: TablePaginationConfig) => void;
  onViewPortrait?: (student: Student) => void;
  onEdit?: (student: Student) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({
  students,
  pagination,
  loading = false,
  onTableChange,
  onViewPortrait,
  onEdit,
}) => {
  // ===== 表格列定义 =====
  const columns: ColumnsType<Student> = useMemo(
    () => [
      {
        title: '#',
        key: 'index',
        width: 50,
        render: (_, __, index) => {
          const startIndex = (pagination.current - 1) * pagination.pageSize;
          return <span className="text-gray-400 font-medium">{startIndex + index + 1}</span>;
        },
      },
      {
        title: '学生',
        key: 'student',
        width: 180,
        render: (_, record) => (
          <div className="flex items-center gap-3">
            <Avatar
              size={34}
              style={{ backgroundColor: record.avatarColor || '#6b7280' }}
              className="flex-shrink-0"
            >
              {record.name.charAt(0)}
            </Avatar>
            <div>
              <div className="font-medium text-gray-800">{record.name}</div>
              <div className="text-xs text-gray-400">
                {record.currentClass} · 学号 {record.studentNo}
              </div>
            </div>
          </div>
        ),
      },
      {
        title: '学号',
        dataIndex: 'studentNo',
        key: 'studentNo',
        width: 80,
        render: (no: string) => <span className="text-gray-600">{no}</span>,
      },
      {
        title: '当前班级',
        dataIndex: 'currentClass',
        key: 'currentClass',
        width: 120,
        render: (cls: string) => <span className="text-gray-600">{cls}</span>,
      },
      {
        title: '换班记录',
        key: 'transfer',
        width: 110,
        render: (_, record) => {
          const count = record.transferRecords.length;
          if (count === 0) {
            return <span className="text-gray-400 text-xs">—</span>;
          }
          return (
            <Tag color={getTransferTagColor(count)} icon={<SwapOutlined />} className="text-xs">
              {count}次
            </Tag>
          );
        },
      },
      {
        title: '掌握度',
        key: 'mastery',
        width: 150,
        render: (_, record) => (
          <div className="flex items-center gap-3">
            <Progress
              percent={record.mastery}
              size="small"
              showInfo={false}
              strokeColor={getMasteryColor(record.mastery)}
              className="flex-1 min-w-[60px]"
            />
            <span className={`text-sm font-medium ${getMasteryTextColor(record.mastery)}`}>
              {record.mastery}%
            </span>
          </div>
        ),
      },
      {
        title: '状态',
        key: 'status',
        width: 90,
        render: (_, record) => {
          const { label, color } = STATUS_MAP[record.status];
          return <Tag color={color}>{label}</Tag>;
        },
      },
      {
        title: '操作',
        key: 'action',
        width: 140,
        render: (_, record) => (
          <Space size="small">
            <Button
              type="link"
              size="small"
              className="text-indigo-600 hover:text-indigo-800 px-2"
              onClick={() => onViewPortrait?.(record)}
            >
              📊 画像
            </Button>
            <Button
              type="link"
              size="small"
              className="text-gray-500 hover:text-gray-700 px-2"
              onClick={() => onEdit?.(record)}
            >
              📝 编辑
            </Button>
          </Space>
        ),
      },
    ],
    [pagination.current, pagination.pageSize, onViewPortrait, onEdit]
  );

  return (
      <Table
        columns={columns}
        dataSource={students}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `显示 ${range[0]}-${range[1]} 人，共 ${total} 人`,
          pageSizeOptions: ['5', '7', '10', '20', '50'],
        }}
        className='flex-1 px-4 overflow-y-auto min-h-0'
        onChange={onTableChange}
        scroll={{ x: 900 }}
      />
  );
};

export default StudentTable;