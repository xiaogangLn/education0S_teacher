// components/RecordList.tsx - 更新 RecordItem 的调用
import React from 'react';
import { Empty, Spin, Button } from 'antd';
import type { LearningRecord } from '../types';
import { RecordItem } from './RecordItem';

interface RecordListProps {
  records: LearningRecord[];
  loading?: boolean;
  onViewDetail: (record: LearningRecord) => void;
  onViewImages: (record: LearningRecord) => void;
  onGrade: (record: LearningRecord) => void;
  onSubmit: (record: LearningRecord) => void;  // 新增：提交作业
  onLoadMore?: () => void;
}

export const RecordList: React.FC<RecordListProps> = ({
  records,
  loading = false,
  onViewDetail,
  onViewImages,
  onGrade,
  onSubmit,
  onLoadMore,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spin tip="加载记录..." />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="暂无学习记录"
        className="py-8"
      />
    );
  }

  return (
    <div>
      {records.map((record) => (
        <RecordItem
          key={record.id}
          record={record}
          onViewDetail={onViewDetail}
          onViewImages={onViewImages}
          onGrade={onGrade}
          onSubmit={onSubmit}
        />
      ))}
      {onLoadMore && (
        <div className="text-center pt-3 border-t border-gray-100">
          <Button size="small" className="rounded-full">📥 加载更多</Button>
        </div>
      )}
    </div>
  );
};