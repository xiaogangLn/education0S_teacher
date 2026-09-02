// components/ExportActions.tsx
import React from 'react';
import { Button, Progress } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';

interface ExportActionsProps {
  onBatchExport: () => void;
  onGenerateRecord: () => void;
  onReset: () => void;
  exporting: boolean;
  progress: number;
  selectedCount: number;
  disabled?: boolean;
}

export const ExportActions: React.FC<ExportActionsProps> = ({
  onBatchExport,
  onReset,
  exporting,
  progress,
  selectedCount,
  disabled = false,
}) => {
  return (
    <div className="">
      {exporting && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>⏳ 导出中...</span>
            <span>{progress}%</span>
          </div>
          <Progress
            percent={progress}
            status={progress === 100 ? 'success' : 'active'}
            strokeColor={{
              from: '#4f46e5',
              to: '#7c3aed',
            }}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          type="primary"
          size="large"
          icon={<DownloadOutlined />}
          onClick={onBatchExport}
          loading={exporting}
          disabled={disabled || selectedCount === 0}
          className="rounded-full px-6"
        >
          导出选中的数据 {selectedCount > 0 && `(${selectedCount}项)`}
        </Button>

        {/* <Button
          size="large"
          icon={<FileTextOutlined />}
          onClick={onGenerateRecord}
          disabled={exporting}
          className="rounded-full px-6"
        >
          生成导出记录
        </Button> */}

        <Button
          size="large"
          icon={<ReloadOutlined />}
          onClick={onReset}
          disabled={exporting}
          className="rounded-full px-6 ml-auto"
        >
          重置选择
        </Button>
      </div>

      {selectedCount === 0 && !exporting && (
        <div className="mt-3 text-sm text-yellow-500">
          ⚠️ 请至少选择一个导出范围
        </div>
      )}
    </div>
  );
};