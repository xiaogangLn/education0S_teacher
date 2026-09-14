import React from 'react';
import { Button, Tag } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import type { ReviewItem as ReviewItemType } from '../types';
import { statusLabelMap } from '../constants';

interface ReviewItemProps {
  item: ReviewItemType;
  actionLoading?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onViewDetail?: (id: string) => void;
  onResubmit?: (id: string) => void;
}

export const ReviewItem: React.FC<ReviewItemProps> = ({
  item,
  actionLoading = false,
  onApprove,
  onReject,
  onViewDetail,
  onResubmit,
}) => {
  const statusLabel = statusLabelMap[item.status];
  const isRejected = item.status === 'rejected';
  const isPending = item.status === 'pending' || item.status === 'reviewing';

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-blue-300 transition-all">
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-800">{item.title}</span>
          <Tag color={isPending ? 'warning' : isRejected ? 'error' : 'success'}>
            {statusLabel}
          </Tag>
          {item.aiGenerated && (
            <Tag color="purple" className="text-xs">🤖 AI生成</Tag>
          )}
        </div>
        <span className="text-sm text-gray-400">提交：{item.submittedAt}</span>
      </div>

      <div className="text-sm text-gray-500 mt-1">
        👨‍🏫 {item.author} · {item.className} · {item.subject} · 共{item.课时}课时
      </div>

      <div className="text-sm text-gray-600 mt-1">
        {item.description}
      </div>

      {isRejected && item.rejectReason && (
        <div className="text-sm text-red-500 mt-1">
          📌 驳回原因：{item.rejectReason}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        {isPending && (
          <>
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              className="rounded-full bg-green-500 hover:!bg-green-600"
              loading={actionLoading}
              onClick={() => onApprove?.(item.id)}
            >
              通过
            </Button>
            <Button
              size="small"
              danger
              icon={<CloseOutlined />}
              className="rounded-full"
              disabled={actionLoading}
              onClick={() => onReject?.(item.id)}
            >
              驳回
            </Button>
          </>
        )}
        {isRejected && (
          <Button
            size="small"
            type="primary"
            className="rounded-full"
            loading={actionLoading}
            onClick={() => onResubmit?.(item.id)}
          >
            重新提交
          </Button>
        )}
        <Button
          size="small"
          type="link"
          icon={<EyeOutlined />}
          onClick={() => onViewDetail?.(item.id)}
        >
          查看详情
        </Button>
      </div>
    </div>
  );
};
