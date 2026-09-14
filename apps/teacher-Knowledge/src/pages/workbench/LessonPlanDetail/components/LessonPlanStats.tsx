// components/LessonPlanStats.tsx
import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { FileTextOutlined, UserOutlined, TeamOutlined, PercentageOutlined } from '@ant-design/icons';

interface LessonPlanStatsProps {
  stats: {
    totalStudents: number;
    totalQuestions: number;
    personalizedQuestions: number | string;
    coverage: number;
  };
}

export const LessonPlanStats: React.FC<LessonPlanStatsProps> = ({ stats }) => {
  return (
    <Row gutter={[12, 12]} className="mb-4">
      <Col xs={12} sm={6}>
        <Card size="small">
          <Statistic
            title="必做题"
            value={stats.totalQuestions}
            prefix={<FileTextOutlined className="text-blue-500" />}
            suffix="题"
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Statistic
            title="个性化题/人"
            value={stats.personalizedQuestions}
            prefix={<UserOutlined className="text-orange-500" />}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Statistic
            title="总学生数"
            value={stats.totalStudents}
            prefix={<TeamOutlined className="text-green-500" />}
            suffix="人"
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Statistic
            title="覆盖率"
            value={stats.coverage}
            prefix={<PercentageOutlined className="text-purple-500" />}
            suffix="%"
          />
        </Card>
      </Col>
    </Row>
  );
};