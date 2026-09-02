// components/SubjectScores.tsx
import React from 'react';
import { Table, Tag, Button } from 'antd';
import type { SubjectScore } from '../types';

interface SubjectScoresProps {
  scores: SubjectScore[];
}

export const SubjectScores: React.FC<SubjectScoresProps> = ({ scores }) => {
  const columns = [
    {
      title: '科目',
      dataIndex: 'subject',
      key: 'subject',
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: '成绩',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => {
        const color = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error';
        return <Tag color={color}>{score}</Tag>;
      },
    },
    {
      title: '班级均分',
      dataIndex: 'classAverage',
      key: 'classAverage',
    },
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
    },
    {
      title: '操作',
      key: 'action',
      render: () => <Button type="link" size="small">查看</Button>,
    },
  ];

  return (
    <div className="mb-4">
      <div className="font-semibold text-sm mb-2">📊 各科成绩</div>
      <Table
        dataSource={scores}
        columns={columns}
        pagination={false}
        size="small"
        rowKey="subject"
        className="text-sm"
      />
    </div>
  );
};