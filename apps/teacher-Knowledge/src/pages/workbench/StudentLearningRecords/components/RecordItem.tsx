// components/RecordItem.tsx - 更新，根据状态显示不同按钮
import React from 'react';
import { Tag, Button } from 'antd';
import type { LearningRecord } from '../types';

interface RecordItemProps {
  record: LearningRecord;
  onViewDetail: (record: LearningRecord) => void;
  onViewImages: (record: LearningRecord) => void;
  onGrade: (record: LearningRecord) => void;
  onSubmit: (record: LearningRecord) => void;
}

export const RecordItem: React.FC<RecordItemProps> = ({
  record,
  onViewDetail,
  onViewImages,
  onGrade,
  onSubmit,
}) => {
  const statusMap = {
    pending: { color: 'orange', label: '📤 待提交' },
    submitted: { color: 'processing', label: '⏳ 待审核' },
    graded: { color: 'success', label: '✅ 已完成' },
  };

  const statusInfo = statusMap[record.status] || statusMap.pending;

  // 获取状态对应的操作按钮
  const getActionButtons = () => {
    switch (record.status) {
      case 'pending':
        return (
          <>
            <Button size="small" onClick={() => onViewDetail(record)}>📄 查看题目</Button>
            <Button size="small" type="primary" onClick={() => onSubmit(record)}>
              📤 提交作业(写课堂反馈)
            </Button>
          </>
        );
      case 'submitted':
        return (
          <>
            <Button size="small" onClick={() => onViewDetail(record)}>📄 查看题目</Button>
            <Button size="small" type="primary" onClick={() => onGrade(record)}>
              ✏️ 批改
            </Button>
          </>
        );
      case 'graded':
        return (
          <>
            <Button size="small" onClick={() => onViewDetail(record)}>
              📄 查看详情
            </Button>
            {record.images && record.images.length > 0 && (
              <Button size="small" onClick={() => onViewImages(record)}>
                📸 查看图片
              </Button>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <span className="font-semibold text-gray-800">{record.title}</span>
          <Tag color={statusInfo.color} className="ml-2 text-xs">{statusInfo.label}</Tag>
        </div>
        <span className="text-xs text-gray-400">{record.createdAt}</span>
      </div>

      <div className="text-xs text-gray-400 mt-1">
        📚 {record.subject} · {record.className} · 关联教案: {record.lessonPlanTitle}
        {record.section === 'in_class' && <Tag color="blue" className="ml-2 text-xs">随堂练习</Tag>}
        {record.section === 'homework' && <Tag color="purple" className="ml-2 text-xs">课后练习</Tag>}
        {typeof record.commonCount === 'number' && <Tag className="ml-1 text-xs">必做 {record.commonCount}</Tag>}
        {typeof record.personalizedCount === 'number' && <Tag color="orange" className="ml-1 text-xs">个性化 {record.personalizedCount}</Tag>}
      </div>

      <div className="flex gap-4 mt-2 text-sm flex-wrap">
        <span>
          📊 得分: <strong style={{ color: record.status === 'graded' ? '#4f46e5' : '#f59e0b' }}>
            {record.status === 'graded' ? `${record.score}/${record.totalScore}` : '待批改'}
          </strong>
        </span>
        {record.masteryRate !== undefined && (
          <span>
            📈 掌握度: <Tag color={record.masteryRate >= 70 ? 'green' : 'gold'}>
              {record.masteryRate}%
            </Tag>
          </span>
        )}
        {record.timeSpent && <span>⏱️ 用时: {record.timeSpent}min</span>}
        {record.images && record.images.length > 0 && (
          <span className="text-blue-500">📸 {record.images.length}张图片</span>
        )}
        {record.submittedAt && (
          <span className="text-gray-400">📤 提交: {record.submittedAt}</span>
        )}
        {record.gradedAt && (
          <span className="text-gray-400">✅ 批改: {record.gradedAt}</span>
        )}
      </div>

      <div className="flex gap-2 mt-2 flex-wrap">
        {getActionButtons()}
      </div>
    </div>
  );
};