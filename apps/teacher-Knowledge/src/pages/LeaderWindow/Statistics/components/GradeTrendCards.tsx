// components/GradeTrendCards.tsx
import React from 'react';
import { Card, Row, Col } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';
import type { GradeTrend } from '../types';
import { Label } from '@ui';

interface GradeTrendCardsProps {
  trends: GradeTrend[];
}

export const GradeTrendCards: React.FC<GradeTrendCardsProps> = ({ trends }) => {
  const getTrendIcon = (trend: GradeTrend['trend']) => {
    const icons = {
      up: <ArrowUpOutlined className="text-green-500" />,
      down: <ArrowDownOutlined className="text-red-500" />,
      stable: <MinusOutlined className="text-yellow-500" />,
    };
    return icons[trend] || null;
  };

  const getTrendColor = (trend: GradeTrend['trend']) => {
    const colors = {
      up: '#10b981',
      down: '#ef4444',
      stable: '#f59e0b',
    };
    return colors[trend] || '#6b7280';
  };

  return (
    <div>
      <Label className=''>
        📈 知识掌握情况
      </Label>
      <Row gutter={[16, 16]} className="mb-6 mt-2">
        {trends.map((item, index) => (
          <Col xs={24} sm={8} md={8} key={index}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-500 text-sm font-medium">📊 {item.grade}</div>
                  <div className="text-3xl font-bold text-gray-800 mt-1">
                    {item.masteryRate}%
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {getTrendIcon(item.trend)}
                    <span
                      className="text-sm font-medium"
                      style={{ color: getTrendColor(item.trend) }}
                    >
                      {item.change > 0 ? '+' : ''}{item.change}% 较上月
                    </span>
                  </div>
                </div>
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${getTrendColor(item.trend)}20, ${getTrendColor(item.trend)}10)`,
                    color: getTrendColor(item.trend),
                  }}
                >
                  {Math.round(item.masteryRate / 10)}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};