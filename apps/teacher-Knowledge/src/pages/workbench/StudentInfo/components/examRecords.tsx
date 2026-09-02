import React from 'react';
import { Table, Button, Tag } from 'antd';
import type { ExamRecord } from '../types';

interface ExamRecordsProps {
  records: ExamRecord[];
}

export const ExamRecords: React.FC<ExamRecordsProps> = ({ records }) => {
  const columns = [
    {
      title: '考试名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: '科目',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: '成绩',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => {
        const color = score >= 90 ? 'green' : score >= 80 ? 'blue' : score >= 60 ? 'gold' : 'red';
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
    <div>
      <div className="font-semibold text-sm mb-2">📋 考试记录</div>
      <Table
        dataSource={records}
        columns={columns}
        pagination={false}
        size="small"
        rowKey="name"
        className="text-sm"
      />
    </div>
  );
};