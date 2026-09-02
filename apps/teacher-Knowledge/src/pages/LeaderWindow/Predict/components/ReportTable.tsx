// components/ReportTable.tsx
import React from 'react';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ReportRecord } from '../types';

interface ReportTableProps {
  data: ReportRecord[];
  loading?: boolean;
  onRowClick?: (record: ReportRecord) => void;
}

export const ReportTable: React.FC<ReportTableProps> = ({
  data,
  loading = false,
  onRowClick,
}) => {
  const getTrendConfig = (trend: ReportRecord['trend'], change: number) => {
    const configs = {
      up: { color: 'success', icon: '↑', text: '上升', bg: 'bg-green-50' },
      down: { color: 'error', icon: '↓', text: '下降', bg: 'bg-red-50' },
      stable: { color: 'warning', icon: '→', text: '持平', bg: 'bg-yellow-50' },
    };
    return configs[trend] || configs.stable;
  };

  const getMasteryColor = (rate: number) => {
    if (rate >= 80) return 'text-green-500';
    if (rate >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const columns: ColumnsType<ReportRecord> = [
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
      width: 100,
      fixed: 'left',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: '班级',
      dataIndex: 'className',
      key: 'className',
      width: 130,
      fixed: 'left',
    },
    {
      title: '学科',
      dataIndex: 'subject',
      key: 'subject',
      width: 80,
      render: (text) => (
        <Tag color="blue" className="text-xs">
          {text}
        </Tag>
      ),
    },
    {
      title: '平均掌握度',
      dataIndex: 'masteryRate',
      key: 'masteryRate',
      width: 120,
      sorter: (a, b) => a.masteryRate - b.masteryRate,
      render: (value) => (
        <span className={`font-semibold ${getMasteryColor(value)}`}>
          {value}%
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
      sorter: (a, b) => a.weekChange - b.weekChange,
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
      render: (trend, record) => {
        const config = getTrendConfig(trend, record.weekChange);
        return (
          <Tag color={config.color} className="flex items-center gap-1">
            {config.icon} {config.text}
          </Tag>
        );
      },
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
      scroll={{ x: 900 }}
      onRow={(record) => ({
        onClick: () => onRowClick?.(record),
        className: 'hover:bg-gray-50 cursor-pointer',
      })}
    />
  );
};