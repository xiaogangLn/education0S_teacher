// components/StudentStats.tsx

import React from 'react';
import { Row, Col, Statistic } from 'antd';
import { UserOutlined, TrophyOutlined, RiseOutlined, SwapOutlined } from '@ant-design/icons';
import { type StudentStats as StudentStatsType } from '../types';

interface StudentStatsProps {
  stats: StudentStatsType;
  showTransferStat?: boolean;
}

const StudentStats: React.FC<StudentStatsProps> = ({ stats, showTransferStat = true }) => {
  return (
    <div className="flex-shrink-0">
      <Row
        gutter={[16, 16]}
        className="mb-4 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100"
        style={{ marginInline: 0 }}
      >
        <Col xs={12} sm={8} md={4}>
          <Statistic
            title="总人数"
            value={stats.total}
            valueStyle={{ color: '#1f2937', fontSize: '20px' }}
            prefix={<UserOutlined />}
          />
        </Col>
        <Col xs={12} sm={8} md={5}>
          <Statistic
            title="平均掌握度"
            value={stats.avgMastery}
            suffix="%"
            valueStyle={{ color: '#4f46e5', fontSize: '20px' }}
            prefix={<RiseOutlined />}
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Statistic
            title="优秀"
            value={stats.excellent}
            valueStyle={{ color: '#8b5cf6', fontSize: '20px' }}
            prefix={<TrophyOutlined />}
          />
        </Col>
        <Col xs={12} sm={8} md={5}>
          <Statistic
            title="待提升"
            value={stats.pending}
            valueStyle={{ color: '#f59e0b', fontSize: '20px' }}
          />
        </Col>
        {showTransferStat ? (
          <Col xs={12} sm={8} md={6}>
            <Statistic
              title="有换班记录"
              value={stats.hasTransfer}
              valueStyle={{ color: '#3b82f6', fontSize: '20px' }}
              prefix={<SwapOutlined />}
            />
          </Col>
        ) : null}
      </Row>
    </div>
  );
};

export default StudentStats;