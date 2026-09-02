// components/DocumentFooter.tsx
import React from 'react';
import { Badge, Tooltip } from 'antd';
import { SaveOutlined, TeamOutlined, CheckCircleOutlined } from '@ant-design/icons';

interface DocumentFooterProps {
  wordCount: number;
  knowledgePointCount: number;
  version: number;
  lastSavedAt: string | null;
  isSaving: boolean;
  collaborators: string[];
  onlineCount: number;
}

export const DocumentFooter: React.FC<DocumentFooterProps> = ({
  wordCount,
  knowledgePointCount,
  version,
  lastSavedAt,
  isSaving,
  collaborators,
  onlineCount,
}) => {
  return (
    <div className="flex-shrink-0 flex flex-wrap justify-between items-center mt-4 pt-3 border-t border-gray-200 text-sm text-gray-500">
      <div className="flex items-center gap-4 flex-wrap">
        <span className="bg-gray-100 px-3 py-1 rounded-full">
          📊 {wordCount} 字 · {knowledgePointCount} 个知识点
        </span>
        <span className="flex items-center gap-1 text-green-500">
          {isSaving ? (
            <SaveOutlined className="animate-spin" />
          ) : (
            <CheckCircleOutlined />
          )}
          {isSaving ? '保存中...' : `已保存 ${lastSavedAt || '刚刚'}`}
        </span>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <span className="bg-gray-100 px-3 py-1 rounded-full">
          📌 v{version}
        </span>
        <Tooltip title={`协作中 ${collaborators.length} 人`}>
          <span className="flex items-center gap-1">
            <TeamOutlined />
            {collaborators.length > 0 ? (
              <Badge count={collaborators.length} className="mx-1" />
            ) : null}
          </span>
        </Tooltip>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          {onlineCount} 人在线
        </span>
      </div>
    </div>
  );
};