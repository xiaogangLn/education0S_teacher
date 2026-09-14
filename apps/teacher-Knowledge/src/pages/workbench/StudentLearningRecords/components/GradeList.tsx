// components/GradeList.tsx
import React from 'react';
import { Table, Tag, Button, Space, Empty } from 'antd';
import type { GradeRecord } from '../types';

interface GradeListProps {
  grades: GradeRecord[];
  loading?: boolean;
  handleSee: (props: GradeRecord) => void
}

export const GradeList: React.FC<GradeListProps> = ({ grades, loading = false, handleSee }) => {
  const columns = [
    {
      title: '测验名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: '科目',
      dataIndex: 'subject',
      key: 'subject',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '成绩',
      key: 'score',
      render: (_: any, record: GradeRecord) => {
        const percentage = (record.score / record.totalScore) * 100;
        const color = percentage >= 80 ? 'green' : percentage >= 60 ? 'gold' : 'red';
        return <Tag color={color}>{record.score}/{record.totalScore}</Tag>;
      },
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '试卷',
      key: 'images',
      render: (_: any, record: GradeRecord) => {
        const count = record.images?.length || 0;
        return count > 0 ? (
          <Tag color="green">📷 {count}张</Tag>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: GradeRecord) => (
        <Button type="link" size="small" onClick={() => handleSee(record)}>查看</Button>
      ),
    },
  ];

  if (grades.length === 0 && !loading) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="暂无成绩记录"
        className="py-8"
      />
    );
  }

  return (
    <Table
      columns={columns}
      dataSource={grades}
      loading={loading}
      rowKey="id"
      pagination={false}
      size="middle"
    />
  );
};