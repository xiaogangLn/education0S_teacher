// components/ReportStats.tsx
import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DatabaseOutlined } from '@ant-design/icons';
import type { ReportStats as ReportStatsType } from '../types';

interface ReportStatsProps {
  stats: ReportStatsType;
  loading?: boolean;
}

export const ReportStats: React.FC<ReportStatsProps> = ({ stats, loading = false }) => {
  const items = [
    {
      key: 'total',
      title: '总记录数',
      value: stats.totalRecords,
      suffix: '条',
      icon: <DatabaseOutlined className="text-blue-500" />,
      color: 'text-blue-500',
    },
    {
      key: 'average',
      title: '平均掌握度',
      value: stats.averageMastery,
      suffix: '%',
      icon: <ArrowUpOutlined className="text-green-500" />,
      color: 'text-green-500',
    },
    {
      key: 'max',
      title: '最高掌握度',
      value: stats.maxMastery,
      suffix: '%',
      icon: <ArrowUpOutlined className="text-green-500" />,
      color: 'text-green-500',
    },
    {
      key: 'min',
      title: '最低掌握度',
      value: stats.minMastery,
      suffix: '%',
      icon: <ArrowDownOutlined className="text-red-500" />,
      color: 'text-red-500',
    },
    {
      key: 'up',
      title: '上升趋势',
      value: stats.upTrendCount,
      suffix: '个班级',
      icon: <ArrowUpOutlined className="text-green-500" />,
      color: 'text-green-500',
    },
    {
      key: 'down',
      title: '下降趋势',
      value: stats.downTrendCount,
      suffix: '个班级',
      icon: <ArrowDownOutlined className="text-red-500" />,
      color: 'text-red-500',
    },
  ];

  return (
    <Row gutter={[12, 12]} className="mb-4 flex-shrink-0">
      {items.map(item => (
        <Col xs={12} sm={8} md={4} key={item.key}>
          <Card size="small" loading={loading} className="text-center">
            <div className="flex items-center justify-center gap-1">
              {item.icon}
              <span className="text-xs text-gray-400">{item.title}</span>
            </div>
            <div className={`text-xl font-bold ${item.color}`}>
              {item.value}
              <span className="text-sm font-normal text-gray-400 ml-0.5">{item.suffix}</span>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};