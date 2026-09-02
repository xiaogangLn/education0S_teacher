import React from 'react';
import { Statistic, Row, Col } from 'antd';
import type { TeacherProfile } from '../types/teacher';

interface StatsRowProps {
  stats: TeacherProfile['stats'];
}

const colorMap = {
  blue: '#4f46e5',
  green: '#10b981',
  purple: '#8b5cf6',
  orange: '#f59e0b',
};

export const StatsRow: React.FC<StatsRowProps> = ({ stats }) => {
  return (
    <Row gutter={[16, 16]} className="mb-4">
      {stats.map((stat, idx) => (
        <Col xs={12} sm={6} key={idx}>
          <div className="bg-gray-50 rounded-xl py-3 px-4 text-center border border-gray-100">
            <Statistic
              value={stat.value}
              valueStyle={{ color: colorMap[stat.color], fontSize: '24px', fontWeight: 700 }}
              suffix={stat.label === '学生进步' ? '%' : undefined}
              precision={stat.label === '教案质量' || stat.label === '课堂互动' ? 1 : 0}
            />
            <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        </Col>
      ))}
    </Row>
  );
};