// components/ScoreOverview.tsx
import React from 'react';
import { Card, Row, Col } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';

interface ScoreOverviewProps {
  strengths: string[];
  weaknesses: string[];
  midtermScore: number;
  finalScore: number;
  masteryRate: number;
  masteryTrend: number;
}

export const ScoreOverview: React.FC<ScoreOverviewProps> = ({
  strengths,
  weaknesses,
  midtermScore,
  finalScore,
  masteryRate,
  masteryTrend,
}) => {
  return (
    <Row gutter={[12, 12]} className="mb-4">
      <Col span={6}>
        <Card size="small" className="text-center">
          <div className="text-xs text-gray-500">优势学科</div>
          <div className="font-bold text-green-500">{strengths.join(' · ')}</div>
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small" className="text-center">
          <div className="text-xs text-gray-500">薄弱学科</div>
          <div className="font-bold text-red-500">{weaknesses.join(' · ')}</div>
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small" className="text-center">
          <div className="text-xs text-gray-500">期中</div>
          <div className="font-bold text-blue-500">{midtermScore}</div>
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small" className="text-center">
          <div className="text-xs text-gray-500">期末</div>
          <div className="font-bold text-green-500">{finalScore} ↑</div>
        </Card>
      </Col>
      <Col span={24}>
        <Card size="small">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500">综合掌握度</span>
              <span className="text-2xl font-bold text-blue-500 ml-2">{masteryRate}%</span>
            </div>
            <div>
              <span className="text-green-500">
                <ArrowUpOutlined /> {masteryTrend}%
              </span>
              <span className="text-xs text-gray-400 ml-1">较上次</span>
            </div>
            <div className="flex-1 max-w-xs ml-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${masteryRate}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};