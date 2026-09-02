// components/ClassDetailTable.tsx
import React from 'react';
import { Table, Tag, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ClassDetail } from '../types';

interface ClassDetailTableProps {
  data: ClassDetail[];
  loading?: boolean;
}

export const ClassDetailTable: React.FC<ClassDetailTableProps> = ({
  data,
  loading = false,
}) => {
  const getTrendTag = (trend: ClassDetail['trend'], change: number) => {
    const configs = {
      up: { color: 'success', icon: '↑', text: '上升' },
      down: { color: 'error', icon: '↓', text: '下降' },
      stable: { color: 'warning', icon: '→', text: '持平' },
    };
    const config = configs[trend] || configs.stable;
    return (
      <Tag color={config.color}>
        {config.icon} {config.text}
      </Tag>
    );
  };

  const columns: ColumnsType<ClassDetail> = [
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
      width: 100,
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: '班级',
      dataIndex: 'className',
      key: 'className',
      width: 130,
    },
    {
      title: '学科',
      dataIndex: 'subject',
      key: 'subject',
      width: 80,
    },
    {
      title: '平均掌握度',
      dataIndex: 'masteryRate',
      key: 'masteryRate',
      width: 120,
      render: (value) => (
        <span className="font-semibold">
          {value >= 80 ? (
            <span className="text-green-500">{value}%</span>
          ) : value >= 60 ? (
            <span className="text-yellow-500">{value}%</span>
          ) : (
            <span className="text-red-500">{value}%</span>
          )}
        </span>
      ),
    },
    {
      title: '优秀率',
      dataIndex: 'excellentRate',
      key: 'excellentRate',
      width: 100,
      render: (value) => `${value}%`,
    },
    {
      title: '待提升率',
      dataIndex: 'improvementRate',
      key: 'improvementRate',
      width: 100,
      render: (value) => `${value}%`,
    },
    {
      title: '较上周',
      dataIndex: 'weekChange',
      key: 'weekChange',
      width: 100,
      render: (value) => (
        <span className={value >= 0 ? 'text-green-500' : 'text-red-500'}>
          {value >= 0 ? '+' : ''}{value}%
        </span>
      ),
    },
    {
      title: '趋势',
      dataIndex: 'trend',
      key: 'trend',
      width: 100,
      render: (trend, record) => getTrendTag(trend, record.weekChange),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      pagination={false}
      className="text-sm"
      scroll={{ x: 800 }}
    />
  );
};