// components/ExportHistory.tsx
import React from 'react';
import { Tag, Button, Tooltip } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import type { ExportTask } from '../types';

interface ExportHistoryProps {
  tasks: ExportTask[];
  onClear?: () => void;
}

export const ExportHistory: React.FC<ExportHistoryProps> = ({
  tasks,
  onClear,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl p-5 border border-gray-100">
        <div className="text-center text-gray-400 text-sm py-4">
          📭 暂无导出记录
        </div>
      </div>
    );
  }

  const getStatusConfig = (status: ExportTask['status']) => {
    const configs = {
      pending: { icon: <LoadingOutlined className="text-yellow-500" />, color: 'warning', label: '等待中' },
      processing: { icon: <LoadingOutlined className="text-blue-500 spin" />, color: 'processing', label: '处理中' },
      completed: { icon: <CheckCircleOutlined className="text-green-500" />, color: 'success', label: '已完成' },
      failed: { icon: <CloseCircleOutlined className="text-red-500" />, color: 'error', label: '失败' },
    };
    return configs[status];
  };

  const getFormatLabel = (format: ExportTask['format']) => {
    const labels = {
      excel: 'Excel',
      pdf: 'PDF',
      csv: 'CSV',
      json: 'JSON',
    };
    return labels[format] || format;
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold text-base">📜 导出历史</span>
        {tasks.length > 0 && onClear && (
          <Button size="small" onClick={onClear} className="text-gray-400">
            清空记录
          </Button>
        )}
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {tasks.map(task => {
          const status = getStatusConfig(task.status);
          return (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {status.icon}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-800 truncate">
                    {task.name}
                  </span>
                  <Tag color={status.color} className="text-xs">
                    {status.label}
                  </Tag>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{getFormatLabel(task.format)}</span>
                  <span>·</span>
                  <span>{task.createdAt}</span>
                  {task.status === 'completed' && task.downloadUrl && (
                    <>
                      <span>·</span>
                      <a href={task.downloadUrl} className="text-blue-500 hover:text-blue-700">
                        下载
                      </a>
                    </>
                  )}
                  {task.status === 'failed' && task.error && (
                    <Tooltip title={task.error}>
                      <span className="text-red-400 cursor-help">⚠️ 失败</span>
                    </Tooltip>
                  )}
                </div>
              </div>
              {task.status === 'processing' && (
                <div className="text-xs text-gray-400">
                  {task.progress}%
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};